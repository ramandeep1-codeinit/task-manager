"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { notifyError, notifySuccess } from "@/lib/toast";
import { useParams, useRouter } from "next/navigation";
import { useTaskDetail } from "@/context/TaskDetailContext";

export default function AssignedProjectDetailsPage() {
  const { assignProjectId } = useParams();
  const router = useRouter();

  // bring all functions and state from TaskDetailContext
  const {
    tasks,
    loading,
    error,
    getTasksByProject,
    markTaskDone,
  } = useTaskDetail();

  const [projectName, setProjectName] = useState("");

  // load project tasks
  useEffect(() => {
    if (!assignProjectId) return;

    getTasksByProject(assignProjectId as string).then(() => {
      if (tasks.length > 0) {
        setProjectName(tasks[0].project?.projectName || "Project");
      }
    });
  }, [assignProjectId]);

  // mark task completed
  const handleMarkDone = async (taskId: string) => {
    try {
      await markTaskDone(taskId);
      notifySuccess("Task marked as completed!");
    } catch (err: any) {
      notifyError(err.message || "Failed to mark task completed");
    }
  };

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  // Loading UI
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-700 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );

  // If no tasks found
  if (!tasks.length)
    return (
      <div className="text-center mt-10">
        <p>No tasks found for this project.</p>
        <Button className="mt-4 cursor-pointer" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
    );

  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-lg p-4 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {projectName} - Task Details
        </h2>
        <Button
          onClick={() => router.back()}
          className="bg-gray-200 text-black hover:bg-gray-300 cursor-pointer"
        >
          ← Back
        </Button>
      </div>

      {/* Task Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md bg-white">
        <Table className="min-w-full border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b">
              <TableHead>Task Detail</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id} className="bg-white hover:bg-gray-50">
                <TableCell>{task.taskDetail}</TableCell>

                <TableCell>
                  <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
                  {formatDate(task.createdAt)}
                </TableCell>

                <TableCell>
                  <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
                  {formatDate(task.dueDate)}
                </TableCell>

                <TableCell>
                  {task.status === "completed" ? (
                    <span className="text-green-600 font-semibold">
                      Completed
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">
                      Pending
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  {task.status !== "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkDone(task._id)}
                      className="cursor-pointer"
                    >
                      Mark as Done
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}