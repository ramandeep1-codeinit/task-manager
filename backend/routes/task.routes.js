import express from "express";
import {
  addTask,
  deleteTask,
  getAllTasks,    // ← manager endpoint
  getTasksByUserId,
  getTaskById,
  updateTask,
} from "../controllers/task.controller.js";

import { taskUpdateValidationSchema, taskValidationSchema } from "../schema/task.schema.js";
import validateResource from "../middleware/validateResource.js";

const router = express.Router();

// Create Task
router.post("/createTask", validateResource(taskValidationSchema), addTask);


// Manager: Get all tasks
router.get("/users/task/all", getAllTasks); // <-- matches your frontend

// Employee: Get tasks by userId
router.get("/tasks/:userId", getTasksByUserId);

// Get task by ID
router.get("/tasksbyId/:id", getTaskById);

// Update Task
router.put("/update/tasks/:id", validateResource(taskUpdateValidationSchema), updateTask);

// Delete Task
router.delete("/delete/tasks/:id", deleteTask);

export default router;
