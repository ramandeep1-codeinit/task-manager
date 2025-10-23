// context/TaskContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import api from "@/lib/api";

// ✅ Task interface
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

// ✅ Context interface
interface TaskContextType {
  tasks: Task[];
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  loading: boolean;
  error: string;
  getTasks: (role: string, userId?: string) => Promise<void>;
  getTaskById: (id: string) => Promise<Task | null>;
  createTask: (task: Task) => Promise<void>;
  updateTask: (id: string, task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

// ✅ Create context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// ✅ Provider
export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch tasks based on role
  const getTasks = useCallback(async (role: string, userId?: string) => {
    setLoading(true);
    setError("");
    try {
      const res =
        role === "manager"
          ? await api.get("/task/all")          // Manager sees all tasks
          : await api.get(`/tasks/${userId}`); // Employee sees own tasks
      setTasks(res.data.data || res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Get single task by ID
  const getTaskById = async (id: string): Promise<Task | null> => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/tasksbyId/${id}`);
      return res.data.data || res.data;
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch task");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create task
  const createTask = async (taskData: Task) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/createTask", taskData);
      setTasks(prev => [...prev, res.data]);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update task
  const updateTask = async (id: string, taskData: Task) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.put(`/update/tasks/${id}`, taskData);
      setTasks(prev => prev.map(t => (t._id === id ? { ...t, ...res.data } : t)));
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete task
  const deleteTask = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await api.delete(`/delete/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        selectedTask,
        setSelectedTask,
        loading,
        error,
        getTasks,
        getTaskById,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// ✅ Custom hook
export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask must be used within TaskProvider");
  return context;
};
