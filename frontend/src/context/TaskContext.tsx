"use client";

import api from "@/lib/api";
// context/TaskContext.tsx
import axios from "axios";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Task {
  _id?: string;
  project: string;
  taskDetail: string;
  status: string;
   userId: string;
  role: string;
  userName: string; 
  createdAt?: string;
}

interface TaskContextType {
  tasks: Task[];
  createTask: (taskData: Omit<Task, "id">) => Promise<void>;
  getTasks: (role: string, userId?: string) => Promise<void>;
   getTaskById: (id: string) => Promise<Task | null>; 
   updateTask: (id: string, updatedData: Partial<Task> ,role: string, userId: string) => Promise<void>;
  deleteTask: (id: string ,role: string, userId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);


   const getTasks = async (role: string, userId?: string) => {
    try {
      let res;
      if (role == "Manager") {    // Assuming '1' is the role for manager
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

    // ✅ Get a single task by ID
  const getTaskById = async (id: string): Promise<Task | null> => {
    try {
      const res = await api.get(`/tasksbyId/${id}`);
      return res.data.data || res.data; // depending on backend response
    } catch (err) {
      console.error("Error fetching task by ID:", err);
      return null;
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
      const res = await api.post("/createTask", taskData);
      setTasks((prev) => [...prev, res.data]);
      getTasks(taskData.role, taskData.userId); // Refresh tasks after creation
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

    // ✅ Update task
  const updateTask = async (id: string, updatedData: Partial<Task> , userRole :any , userId: any) => {
    try {
      const res = await api.put(`update/tasks/${id}`, updatedData);
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? { ...task, ...res.data } : task))
      );
       getTasks(userRole, userId);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // ✅ Delete task
  const deleteTask = async (id: string, role: string, userId: string ) => {
    try {
      await api.delete(`delete/tasks/${id}`);
       setTasks((prev) => {
      const updatedTasks = prev.filter((task) => task._id !== id);
      console.log("Updated Tasks:", updatedTasks); // Debug
      return updatedTasks;
    });
      getTasks(role, userId);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };


  return (
    <TaskContext.Provider value={{ tasks, createTask, getTasks ,updateTask, deleteTask ,getTaskById}}>
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


