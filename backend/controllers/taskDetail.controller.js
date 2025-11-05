import TaskDetail from "../models/taskDetail.model.js";
import mongoose from "mongoose";
import { taskDetailValidationSchema } from "../schema/taskDetail.schema.js";

export const createTaskDetail = async (req, res) => {
  try {
    // Validate input
    const { error } = taskDetailValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const { project, taskDetail, assignedTo, dueDate, createdBy } = req.body;

    const task = new TaskDetail({
      project,
      taskDetail,
      createdBy,
      assignedTo: assignedTo || undefined, // optional
      dueDate
    });

    await task.save();

    res.status(201).json({ success: true, message: "Task created successfully", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all tasks of a single project
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid Project ID" });
    }

    const tasks = await TaskDetail.find({ project: projectId })
      .populate("createdBy", "userName email")
      .populate("assignedTo", "userName email");

    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update a task by ID
export const updateTaskDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskDetail, status, assignedTo, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID" });
    }

    const updatedTask = await TaskDetail.findByIdAndUpdate(
      id,
      { taskDetail, status, assignedTo, dueDate },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete a task by ID
export const deleteTaskDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID" });
    }

    const deletedTask = await TaskDetail.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// GET /api/taskDetail/assigned/:userId
export const getTasksAssignedToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await TaskDetail.find({ assignedTo: userId })
      .populate("project", "projectName") // populate project info
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};



export const markTaskDone = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await TaskDetail.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = "completed";
    await task.save();

    res.status(200).json({ message: "Task marked as completed", task });
  } catch (error) {
    console.error("Error marking task as done:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

