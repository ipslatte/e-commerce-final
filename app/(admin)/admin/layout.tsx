"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Users,
  Settings,
} from "lucide-react";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/dashboard/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Reviews",
    href: "/dashboard/admin/reviews",
    icon: MessageSquare,
    subItems: [
      {
        title: "All Reviews",
        href: "/dashboard/admin/reviews",
      },
      {
        title: "Pending Reviews",
        href: "/dashboard/admin/reviews/pending",
      },
      {
        title: "Approved Reviews",
        href: "/dashboard/admin/reviews/approved",
      },
      {
        title: "Rejected Reviews",
        href: "/dashboard/admin/reviews/rejected",
      },
    ],
  },
  {
    title: "Customers",
    href: "/dashboard/admin/customers",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.replace("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-gray-900 text-white lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b border-gray-800 px-4">
            <span className="text-lg font-bold">Admin Dashboard</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {sidebarNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.subItems &&
                  item.subItems.some((subItem) => pathname === subItem.href));

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-800",
                      isActive ? "bg-gray-800 text-white" : "text-gray-300"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </Link>
                  {item.subItems && isActive && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm font-medium",
                            pathname === subItem.href
                              ? "bg-gray-800 text-white"
                              : "text-gray-300 hover:bg-gray-800"
                          )}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="container mx-auto py-6">{children}</div>
      </main>
    </div>
  );
}
