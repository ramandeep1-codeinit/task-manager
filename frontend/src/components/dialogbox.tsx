import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { init } from "next/dist/compiled/webpack/webpack";

interface Task {
  id: string;
  userName: string;
  project: string;
  taskDetail: string;
  status: string;
  userId: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (task: any) => Promise<void>;
  initialData?: Omit<Task, "id">; // 👈 add this line
}

interface TaskFormData {
  userName: string;
  project: string;
  taskDetail: string;
  status: string;
  userId: string;
}

export default function AddTaskDialog({ open, setOpen, onSubmit ,initialData }: Props) {
  // const { createTask } = useTask();
   const { user } = useAuth();
//  console.log(user, "user in dialog" , user?.name);
  const [formData, setFormData] = useState<TaskFormData>({
    userName: "",
    project: "",
    taskDetail: "",
    status: "pending",
    userId: "",
  });
console.log(formData, "form data in dialog");   
//  console.log(formData, "data");

 // Track changes compared to initialData
  const [changedFields, setChangedFields] = useState<Record<string, boolean>>({});


  // Prefill form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        userName: initialData.userName || user?.name || "",
        project: initialData.project || "",
        taskDetail: initialData.taskDetail || "",
        status: initialData.status || "pending",
        userId: initialData.userId || user?.id || "",
      });
    } else {
      setFormData({
        userName: "",
        project: "",
        taskDetail: "",
        status: "pending",
        userId: user?.id || "",
      });
    }
  }, [initialData, user]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if(initialData) {
      await onSubmit(formData);
    }else{
 const updatedFormData = {
      ...formData,
      userId: user.id,
      userName: user.name,
    };

    await onSubmit(updatedFormData);
    }
   
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        <Button className="bg-primary text-white">Add Task</Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
           {initialData
              ? "Update the task details. Changed fields are highlighted."
              : "Enter the task details to add a new task."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.project}
              onChange={(e) => handleChange("project", e.target.value)}
              className="col-span-3"
              placeholder="Enter task title"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="desc" className="text-right">
              Description
            </Label>
            <Input
              id="desc"
              value={formData.taskDetail}
              onChange={(e) => handleChange("taskDetail", e.target.value)}
              className="col-span-3"
              placeholder="Enter task description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-primary text-white">
          {initialData ? "Update Task" : "Save Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
