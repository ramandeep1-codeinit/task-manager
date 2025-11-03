"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Eye, EyeOff, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  notifyError,
  notifySuccess,
  notifyWarning,
  notifyDelete,
} from "@/lib/toast";

import { useEmployee } from "@/context/EmployeeContext";

// Debounce hook
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

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

// Memoized employee row
const EmployeeRow = memo(({ emp, onEdit, onDelete }: EmployeeRowProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-md overflow-hidden">
      <div
        className="flex justify-between items-center bg-gray-50 px-4 py-2 cursor-pointer hover:bg-gray-100"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className="font-medium">{emp.userName}</span>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(emp);
            }}
            className="cursor-pointer"
          >
            <Edit2 className="w-4 h-4 text-blue-500" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(emp);
            }}
            className="cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="bg-gray-100 px-4 py-2 text-sm">
          <p><strong>Email:</strong> {emp.email}</p>
          <p><strong>Role:</strong> {emp.role}</p>
        </div>
      )}
    </div>
  );
});

export default function AddEmployeeSection() {
  const {
    employees,
    getEmployees,
    registerEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployee();

  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    showPassword: false,
  });

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  //Fetch employees from EmployeeContext
  useEffect(() => {
    getEmployees();
  }, []);

  // Input change
  const handleInputChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Open add dialog
  const openAddDialog = () => {
    setEditingEmployee(null);
    setForm({ userName: "", email: "", password: "", showPassword: false });
    setOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm({
      userName: emp.userName,
      email: emp.email,
      password: "",
      showPassword: false,
    });
    setOpen(true);
  };

  // Save add/edit employee
  const handleSaveEmployee = async () => {
    if (!form.userName || !form.email || (!editingEmployee && !form.password)) {
      notifyWarning("Please fill all required fields.");
      return;
    }
    if (editingEmployee) {
      await updateEmployee(editingEmployee._id, {
        userName: form.userName,
        email: form.email,
        password: form.password || undefined,
      });
    } else {
      await registerEmployee(form.userName, form.email, form.password);
    }

    setOpen(false);
  };

  // Delete employee
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteEmployee(deleteTarget._id);
    setDeleteTarget(null);
  };

  // Search filter
  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.userName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [employees, debouncedSearchQuery]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-xl font-bold">Employees</CardTitle>

        <div className="flex gap-2">
          <Input
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-64"
          />

          <Button onClick={openAddDialog} className="bg-black text-white cursor-pointer">
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {filteredEmployees.length === 0 ? (
          <p className="text-gray-500">No employees found.</p>
        ) : (
          filteredEmployees.map((emp) => (
            <EmployeeRow
              key={emp._id}
              emp={emp}
              onEdit={openEditDialog}
              onDelete={setDeleteTarget}
            />
          ))
        )}
      </CardContent>

       {/* Add / Edit Dialog */}
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="rounded-2xl p-6">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold">
        {editingEmployee ? "Edit Employee" : "Add New Employee"}
      </DialogTitle>
      <DialogDescription className="text-sm text-gray-500">
        Fill in the employee details below.
      </DialogDescription>
    </DialogHeader>

    <div className="grid gap-5 py-3">
      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          placeholder="Enter name"
          className="rounded-xl"
          value={form.userName}
          onChange={(e) => handleInputChange("userName", e.target.value)}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          placeholder="Enter email"
          className="rounded-xl"
          value={form.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
        />
      </div>

      {/* Password with toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <div className="relative">
          <Input
            placeholder="Enter password"
            className="rounded-xl pr-10"
            type={form.showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
          <button
            type="button"
            onClick={() =>
              handleInputChange("showPassword", !form.showPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition cursor-pointer"
          >
            {form.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Role */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Role</label>
        <Input
          placeholder="Employee"
          className="rounded-xl bg-gray-100"
          value="Employee"
          disabled
        />
      </div>
    </div>

    <DialogFooter>
      <Button
        className="w-full rounded-xl bg-black hover:bg-gray-900 text-white py-2.5"
        onClick={handleSaveEmployee}
      >
        {editingEmployee ? "Update Employee" : "Add Employee"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.userName}</strong>?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>

            <Button className="bg-red-500 text-white" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
