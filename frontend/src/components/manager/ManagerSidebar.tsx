"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, FolderKanban, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface ManagerSidebarProps {
  onSectionChange: (section: string) => void;
  onEmployeeSelect?: (employeeName: string) => void;
  managerLogin?: string; // login ID to display
}

export default function ManagerSidebar({
  onSectionChange,
  onEmployeeSelect,
  managerLogin,
}: ManagerSidebarProps) {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("tasks");

  // Helper to get avatar initials
  const getAvatarText = (nameOrEmail?: string) => {
    if (!nameOrEmail) return "NA";
    const parts = nameOrEmail.split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Load last active section
  useEffect(() => {
    const saved = localStorage.getItem("managerActiveSection");
    if (saved) {
      setActive(saved);
      onSectionChange(saved);
    }
  }, [onSectionChange]);

  const handleClick = (section: string) => {
    setActive(section);
    onSectionChange(section);
    localStorage.setItem("managerActiveSection", section);
  };

  return (
    <div className="w-64 p-4 bg-gray-50 h-screen flex flex-col justify-between border-r border-gray-200 shadow-sm">
      <div className="mb-4">
        {/* Top: User Info */}
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

        {/* Sidebar Navigation */}
        <nav className="mt-4">
          <button
            onClick={() => handleClick("tasks")}
            className={`flex items-center w-full px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
              active === "tasks"
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </button>

          <button
            onClick={() => handleClick("projects")}
            className={`flex items-center w-full px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
              active === "projects"
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FolderKanban className="mr-3 h-5 w-5" />
            Projects
          </button>

          <button
            onClick={() => handleClick("employees")}
            className={`flex items-center w-full px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
              active === "employees"
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Users className="mr-3 h-5 w-5" />
            Employees
          </button>
        </nav>
      </div>

      {/* Bottom: Logout */}
      <div className="mt-auto">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 px-2 py-1 text-sm h-7 hover:bg-accent hover:text-accent-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );
}
