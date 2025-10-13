"use client";

import { useAuth } from "@/context/AuthContext";
import EmployeeDashboard from "@/components/employees/EmployeeDashboard";
import ManagerDashboard from "@/components/manager/ManagerDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  const role = user.role?.toLowerCase();

  if (role === "employee") {
    return <EmployeeDashboard />;
  }

  if (role === "manager") {
    return <ManagerDashboard />;
  }

    return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <p className="text-red-600 text-3xl font-semibold">
        Access Denied!!
      </p>
    </div>
  );
}
