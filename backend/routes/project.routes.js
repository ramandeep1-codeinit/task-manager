import express from "express";
import { createProject, getAllProjects, deleteProject, updateProject, getProjectById } from "../controllers/project.controller.js";

const router = express.Router();

router.post("/create", createProject);
router.get("/all", getAllProjects);

router.get("/:id", getProjectById);
// Delete project route
router.delete("/:id", deleteProject);

router.put("/:id", updateProject);

export default router;
