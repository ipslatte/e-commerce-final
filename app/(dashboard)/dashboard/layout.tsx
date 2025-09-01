"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { DashboardNav } from "./components/DashboardNav";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're in the admin section
  const isAdminSection = pathname.startsWith("/dashboard/admin");

  // If we're in the admin section, don't show the dashboard sidebar
  if (isAdminSection) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#050b2c] transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-700/50">
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-white/5 text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <DashboardNav />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:block md:w-64 md:border-r md:border-gray-700/50 md:bg-[#050b2c]">
        <div className="flex h-16 items-center px-4 border-b border-gray-700/50">
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        </div>
        <div className="p-4">
          <DashboardNav />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 items-center border-b bg-white md:hidden">
          <button
            type="button"
            className="px-4 text-[#64748b] focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="px-4">
            <h1 className="text-lg font-semibold text-[#050b2c]">Dashboard</h1>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
