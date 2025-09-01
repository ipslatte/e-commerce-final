"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Users,
  Settings,
  Tag,
  DollarSign,
  Home,
  ChevronDown,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const sidebarNavItems = [
  {
    section: "OVERVIEW",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/admin",
        icon: Home,
      },
    ],
  },
  {
    section: "CATALOG",
    items: [
      {
        title: "Products",
        href: "/dashboard/admin/products",
        icon: Package,
        expandable: true,
      },
      {
        title: "Categories",
        href: "/dashboard/admin/categories",
        icon: Tag,
        expandable: true,
      },
    ],
  },
  {
    section: "PROMOTIONS",
    items: [
      {
        title: "Promotions",
        href: "/dashboard/admin/promotions",
        icon: Tag,
        expandable: true,
      },
    ],
  },
  {
    section: "SALES",
    items: [
      {
        title: "Orders",
        href: "/dashboard/admin/orders",
        icon: ShoppingCart,
        expandable: true,
      },
      {
        title: "Reviews",
        href: "/dashboard/admin/reviews",
        icon: MessageSquare,
        expandable: true,
      },
    ],
  },
  {
    section: "USERS",
    items: [
      {
        title: "Customers",
        href: "/dashboard/admin/customers",
        icon: Users,
        expandable: true,
      },
    ],
  },
  {
    section: "SETTINGS",
    items: [
      {
        title: "Settings",
        href: "/dashboard/admin/settings",
        icon: Settings,
        expandable: true,
      },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  const renderNavItem = (item: any) => {
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center justify-between px-4 py-2 text-[15px] font-medium transition-colors duration-200",
          isActive
            ? "bg-[#f1f5f9] text-[#050b2c]"
            : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#050b2c]"
        )}
      >
        <span className="flex items-center">
          {item.icon && (
            <item.icon
              className={cn(
                "mr-3 h-5 w-5 transition-colors duration-200",
                isActive ? "text-[#050b2c]" : "text-[#64748b]"
              )}
            />
          )}
          {item.title}
        </span>
        {item.expandable && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-colors duration-200",
              isActive ? "text-[#050b2c]" : "text-[#64748b]"
            )}
          />
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold text-[#050b2c]">Admin</h1>
        <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <ChevronLeft className="h-5 w-5 text-[#64748b]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 py-4">
          {sidebarNavItems.map((section) => (
            <div key={section.section} className="space-y-1">
              <h2 className="px-4 text-xs font-medium text-[#64748b] uppercase tracking-wider">
                {section.section}
              </h2>
              <div>{section.items.map(renderNavItem)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
