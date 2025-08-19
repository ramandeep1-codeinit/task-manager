import express from "express";
import {
  addTask,
  deleteTask,
  getAllTasks,
  getTasksByUserId,
  updateTask,
} from "../controllers/task.controller.js";
import { taskUpdateValidationSchema, taskValidationSchema } from "../schema/task.schema.js";
import validateResource from "../middleware/validateResource.js";

const router = express.Router();

// @route   POST /api/users/createTask
router.post("/createTask", validateResource(taskValidationSchema), addTask);
router.get("/tasks/:userId", getTasksByUserId);
router.get("/task/all", getAllTasks);
router.put("/update/tasks/:id", validateResource(taskUpdateValidationSchema) ,updateTask); // update
router.delete("/delete/tasks/:id", deleteTask); 

export default router;
