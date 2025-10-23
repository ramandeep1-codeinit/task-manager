// context/ProjectContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/lib/api";

export interface Project {
  _id: string;
  projectName: string;
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  getProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const getProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects/all");
      setProjects(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, loading, getProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used within ProjectProvider");
  return context;
};
