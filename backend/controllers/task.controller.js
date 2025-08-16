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
