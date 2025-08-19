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
import { Plus, Pencil, Trash2, LayoutDashboard, FolderKanban, ListChecks, Settings, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// import { Plus, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AddTaskDialog from "@/components/dialogbox";
import { useTask } from "@/context/TaskContext";
import withAuth from "@/components/withAuth";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/sidebar";



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

 function Dashboard() {
   const { user } = useAuth();
  const { createTask , tasks , getTasks} = useTask();
  const [open, setOpen] = useState(false);

  console.log("Tasks in Dashboard:", tasks);
   // ✅ Fetch tasks on mount
  useEffect(() => {
    // If user is logged in, fetch tasks
    if (!user) return; 
    console.log("Fetching tasks for user:", user.id);
    if (user) {
      getTasks(user.role, user.id);
    }
  }, [user]);

  return (

  
  <div className="flex min-h-screen bg-white">
  {/* Sidebar column */}
  <aside className="w-64 border-r hidden md:block">
    <Sidebar />
  </aside>

      <div className="flex-1 bg-white p-4 md:p-8">
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
                  <TableHead>Task Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.id}</TableCell>
                    <TableCell className="text-blue-600 font-medium cursor-pointer hover:underline">
                      {task.project}
                    </TableCell>
                    {/* <TableCell>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </TableCell> */}

                    <TableCell className="text-blue-600 font-medium cursor-pointer hover:underline">{task.taskDetail}</TableCell>
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
  
    </div>
  

  );
}


export default withAuth(Dashboard);