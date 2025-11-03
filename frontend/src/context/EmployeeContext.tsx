"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import api from "../lib/api";
import { notifyError, notifySuccess } from "@/lib/toast";

export interface Employee {
  _id: string;
  userName: string;
  email: string;
  role: string;
}

interface EmployeeContextType {
  employees: Employee[];
  getEmployees: () => Promise<void>;
  registerEmployee: (
    userName: string,
    email: string,
    password: string
  ) => Promise<void>;
  updateEmployee: (
    id: string,
    data: Partial<Employee> & { password?: string }
  ) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  // ✅ Fetch all employees (same as AddEmployeeSection)
  const getEmployees = async () => {
    try {
      const res = await api.get("/users/all");
      const data: Employee[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];

      setEmployees(data);
    } catch (error) {
      notifyError("Failed to fetch employees");
      console.error(error);
    }
  };

  // ✅ Register employee (same payload used in AddEmployeeSection)
  const registerEmployee = async (
    userName: string,
    email: string,
    password: string
  ) => {
    try {
      await api.post("/users/register", {
        userName,
        email,
        password,
        role: "Employee",
      });

      notifySuccess("Employee registered successfully");
      await getEmployees();
    } catch (error: any) {
      notifyError(error.response?.data?.message || "Failed to register employee");
      console.error(error);
    }
  };

  // ✅ Update employee (perfectly matched with AddEmployeeSection)
  const updateEmployee = async (
    id: string,
    data: Partial<Employee> & { password?: string }
  ) => {
    try {
      const payload: any = {
        userName: data.userName,
        email: data.email,
        role: data.role ?? "Employee",
      };

      if (data.password) {
        payload.password = data.password;
      }

      await api.put(`/users/${id}`, payload);

      notifySuccess("Employee updated successfully");
      await getEmployees();
    } catch (error: any) {
      notifyError(error.response?.data?.message || "Failed to update employee");
      console.error(error);
    }
  };

  // ✅ Delete employee (same as AddEmployeeSection)
  const deleteEmployee = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      notifyError("Employee deleted successfully");
      await getEmployees();
    } catch (error) {
      notifyError("Failed to delete employee");
      console.error(error);
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        getEmployees,
        registerEmployee,
        updateEmployee,
        deleteEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployee must be used inside EmployeeProvider");
  }
  return context;
};
