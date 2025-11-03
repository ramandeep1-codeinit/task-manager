"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import api from "@/lib/api";

export interface Project {
  _id: string;
  projectName: string;
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;

  getProjects: () => Promise<void>;
  createProject: (projectName: string) => Promise<void>;
  updateProject: (id: string, projectName: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Promise<Project>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // GET ALL PROJECTS
  const getProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects/all");
      setProjects(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // CREATE PROJECT
  const createProject = async (projectName: string) => {
    try {
      await api.post("/projects/create", { projectName });
      await getProjects(); 
    } catch (error) {
      console.error("Failed to create project:", error);
      throw error;
    }
  };

  // UPDATE PROJECT
  const updateProject = async (id: string, projectName: string) => {
    try {
      await api.put(`/projects/${id}`, { projectName });
      await getProjects();
    } catch (error) {
      console.error("Failed to update project:", error);
      throw error;
    }
  };

  // GET PROJECT BY ID
  const getProjectById = async (id: string): Promise<Project> => {
    try {
      const res = await api.get(`/projects/${id}`);
      return res.data?.project;
    } catch (error) {
      console.error("Failed to fetch project:", error);
      throw error;
    }
  };

  // DELETE PROJECT
  const deleteProject = async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);
      await getProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      throw error;
    }
  };

  // auto-load projects on mount
  useEffect(() => {
    getProjects();
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        getProjects,
        createProject,
        updateProject,
        deleteProject,
        getProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return context;
};
