import express from "express";
import {
  addTask,
  getAllTasks,
  getTasksByUserId,
} from "../controllers/task.controller.js";
import { taskValidationSchema } from "../schema/task.schema.js";
import validateResource from "../middleware/validateResource.js";

const router = express.Router();

// @route   POST /api/users/createTask
router.post("/createTask", validateResource(taskValidationSchema), addTask);
router.get("/tasks/:userId", getTasksByUserId);
router.get("/alltask", getAllTasks);

export default router;
