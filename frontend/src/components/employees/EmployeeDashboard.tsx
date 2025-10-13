"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import AddTaskDialog from "@/components/employees/dialogbox";
import { Task, useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import EmployeeSidebar from "@/components/employees/EmployeeSidebar";
import EmployeeAttendance from "@/components/employees/EmpAttend";
import { notifySuccess, notifyError, notifyDelete } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { createTask, tasks = [], updateTask, deleteTask, getTasks, getTaskById } = useTask() || {};

  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"dashboard" | "attendance">("dashboard");

  // Delete popup state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Fetch tasks on load or section change
  useEffect(() => {
    if (user && activeSection === "dashboard") {
      getTasks?.(user.role, user.id);
    }
  }, [user, activeSection, getTasks]);

  const openAddDialog = () => {
    setSelectedTask(null);
    setEditTaskId(null);
    setOpen(true);
  };

  const openEditDialog = async (_id: string) => {
    if (!getTaskById) return;
    const task = await getTaskById(_id);
    if (task) {
      setEditTaskId(task._id || null);
      setSelectedTask(task);
      setOpen(true);
    }
  };

  const handleAddTask = async (formData: Task) => {
    try {
      await createTask?.(formData);
      notifySuccess("Task added successfully ");
      getTasks?.(user!.role, user!.id);
    } catch (error) {
      notifyError("Failed to add task ");
      console.error(error);
    }
  };

  const handleEditTask = async (formData: Task) => {
    if (!editTaskId || !selectedTask || !updateTask) return;
    try {
      await updateTask(editTaskId, formData, user!.role, user!.id);
      notifySuccess("Task updated successfully ");
      setOpen(false);
      setSelectedTask(null);
      setEditTaskId(null);
      getTasks?.(user!.role, user!.id);
    } catch (error) {
      notifyError("Failed to update task ");
      console.error(error);
    }
  };

  const confirmDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete || !deleteTask || !user) return;
    try {
      await deleteTask(taskToDelete._id!, user.role, user.id);
      notifyDelete("Task deleted successfully ");
      getTasks?.(user.role, user.id);
    } catch (error) {
      notifyError("Failed to delete task ");
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const sortedTasks = [...(tasks || [])].sort(
    (a, b) =>
      (new Date(b.createdAt ?? 0).getTime()) -
      (new Date(a.createdAt ?? 0).getTime())
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 hidden md:block sticky top-0 h-screen">
        <EmployeeSidebar onSectionChange={setActiveSection} />
      </aside>

      {/* Main content */}
      <div className="flex-1 bg-white p-4 md:p-8 overflow-y-auto">
        {activeSection === "dashboard" && (
          <>
            {user && (
              <AddTaskDialog
                open={open}
                setOpen={setOpen}
                onSubmit={selectedTask ? handleEditTask : handleAddTask}
                initialData={selectedTask || undefined}
              />
            )}

            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl md:text-2xl font-bold">Task List</CardTitle>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  onClick={openAddDialog}
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </CardHeader>

              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Task Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {sortedTasks.length > 0 ? (
                      sortedTasks.map((task, index) => (
                        <TableRow key={task._id || index}>
                          <TableCell>{task.project || "N/A"}</TableCell>
                          <TableCell>{task.taskDetail || "N/A"}</TableCell>
                          <TableCell>{task.status || "N/A"}</TableCell>
                          <TableCell>{formatDate(task.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditDialog(task._id!)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => confirmDeleteTask(task)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No tasks found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Delete Task</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this task? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteTask}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {activeSection === "attendance" && <EmployeeAttendance />}
      </div>
    </div>
  );
}
