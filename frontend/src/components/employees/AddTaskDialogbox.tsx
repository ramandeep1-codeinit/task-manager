"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { notifyError, notifySuccess } from "@/lib/toast";


export interface Task {
  _id?: string;
  project: string;
  taskDetail: string;
  status: string;
  userId: string;
  role: string;
  userName: string;
}

interface Project {
  _id: string;
  projectName: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: Task;
  onSubmit: (task: Task) => Promise<void>;
}

// Status options
const STATUS_OPTIONS = ["pending", "in-progress", "completed"];

export default function AddTaskDialog({ open, setOpen, initialData, onSubmit }: Props) {
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setProjectSearchQuery("");
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize form data and fetch projects
  useEffect(() => {
    if (!open || !user) return;

    setFormData({
      _id: initialData?._id,
      userName: initialData?.userName || user.name || "",
      project: initialData?.project || "",
      taskDetail: initialData?.taskDetail || "",
      status: initialData?.status || "pending",
      userId: initialData?.userId || user.id || "",
      role: initialData?.role || user.role || "",
    });

    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/projects/all");
        setProjects(res.data.data || res.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [open, initialData, user]);

  const handleChange = (name: keyof Task, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.project || !formData.taskDetail) {
    notifyError("Please fill in all required fields");
    return;
  }

  if (!user) {
    notifyError("User not found. Please log in again.");
    return;
  }

  try {
  await onSubmit(formData);
  setOpen(false);
} catch (error) {
  console.error("Error saving task:", error);
  notifyError("Failed to save task. Please try again.");
}

};


  const filteredProjects = projects.filter((p) =>
    p.projectName.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the task details." : "Select a project and enter task details."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Project Dropdown */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right pt-2">
              Project
            </Label>

            <div className="col-span-3 relative" ref={dropdownRef}>
              <div
                className="w-full border border-gray-300 rounded-lg bg-white shadow-sm px-3 py-2 cursor-pointer flex items-center justify-between hover:border-gray-300"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>{formData.project || "-- Select Project --"}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {dropdownOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20 mt-1">
                  <div className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="Search project..."
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                      autoFocus
                    />
                  </div>

                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((p) => (
                      <div
                        key={p._id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          handleChange("project", p.projectName);
                          setDropdownOpen(false);
                          setProjectSearchQuery("");
                        }}
                      >
                        {p.projectName}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">No projects found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Task Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="desc" className="text-right pt-2">
              Description
            </Label>
            <textarea
              id="desc"
              value={formData.taskDetail}
              onChange={(e) => handleChange("taskDetail", e.target.value)}
              className="col-span-3 border border-gray-300 rounded-md px-3 py-2 resize-none"
              placeholder="Enter task description"
              rows={4}
            />
          </div>

          {/* Status Dropdown (custom) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <div className="col-span-3 relative" ref={statusDropdownRef}>
              <div
                className="w-full border border-gray-300 rounded-lg bg-white shadow-sm px-3 py-2 cursor-pointer flex items-center justify-between hover:border-gray-300"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              >
                <span>{formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${statusDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {statusDropdownOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1">
                  {STATUS_OPTIONS.map((status) => (
                    <div
                      key={status}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        handleChange("status", status);
                        setStatusDropdownOpen(false);
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-primary text-white w-full">
            {initialData ? "Update Task" : "Save Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
