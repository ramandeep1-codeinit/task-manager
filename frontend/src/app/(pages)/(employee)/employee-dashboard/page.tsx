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
import AddTaskDialog from "@/components/employees/AddTaskDialogbox";
import { useTask, Task } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
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
  const {
    tasks,
    selectedTask,
    setSelectedTask,
    createTask,
    updateTask,
    deleteTask,
    getTasks,
    getTaskById,
  } = useTask();

  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Fetch tasks once when component mounts
  useEffect(() => {
    if (user) getTasks(user.role, user.id);
  }, [user, getTasks]);

  const openAddDialog = () => {
    setSelectedTask(null);
    setOpenDialog(true);
  };

  const openEditDialog = async (_id: string) => {
    const task = await getTaskById(_id);
    if (task) {
      setSelectedTask(task);
      setOpenDialog(true);
    }
  };

  const handleSubmitTask = async (formData: Task) => {
    try {
      if (selectedTask?._id) {
        const { _id, ...dataToSend } = formData;
        await updateTask(selectedTask._id, dataToSend);
        notifySuccess("Task updated successfully");
      } else {
        await createTask(formData);
        notifySuccess("Task added successfully");
      }
      setOpenDialog(false);
      setSelectedTask(null);
      getTasks(user!.role, user!.id);
    } catch (error) {
      notifyError("Failed to save task");
      console.error(error);
    }
  };

  const confirmDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete?._id || !user) return;
    try {
      await deleteTask(taskToDelete._id);
      notifyDelete("Task deleted successfully");
      getTasks(user.role, user.id);
    } catch (error) {
      notifyError("Failed to delete task");
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

  const sortedTasks = [...(tasks || [])].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="p-4 md:p-8">
      <AddTaskDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onSubmit={handleSubmitTask}
        initialData={selectedTask || undefined}
      />

      <Card className="shadow-lg">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl font-bold">
            Task List
          </CardTitle>
          <Button
            className="bg-black text-white flex items-center gap-2"
            onClick={openAddDialog}
          >
            <Plus className="h-4 w-4" /> Add Task
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
