"use client";

import api from "@/lib/api";
// context/TaskContext.tsx
import axios from "axios";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Task {
  id?: string;
  project: string;
  taskDetail: string;
  status: string;
}

interface TaskContextType {
  tasks: Task[];
  createTask: (taskData: Omit<Task, "id">) => Promise<void>;
  getTasks: (role: string, userId?: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);

   const getTasks = async (role: string, userId?: string) => {
    try {
      let res;
      if (role == "1") {    // Assuming '1' is the role for manager
        // Manager can see all tasks
        res = await api.get("/task/all");
      } else {
        // Normal user can see only their tasks
        res = await api.get(`/tasks/${userId}`);
      }

      setTasks(res.data.data || res.data); // adjust based on backend response
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Create task API call
  const createTask = async (taskData: Omit<Task, "id">) => {
    try {
      //   const res = await fetch("/api/task", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(taskData),
      //   });

      //   const data = await res.json();
      //   if (!res.ok) throw new Error(data.message || "Failed to create task");

      //   setTasks((prev) => [...prev, data.data]); // append new task to state
      const res = await api.post("/users/createTask", taskData);
      setTasks((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, createTask, getTasks}}>
      {children}
    </TaskContext.Provider>
  );
};

// Hook for consuming context
export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
