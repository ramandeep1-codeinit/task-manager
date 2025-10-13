"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

interface Project {
  _id: string;
  projectName: string; // Match API field
}

interface Task {
  _id?: string;
  userName: string;
  project: string;
  taskDetail: string;
  status: string;
  userId: string;
  role: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (task: Task) => Promise<void>;
  initialData?: Task;
}

export default function AddTaskDialog({
  open,
  setOpen,
  onSubmit,
  initialData,
}: Props) {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<Task>({
    userName: "",
    project: "",
    taskDetail: "",
    status: "pending",
    userId: "",
    role: "",
  });

  // Fetch projects when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/projects/all");
        const projectList: Project[] = res.data.data || res.data;
        setProjects(projectList);

        // Set default project after fetching
        setFormData((prev) => ({
          ...prev,
          project:
            initialData?.project ||
            (projectList.length > 0 ? projectList[0].projectName : ""),
        }));
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [open, initialData]);

  // Populate other form data
  useEffect(() => {
    if (!open) return;

    setFormData((prev) => ({
      ...prev,
      userName: initialData?.userName || user?.name || "",
      taskDetail: initialData?.taskDetail || "",
      status: initialData?.status || "pending",
      userId: initialData?.userId || user?.id || "",
      role: initialData?.role || user?.role || "",
      _id: initialData?._id,
    }));
  }, [initialData, user, open]);

  const handleChange = (name: keyof Task, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const taskToSubmit: Task = {
      ...formData,
      userId: user.id,
      userName: user.name,
      role: user.role,
    };

    await onSubmit(taskToSubmit);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the task details."
              : "Select a project and enter task details."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Project Dropdown */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">Project</Label>
            <select
              id="project"
              value={formData.project}
              onChange={(e) => handleChange("project", e.target.value)}
              className="col-span-3 border bg-white border-gray-300 rounded-md px-3 py-2 text-black"
            >
              {projects.length === 0 ? (
                <option value="" disabled>No projects available</option>
              ) : (
                projects.map((p) => (
                  <option key={p._id} value={p.projectName}>
                    {p.projectName}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Task Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="desc" className="text-right">Description</Label>
            <Input
              id="desc"
              value={formData.taskDetail}
              onChange={(e) => handleChange("taskDetail", e.target.value)}
              className="col-span-3"
              placeholder="Enter task description"
            />
          </div>

          {/* Status Dropdown */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="col-span-3 border bg-white border-gray-300 rounded-md px-3 py-2 text-black"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-primary text-white">
            {initialData ? "Update Task" : "Save Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
