"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useParams, useRouter } from "next/navigation";

interface AssignedTask {
  _id: string;
  taskDetail: string;
  createdAt?: string;
  dueDate?: string;
  status?: "pending" | "completed";
  project?: { projectName: string };
}

export default function AssignedProjectDetailsPage() {
  const { assignProjectId } = useParams();
  const router = useRouter();
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ✅ Fetch tasks for this project
  useEffect(() => {
    if (!assignProjectId) return;

    const fetchProjectTasks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/taskDetail/project/${assignProjectId}`);
        const data: AssignedTask[] = res.data.tasks || [];
        setTasks(data);
        if (data.length > 0) setProjectName(data[0].project?.projectName || "Project");
      } catch (err) {
        console.error(err);
        notifyError("Failed to fetch project tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectTasks();
  }, [assignProjectId]);

  // ✅ Mark task as done
  const handleMarkDone = async (taskId: string) => {
    try {
      await axios.put(`${API_BASE_URL}/taskDetail/${taskId}/mark-done`);
      notifySuccess("Task marked as completed!");
      setTasks(prev =>
        prev.map(t => (t._id === taskId ? { ...t, status: "completed" } : t))
      );
    } catch (err: any) {
      console.error(err);
      notifyError(err.response?.data?.message || "Failed to update task status");
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

  if (loading)
    return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-700 text-lg font-semibold">
          Loading...
        </p>
      </div>
    </div>
  );

  if (!tasks.length)
    return (
      <div className="text-center mt-10">
        <p>No tasks found for this project.</p>
        <Button className="mt-4" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
    );

  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-lg p-4 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">{projectName} - Task Details</h2>
        <Button onClick={() => router.back()} className="bg-gray-200 text-black hover:bg-gray-300">
          ← Back
        </Button>
      </div>

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
            {tasks.map(task => (
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
                    <span className="text-green-600 font-semibold">Completed</span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">Pending</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.status !== "completed" && (
                    <Button variant="outline" size="sm" onClick={() => handleMarkDone(task._id)}>
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
