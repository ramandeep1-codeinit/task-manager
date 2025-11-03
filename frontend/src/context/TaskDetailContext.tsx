"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import api from "@/lib/api";

export interface TaskDetail {
  _id: string;
  taskDetail: string;
  project: { _id: string; projectName: string };
  assignedTo?: { _id: string; userName: string };
  createdBy?: any;
  status?: "pending" | "completed";
  dueDate?: string;
  createdAt: string;
}

interface TaskDetailContextType {
  tasks: TaskDetail[];
  loading: boolean;
  error: string | null;

  getAssignedTasks: (userId: string) => Promise<void>;
  getTasksByProject: (projectId: string) => Promise<void>;

  createTask: (data: any) => Promise<void>;
  updateTask: (id: string, updates: any) => Promise<void>;
  markTaskDone: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const TaskDetailContext = createContext<TaskDetailContextType | undefined>(
  undefined
);

export const TaskDetailProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<TaskDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FETCH ASSIGNED TASKS
  const getAssignedTasks = async (userId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/taskDetail/assigned/${userId}`);

      const sorted = [...(res.data?.tasks || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTasks(sorted);
      setError(null);
    } catch (err) {
      console.error("Failed to load assigned tasks:", err);
      setError("Unable to load assigned tasks");
    } finally {
      setLoading(false);
    }
  };

  // FETCH TASKS BY PROJECT
  const getTasksByProject = async (projectId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/taskDetail/project/${projectId}`);

      const sorted = [...(res.data?.tasks || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTasks(sorted);
      setError(null);
    } catch (err) {
      console.error("Failed to load project tasks:", err);
      setError("Unable to load project tasks");
    } finally {
      setLoading(false);
    }
  };

  // CREATE TASK
  const createTask = async (data: any) => {
    try {
      const res = await api.post(`/taskDetail/create`, data);
      // console.log("Create Task Response:", res.data);
      if (res.data?.task) {
        setTasks((prev) => [...prev, res.data.task]);
      }
    } catch (err) {
      console.error("Create task error:", err);
      throw err;
    }
  };

  // UPDATE TASK
  const updateTask = async (id: string, updates: any) => {
    try {
      const res = await api.put(`/taskDetail/${id}`, updates);
      const updated = res.data.task;

      if (!updated) return;

      setTasks((prev) =>
        prev.map((t) => (t._id === id ? updated : t))
      );
    } catch (err) {
      console.error("Update task failed:", err);
      throw err;
    }
  };

  // MARK TASK DONE
  const markTaskDone = async (id: string) => {
    try {
      const res = await api.put(`/taskDetail/${id}/mark-done`);
      const updated = res.data.task;

      if (!updated) return;

      setTasks((prev) =>
        prev.map((t) => (t._id === id ? updated : t))
      );
    } catch (err) {
      console.error("Mark done failed:", err);
      throw err;
    }
  };

  // DELETE TASK
  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/taskDetail/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete task failed:", err);
      throw err;
    }
  };


  return (
    <TaskDetailContext.Provider
      value={{
        tasks,
        loading,
        error,

        getAssignedTasks,
        getTasksByProject,

        createTask,
        updateTask,
        markTaskDone,
        deleteTask,
      }}
    >
      {children}
    </TaskDetailContext.Provider>
  );
};

export const useTaskDetail = () => {
  const context = useContext(TaskDetailContext);
  if (!context) {
    throw new Error("useTaskDetail must be used within TaskDetailProvider");
  }
  return context;
};
