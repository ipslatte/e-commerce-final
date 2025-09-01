"use client";

import { SessionProvider } from "next-auth/react";
import DashboardNavbar from "../components/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <div className="min-h-screen bg-gray-50">
        {/* <DashboardNavbar /> */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
