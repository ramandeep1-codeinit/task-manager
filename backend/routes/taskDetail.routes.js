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

router.post("/create", createTaskDetail);           
router.get("/project/:projectId", getTasksByProject);
router.put("/:id", updateTaskDetail);                
router.delete("/:id", deleteTaskDetail);  
router.get("/assigned/:userId", getTasksAssignedToUser);

router.put("/:id/mark-done", markTaskDone);

export default router;
