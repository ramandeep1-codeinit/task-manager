"use client";

import React, { useMemo, useState, useEffect } from "react";
import { LogOut, LayoutDashboard, Clock, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTask } from "@/context/TaskContext";

interface EmployeeSidebarProps {
  onSectionChange?: (section: "dashboard" | "assignedProjects" | "attendance") => void;
}

export default function EmployeeSidebar({ onSectionChange }: EmployeeSidebarProps) {
  const { user, logout } = useAuth();
  const { setSelectedTask } = useTask();
  const [active, setActive] = useState<"dashboard" | "assignedProjects" | "attendance">("dashboard");

  // Load last active section from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("employeeActiveSection") as
      | "dashboard"
      | "assignedProjects"
      | "attendance"
      | null;
    if (saved) {
      setActive(saved);
      onSectionChange?.(saved);
    } else {
      onSectionChange?.(active);
    }
  }, [onSectionChange]);

  const handleClick = (section: "dashboard" | "assignedProjects" | "attendance") => {
    setActive(section);
    setSelectedTask?.(null); // Clear any selected task when switching sections
    onSectionChange?.(section);
    localStorage.setItem("employeeActiveSection", section);
  };

  const handleLogout = () => {
    logout();
    setActive("dashboard");
    localStorage.setItem("employeeActiveSection", "dashboard");
    onSectionChange?.("dashboard");
  };

  const avatarText = useMemo(() => {
    if (!user?.name && !user?.email) return "NA";
    return (user.name || user.email)
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user?.name, user?.email]);

  const sections = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "assignedProjects", label: "Assigned Projects", icon: ClipboardList },
      { key: "attendance", label: "Attendance", icon: Clock },
    ],
    []
  );

  return (
    <aside className="w-64 h-screen bg-gray-50 flex flex-col justify-between border-r border-gray-200 shadow-sm">
      <div className="p-4">
        {user && (
          <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200 text-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
              {avatarText}
            </div>
            <div className="flex flex-col">
              <p className="font-semibold">{user.name || user.email}</p>
              <p className="text-xs text-gray-600">{user.role}</p>
            </div>
          </div>
        )}

        <nav className="mt-4 flex flex-col gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = active === section.key;
            return (
              <button
                key={section.key}
                onClick={() => handleClick(section.key as any)}
                className={`flex items-center w-full px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 px-2 py-1 text-sm h-8 hover:bg-gray-100 hover:text-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
