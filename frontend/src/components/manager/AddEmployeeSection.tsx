"use client";

import { useEffect, useState, useCallback, memo } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Eye, EyeOff, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { notifySuccess, notifyError, notifyWarning, notifyDelete } from "@/lib/toast";

interface Employee {
  _id: string;
  userName: string;
  email: string;
  role: string;
}

interface EmployeeRowProps {
  emp: Employee;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
}

const EmployeeRow = memo(({ emp, onEdit, onDelete }: EmployeeRowProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-md overflow-hidden">
      <div
        className="flex justify-between items-center bg-gray-50 px-4 py-2 cursor-pointer hover:bg-gray-100 transition"
        onClick={() => setExpanded(prev => !prev)}
      >
        <span className="font-medium">{emp.userName}</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              onEdit(emp);
            }}
          >
            <Pencil className="w-4 h-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              onDelete(emp);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="bg-gray-100 px-4 py-2 text-sm text-gray-700">
          <p><strong>Email:</strong> {emp.email}</p>
          <p><strong>Role:</strong> {emp.role}</p>
        </div>
      )}
    </div>
  );
});

export default function AddEmployeeSection() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    showPassword: false,
  });

  // New state for delete modal
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/users/all");
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setEmployees(data.filter(emp => emp && emp._id));
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      notifyError("Failed to fetch employees");
      setEmployees([]);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const openAddDialog = () => {
    setEditingEmployeeId(null);
    setForm({ userName: "", email: "", password: "", showPassword: false });
    setError("");
    setOpen(true);
  };

  const openEditDialog = (emp: Employee) => {
    setEditingEmployeeId(emp._id);
    setForm({ userName: emp.userName, email: emp.email, password: "", showPassword: false });
    setError("");
    setOpen(true);
  };

  const handleSaveEmployee = async () => {
    setError("");
    if (!form.userName || !form.email || (!editingEmployeeId && !form.password)) {
      notifyWarning("Please fill all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      notifyWarning("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      if (editingEmployeeId) {
        const payload: any = {
          userName: form.userName,
          email: form.email,
          role: "Employee",
        };
        if (form.password) payload.password = form.password;
        await axios.put(`http://localhost:8080/api/users/${editingEmployeeId}`, payload);
        notifySuccess("Employee updated successfully");
      } else {
        await axios.post("http://localhost:8080/api/users/register", {
          userName: form.userName,
          email: form.email,
          role: "Employee",
          password: form.password,
        });
        notifySuccess("Employee added successfully");
      }
      await fetchEmployees();
      setOpen(false);
    } catch (err: any) {
      console.error("Failed to save employee:", err.response?.data || err);
      notifyError(err.response?.data?.message || "Failed to save employee. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteEmployee) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/users/${deleteEmployee._id}`);
      setEmployees(prev => prev.filter(emp => emp._id !== deleteEmployee._id));
      notifyDelete("Employee deleted successfully");
      setDeleteEmployee(null);
    } catch (err) {
      console.error("Failed to delete employee:", err);
      notifyError("Failed to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-xl font-bold">Employees</CardTitle>
        <Button onClick={openAddDialog} className="flex items-center gap-2" variant="outline">
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </CardHeader>

      <CardContent className="space-y-2">
        {employees.length === 0 ? (
          <p className="text-gray-500">No employees available.</p>
        ) : (
          employees.map(emp =>
            emp?._id ? (
              <EmployeeRow
                key={emp._id}
                emp={emp}
                onEdit={openEditDialog}
                onDelete={(emp) => setDeleteEmployee(emp)}
              />
            ) : null
          )
        )}
      </CardContent>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEmployeeId ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            <DialogDescription>
              Form to {editingEmployeeId ? "edit" : "add"} employee details
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleSaveEmployee();
            }}
            className="grid gap-4 py-4 relative"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Input
              placeholder="Name"
              value={form.userName}
              onChange={e => handleInputChange("userName", e.target.value)}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={e => handleInputChange("email", e.target.value)}
            />

            <div className="relative">
              <Input
                placeholder="Password"
                type={form.showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => handleInputChange("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleInputChange("showPassword", !form.showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
              >
                {form.showPassword ? <EyeOff className="text-blue-500" /> : <Eye className="text-gray-500" />}
              </button>
            </div>

            <Input placeholder="Role" value="Employee" disabled className="bg-gray-100 cursor-not-allowed" />

            <DialogFooter>
              <Button type="submit" className="bg-primary text-white w-full" disabled={loading}>
                {editingEmployeeId ? "Update Employee" : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteEmployee} onOpenChange={() => setDeleteEmployee(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteEmployee?.userName}</span>?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteEmployee(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 text-white"
              onClick={handleDeleteEmployee}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
