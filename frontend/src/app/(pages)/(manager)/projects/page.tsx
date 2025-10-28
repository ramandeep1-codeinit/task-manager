"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { notifySuccess, notifyError, notifyWarning, notifyDelete } from "@/lib/toast";
import { useRouter } from "next/navigation";

// Debounce hook
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface Project {
  _id: string;
  projectName: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  const debouncedSearch = useDebounce(projectSearchQuery, 300);

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/projects/all`);
      setProjects(data?.data || []);
    } catch {
      notifyError("Failed to fetch projects");
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleAddProject = useCallback(async () => {
    if (!newProject.trim()) return notifyWarning("Please enter a project name");
    setAdding(true);
    try {
      await axios.post(`${API_BASE_URL}/projects/create`, { projectName: newProject.trim() });
      setNewProject("");
      await fetchProjects();
      notifySuccess("Project added successfully");
    } catch {
      notifyError("Failed to add project");
    } finally {
      setAdding(false);
    }
  }, [newProject, fetchProjects]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingProject?.projectName.trim()) return notifyWarning("Project name cannot be empty");
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/projects/${editingProject._id}`, {
        projectName: editingProject.projectName.trim(),
      });
      setEditingProject(null);
      setOpenEditDialog(false);
      await fetchProjects();
      notifySuccess("Project updated successfully");
    } catch {
      notifyError("Failed to update project");
    } finally {
      setSaving(false);
    }
  }, [editingProject, fetchProjects]);

  const handleDeleteProject = useCallback(async () => {
    if (!deleteProject) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/projects/${deleteProject._id}`);
      setDeleteProject(null);
      await fetchProjects();
      notifyDelete("Project deleted successfully");
    } catch {
      notifyError("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  }, [deleteProject, fetchProjects]);

  const handleCancelEdit = () => { setEditingProject(null); setOpenEditDialog(false); };

  const filteredProjects = useMemo(() => {
    if (!debouncedSearch.trim()) return projects;
    const query = debouncedSearch.toLowerCase();
    return projects.filter((proj) => proj.projectName.toLowerCase().includes(query));
  }, [projects, debouncedSearch]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <CardTitle className="text-xl font-bold flex items-center gap-4">Manage Projects</CardTitle>
        <Input
          placeholder="Search project..."
          value={projectSearchQuery}
          onChange={(e) => setProjectSearchQuery(e.target.value)}
          className="max-w-xs h-10"
        />
      </CardHeader>

      <CardContent>
        {/* Add Project */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <Input
            placeholder="Enter new project name"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            className="flex-1 h-10"
          />
          <Button onClick={handleAddProject} disabled={adding} className="h-10 flex items-center gap-1">
            <Plus className="w-4 h-4" /> {adding ? "Adding..." : "Add Project"}
          </Button>
        </div>

        {/* Project List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <p className="text-gray-500">No matching results found.</p>
          ) : (
            filteredProjects.map((proj) => (
              <div
                key={proj._id}
                className="flex justify-between items-center bg-white px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <button
                  className="text-left font-semibold flex-1 text-gray-800 hover:underline"
                  onClick={() => router.push(`/projects/${proj._id}`)}
                >
                  {proj.projectName}
                </button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingProject(proj); setOpenEditDialog(true); }}>
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteProject(proj)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Project Dialog */}
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update the project name below</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Project Name"
                value={editingProject?.projectName || ""}
                onChange={(e) =>
                  setEditingProject((prev) => prev ? { ...prev, projectName: e.target.value } : prev)
                }
              />
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                <Button onClick={handleSaveEdit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Project Dialog */}
        <Dialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <span className="font-semibold">{deleteProject?.projectName}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteProject(null)} disabled={deleting}>Cancel</Button>
              <Button className="bg-red-500 text-white" onClick={handleDeleteProject} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
