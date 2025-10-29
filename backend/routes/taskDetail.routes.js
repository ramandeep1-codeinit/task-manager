import express from "express";
import {
  createTaskDetail,
  getTasksByProject,
  updateTaskDetail,
  deleteTaskDetail,
  getTasksAssignedToUser,
  markTaskDone,
} from "../controllers/taskDetail.controller.js";

const router = express.Router();

// Create a new task
router.post("/create", createTaskDetail);

// Get all tasks for a specific project (by projectId)
router.get("/project/:projectId", getTasksByProject);

// Update task details (by task id)
router.put("/:id", updateTaskDetail);

// Delete a task (by task id)
router.delete("/:id", deleteTaskDetail);

// Get all tasks assigned to a specific user (by userId)
router.get("/assigned/:userId", getTasksAssignedToUser);

// Mark a task as done (by task id)
router.put("/:id/mark-done", markTaskDone);

export default router;
