"use client";

import React, { useState } from "react";
import { LogOut, LayoutDashboard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface EmployeeSidebarProps {
  onSectionChange?: (section: "dashboard" | "attendance") => void;
}

export default function EmployeeSidebar({ onSectionChange }: EmployeeSidebarProps) {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<"dashboard" | "attendance">("dashboard");

  const handleClick = (section: "dashboard" | "attendance") => {
    setActive(section);
    if (onSectionChange) onSectionChange(section);
  };

  const getAvatarText = (nameOrEmail?: string) => {
    if (!nameOrEmail) return "NA";
    return nameOrEmail.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    if (onSectionChange) onSectionChange("dashboard");
  };

  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col justify-between border-r">
      <div className="p-4">
        {user && (
          <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200 text-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
              {getAvatarText(user.name || user.email)}
            </div>
            <div className="flex flex-col">
              <p className="font-semibold">{user.name || user.email}</p>
              <p className="text-xs text-gray-600">{user.role}</p>
            </div>
          </div>
        )}

        {/* Dashboard */}
        <button
          onClick={() => handleClick("dashboard")}
          className={`flex items-center w-full px-6 py-3 text-sm font-medium rounded-lg mb-2 ${
            active === "dashboard"
              ? "bg-indigo-100 text-indigo-700 font-semibold"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Dashboard
        </button>

        {/* Attendance */}
        <button
          onClick={() => handleClick("attendance")}
          className={`flex items-center w-full px-6 py-3 text-sm font-medium rounded-lg mb-2 ${
            active === "attendance"
              ? "bg-indigo-100 text-indigo-700 font-semibold"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Clock className="mr-3 h-5 w-5" />
          Attendance
        </button>
      </div>

      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 px-2 py-1 text-sm h-8 hover:bg-accent hover:text-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
