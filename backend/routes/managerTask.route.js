import express from "express";
import {
  addManagerTask,
  updateManagerTask,
  deleteManagerTask,
  getManagerTasks,
} from "../controllers/managerTask.controller.js";

import validateResource from "../middleware/validateResource.js"; // Joi validator
import { managerTaskValidationSchema } from "../schema/managerTask.schema.js";

const router = express.Router();

// ✅ Add a task to a project
router.post("/add", validateResource(managerTaskValidationSchema), addManagerTask);

// ✅ Update a task
router.put("/update", updateManagerTask); 
// expects { taskId, taskDetail, assignedTo } in body

// ✅ Delete a task
router.delete("/delete", deleteManagerTask); 
// expects { taskId } in body

// ✅ Get all tasks for a project
router.get("/:projectId", getManagerTasks); 
// fetch tasks of a project by its ID

export default router;
