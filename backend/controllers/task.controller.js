import Task from "../models/task.model.js";
import { taskValidationSchema } from "../schema/task.schema.js";

// Add a new Task
export async function addTask(req, res) {
  try {
    const { project, taskDetail, status, userId } = req.body;

    const task = new Task({ project, taskDetail, status, userId });

    await task.save();

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Update a Task
export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { project, taskDetail, status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { project, taskDetail, status },
      { new: true } // return updated document
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

// Delete a Task
export async function deleteTask(req, res) {
  try {
    const { id } = req.params;

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
    const tasks = await Task.find()
      .populate("userId", "userName")
      .select("-__v");

    // ✅ Only include tasks that have a valid userId and userName
    const formattedTasks = tasks
      .filter(task => task.userId && task.userId.userName) // remove N/A or null users
      .map(task => ({
        _id: task._id,
        userId: task.userId._id,
        userName: task.userId.userName,
        project: task.project,
        taskDetail: task.taskDetail,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));

    res.status(200).json({ success: true, data: formattedTasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


// Get tasks by userId
export async function getTasksByUserId(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const tasks = await Task.find({ userId }).select("-__v"); // keep createdAt & updatedAt

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching tasks by userId:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Get single task by ID
export async function getTaskById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Task ID is required" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
