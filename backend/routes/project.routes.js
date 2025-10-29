import express from "express";
import { createProject, getAllProjects, deleteProject, updateProject, getProjectById } from "../controllers/project.controller.js";

const router = express.Router();

// Create a new project
router.post("/create", createProject);

// Get all projects
router.get("/all", getAllProjects);

// Get a specific project by its ID
router.get("/:id", getProjectById);

// Delete a project by its ID
router.delete("/:id", deleteProject);

// Update a project by its ID
router.put("/:id", updateProject);

export default router;
