import React, { useState } from "react";
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


interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function AddTaskDialog({ open, setOpen }: Props) {
  
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  const handleAddTask = () => {
    console.log("Task Title:", taskTitle);
    console.log("Task Description:", taskDesc);
    setTaskTitle("");
    setTaskDesc("");
  };

  return (
    <Dialog  open={open} onOpenChange={setOpen} >
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
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
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
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="col-span-3"
              placeholder="Enter task description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddTask} className="bg-primary text-white">
            Save Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
