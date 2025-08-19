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

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (task: any) => Promise<void>;
}

interface TaskFormData {
  userName: string;
  project: string;
  taskDetail: string;
  status: string;
  userId: string;
}

export default function AddTaskDialog({ open, setOpen, onSubmit }: Props) {
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

//  console.log(formData, "data");



  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!user) return; // make sure user is available

  
  // attach userId dynamically
  const updatedFormData = {
    ...formData,
    userId: user.id, 
    userName: user.name  // dynamically set
  };

  await onSubmit(updatedFormData);

  // reset form but keep userId ready
  setFormData({
    userName: "",
    project: "",
    taskDetail: "",
    status: "pending",
    userId: "",   // keep logged-in user id
  });

  setOpen(false);

  console.log(updatedFormData, "form data sent");
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        <Button className="bg-primary text-white">Add Task</Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Enter the task details to add a new task.
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
            Save Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
