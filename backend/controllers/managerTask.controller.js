import mongoose from "mongoose";
import Project from "../models/project.model.js";

// Add a task to a project
export async function addManagerTask(req, res) {
  try {
    const { project, taskDetail, createdBy, assignedTo } = req.body;

    // Validate required fields
    if (!project || !taskDetail || !createdBy) {
      return res.status(400).json({ success: false, message: "Project, taskDetail, and createdBy are required" });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(project) || !mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({ success: false, message: "Invalid project or manager ID" });
    }
    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ success: false, message: "Invalid assignedTo ID" });
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ success: false, message: "Project not found" });

    const newTask = {
      taskDetail,
      createdBy,
      assignedTo: assignedTo || null,
    };

    projectDoc.tasks.push(newTask);
    await projectDoc.save();

    // Return the newly added task
    res.status(201).json({ success: true, data: projectDoc.tasks[projectDoc.tasks.length - 1] });
  } catch (error) {
    console.error("Add Manager Task Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Update a task in a project
export async function updateManagerTask(req, res) {
  try {
    const { projectId, taskId, taskDetail, assignedTo } = req.body;

    if (!projectId || !taskId) {
      return res.status(400).json({ success: false, message: "Project ID and Task ID are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid project or task ID" });
    }

    const projectDoc = await Project.findById(projectId);
    if (!projectDoc) return res.status(404).json({ success: false, message: "Project not found" });

    const task = projectDoc.tasks.id(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (taskDetail) task.taskDetail = taskDetail;
    if (assignedTo !== undefined) {
      if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ success: false, message: "Invalid assignedTo ID" });
      }
      task.assignedTo = assignedTo;
    }

    await projectDoc.save();
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error("Update Manager Task Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Delete a task from a project
export async function deleteManagerTask(req, res) {
  try {
    const { projectId, taskId } = req.body;

    if (!projectId || !taskId) {
      return res.status(400).json({ success: false, message: "Project ID and Task ID are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid project or task ID" });
    }

    const projectDoc = await Project.findById(projectId);
    if (!projectDoc) return res.status(404).json({ success: false, message: "Project not found" });

    const task = projectDoc.tasks.id(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    task.remove();
    await projectDoc.save();

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Manager Task Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Get all tasks of a project
export async function getManagerTasks(req, res) {
  try {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ success: false, message: "Project ID is required" });
    if (!mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ success: false, message: "Invalid project ID" });

    const projectDoc = await Project.findById(projectId)
      .populate("tasks.createdBy", "userName role")
      .populate("tasks.assignedTo", "userName role");

    if (!projectDoc) return res.status(404).json({ success: false, message: "Project not found" });

    res.status(200).json({ success: true, data: projectDoc.tasks });
  } catch (error) {
    console.error("Get Manager Tasks Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
