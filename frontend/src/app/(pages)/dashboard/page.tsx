"use client";

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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import AddTaskDialog from "@/components/dialogbox";
import { useTask } from "@/context/TaskContext";

const tasks = [
  {
    id: "3925",
    name: "Smooth Scrolling of Lists",
    priority: "Low",
    executors: [{ name: "Zackary Bauch", avatar: "/avatars/user1.png" }],
    author: "Kylee Danford",
    deadline: "April 12",
    status: "New",
  },
  {
    id: "3926",
    name: "System Errors",
    priority: "Medium",
    executors: [{ name: "Andre James", avatar: "/avatars/user2.png" }],
    author: "Devaj Giri",
    deadline: "May 1",
    status: "In Progress",
  },
  {
    id: "3927",
    name: "Tech Support, Enhancements",
    priority: "High",
    executors: [{ name: "Tynisha Obey", avatar: "/avatars/user3.png" }],
    author: "Alex Reynoso",
    deadline: "June 4",
    status: "Completed",
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Low":
      return "bg-green-100 text-green-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "High":
      return "bg-red-100 text-red-800";
    default:
      return "";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-800";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    default:
      return "";
  }
};

export default function Dashboard() {
  const { createTask } = useTask();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <AddTaskDialog open={open} setOpen={setOpen} onSubmit={createTask} />
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl md:text-2xl font-bold">
            Task List
          </CardTitle>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Task Name</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.id}</TableCell>
                  <TableCell className="text-blue-600 font-medium cursor-pointer hover:underline">
                    {task.name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                        // onClick={() => handleEdit(task)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                        //  onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
