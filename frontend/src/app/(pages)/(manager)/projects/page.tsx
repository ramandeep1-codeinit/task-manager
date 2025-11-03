"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyDelete,
} from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Project, useProject } from "@/context/ProjectContext";

// Debounce Hook
function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, getProjects, createProject, updateProject, deleteProject } =
    useProject();

  // Local states
  const [newProject, setNewProject] = useState("");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  // Dialog states
  const [adding, setAdding] = useState(false); // ✅ NEW POPUP STATE
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Fetch all projects
  useEffect(() => {
    getProjects();
  }, []);

  // Add New Project (POPUP)
  const handleAddProject = async () => {
    if (!newProject.trim()) return notifyWarning("Enter project name");

    setLoadingAdd(true);
    try {
      await createProject(newProject.trim());
      notifySuccess("Project added");
      setNewProject("");
      setAdding(false); // ✅ close popup
    } catch {
      notifyError("Failed to add project");
    } finally {
      setLoadingAdd(false);
    }
  };

  // Save Edited Project
  const handleSave = async () => {
    if (!editing?.projectName.trim())
      return notifyWarning("Project name cannot be empty");

    setLoadingSave(true);
    try {
      await updateProject(editing._id, editing.projectName.trim());
      notifySuccess("Project updated");
      setEditing(null);
    } catch {
      notifyError("Update failed");
    } finally {
      setLoadingSave(false);
    }
  };

  //  Delete project
  const handleDelete = async () => {
    if (!deleting) return;
    setLoadingDelete(true);

    try {
      await deleteProject(deleting._id);
      notifyDelete("Project deleted");
      setDeleting(null);
    } catch {
      notifyError("Delete failed");
    } finally {
      setLoadingDelete(false);
    }
  };

  //  Filter projects by search
  const filteredProjects = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return projects.filter((p) =>
      p.projectName.toLowerCase().includes(q)
    );
  }, [debouncedSearch, projects]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-3">
  <CardTitle className="text-xl font-bold">Manage Projects</CardTitle>

  <div className="flex items-center gap-2 ml-auto">
    <Input
      placeholder="Search projects..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="max-w-md h-9"
    />

    <Button onClick={() => setAdding(true)} className="h-10 cursor-pointer">
      <Plus className="w-3 h-2 mr-1" />
      Add Project
    </Button>
  </div>
</CardHeader>


      <CardContent>
        {/* ✅ Project List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <p className="text-gray-500 text-sm">No matching results.</p>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project._id}
                className="flex justify-between items-center px-4 py-2 border rounded-md bg-white hover:bg-gray-100 transition"
              >
                <button
                  onClick={() => router.push(`/projects/${project._id}`)}
                  className="font-semibold flex-1 text-left hover:underline cursor-pointer"
                >
                  {project.projectName}
                </button>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(project)}
                    className="cursor-pointer"
                  >
                    <Edit2 className="text-blue-500 w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleting(project)}
                    className="cursor-pointer"
                  >
                    <Trash2 className="text-red-500 w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ Add Project Dialog */}
        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogContent className="sm:max-w-md ">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>Enter project name below.</DialogDescription>
            </DialogHeader>

            <Input
              placeholder="Project name"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
            />

            <DialogFooter className="mt-4">
              <Button className="cursor-pointer" variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button className="cursor-pointer" onClick={handleAddProject} disabled={loadingAdd}>
                {loadingAdd ? "Adding..." : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ✅ Edit Dialog */}
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project name below.
              </DialogDescription>
            </DialogHeader>

            <Input
              value={editing?.projectName || ""}
              onChange={(e) =>
                setEditing((prev) =>
                  prev ? { ...prev, projectName: e.target.value } : prev
                )
              }
            />

            <DialogFooter className="mt-4">
              <Button className="cursor-pointer" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button className="cursor-pointer" onClick={handleSave} disabled={loadingSave}>
                {loadingSave ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ✅ Delete Dialog */}
        <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Project?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleting?.projectName}</span>?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleting(null)}
                disabled={loadingDelete}
              >
                Cancel
              </Button>

              <Button
                className="bg-red-500 text-white"
                onClick={handleDelete}
                disabled={loadingDelete}
              >
                {loadingDelete ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
