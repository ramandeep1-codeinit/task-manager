import Task from "../models/task.model.js";
import { taskValidationSchema } from "../schema/task.schema.js";

export async function addTask(req, res) {
  try {
    const { userName, project, taskDetail, status, userId } = req.body;

    // Direct DB interaction (service logic here)
    const task = new Task({
      userName,
      project,
      taskDetail,
      status,
      userId,
    });

    await task.save();

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// UPDATE Task
export async function updateTask(req, res) {
  try {
    const { id } = req.params; // taskId from URL
    const { userName, project, taskDetail, status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { userName, project, taskDetail, status },
      { new: true } // returns updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// DELETE Task
export async function deleteTask(req, res) {
  try {
    const { id } = req.params; // taskId from URL

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getAllTasks(req, res) {
  try {
    const tasks = await Task.find(); // Fetch all tasks from DB

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getTasksByUserId(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const tasks = await Task.find({ userId });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks by userId:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


export async function getTaskById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}