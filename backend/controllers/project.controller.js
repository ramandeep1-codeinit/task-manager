// controllers/projectController.js
import Project from "../models/project.model.js";

// ✅ Create Project
export const createProject = async (req, res) => {
  try {
    const { projectName } = req.body;
    if (!projectName) {
      return res
        .status(400)
        .json({ success: false, message: "Project name is required" });
    }

    const newProject = await Project.create({ projectName });
    res
      .status(201)
      .json({ success: true, message: "Project created successfully", data: newProject });
  } catch (error) {
    console.error("Create Project Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create project", error: error.message });
  }
};

// ✅ Get All Projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res
      .status(200)
      .json({ success: true, message: "Projects fetched successfully", data: projects });
  } catch (error) {
    console.error("Get All Projects Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch projects", error: error.message });
  }
};

// ✅ Delete Project by ID
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete project", error: error.message });
  }
};

// ✅ Update Project by ID
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName } = req.body;

    if (!projectName) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { projectName },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project updated successfully", data: updatedProject });
  } catch (error) {
    console.error("Update Project Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update project", error: error.message });
  }
};


export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ project });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
