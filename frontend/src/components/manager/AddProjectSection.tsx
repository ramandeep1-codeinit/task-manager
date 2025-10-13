"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import ProjectTaskDashboard from "./AddProjectTask";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { notifySuccess, notifyError, notifyWarning, notifyDelete } from "@/lib/toast";

interface Project {
  _id: string;
  projectName: string;
}

export default function AddProjectSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  // Delete confirmation
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Selected project for tasks
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/projects/all");
      setProjects(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      notifyError("Failed to fetch projects");
    }
  };

  const handleAddProject = async () => {
    if (!newProject.trim()) {
      notifyWarning("Please enter a project name");
      return;
    }
    try {
      await axios.post("http://localhost:8080/api/projects/create", {
        projectName: newProject,
      });
      setNewProject("");
      fetchProjects();
      notifySuccess("Project added successfully");
    } catch (err) {
      console.error("Failed to add project:", err);
      notifyError("Failed to add project");
    }
  };

  const openEditDialog = (id: string, name: string) => {
    setEditingProjectId(id);
    setEditingProjectName(name);
    setOpenDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProjectId || !editingProjectName.trim()) {
      notifyWarning("Project name cannot be empty");
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/projects/${editingProjectId}`, {
        projectName: editingProjectName,
      });
      setEditingProjectId(null);
      setEditingProjectName("");
      setOpenDialog(false);
      fetchProjects();
      notifySuccess("Project updated successfully");
    } catch (err) {
      console.error("Failed to update project:", err);
      notifyError("Failed to update project");
    }
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingProjectName("");
    setOpenDialog(false);
  };

  const handleDeleteProject = async () => {
    if (!deleteProject) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/projects/${deleteProject._id}`);
      fetchProjects();
      notifyDelete("Project deleted successfully");
      setDeleteProject(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
      notifyError("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Manage Projects</CardTitle>
      </CardHeader>
      <CardContent>
        {/* If a project is selected, show ProjectTaskDashboard */}
        {selectedProject ? (
          <ProjectTaskDashboard
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
          />
        ) : (
          <>
            {/* Add Project Form */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter new project name"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
              />
              <Button onClick={handleAddProject}>Add</Button>
            </div>

            {/* Project List */}
            <div className="space-y-2">
              {projects.length === 0 ? (
                <p className="text-gray-500">No projects available.</p>
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj._id}
                    className="flex justify-between items-center bg-white px-4 py-2 border rounded-md"
                  >
                    <button
                      className="text-left flex-1"
                      onClick={() => setSelectedProject(proj)}
                    >
                      {proj.projectName}
                    </button>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(proj._id, proj.projectName)}
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteProject(proj)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Edit Project Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update the project name below</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Project Name"
                value={editingProjectName}
                onChange={(e) => setEditingProjectName(e.target.value)}
              />
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteProject?.projectName}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteProject(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white"
                onClick={handleDeleteProject}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
