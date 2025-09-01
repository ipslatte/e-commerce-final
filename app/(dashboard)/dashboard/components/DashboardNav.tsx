"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Star,
  Heart,
  MapPin,
  Settings,
  ChevronDown,
  User,
  LogOut,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  role: string;
  subItems?: NavItem[];
}

const navigation = {
  main: [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      role: "user",
    },
  ],
  orders: [
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: Package,
      role: "user",
      subItems: [
        {
          title: "Order History",
          href: "/dashboard/orders",
          icon: Clock,
          role: "user",
        },
        {
          title: "Active Orders",
          href: "/dashboard/orders/active",
          icon: ShoppingCart,
          role: "user",
        },
      ],
    },
  ],
  preferences: [
    {
      title: "Reviews",
      href: "/dashboard/reviews",
      icon: Star,
      role: "user",
    },
    {
      title: "Wishlist",
      href: "/dashboard/wishlist",
      icon: Heart,
      role: "user",
    },
    {
      title: "Addresses",
      href: "/dashboard/addresses",
      icon: MapPin,
      role: "user",
    },
  ],
  settings: [
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      role: "user",
      subItems: [
        {
          title: "Profile",
          href: "/dashboard/settings",
          icon: User,
          role: "user",
        },
      ],
    },
  ],
};

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.title);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <div className="space-y-1">
        <div
          className={cn(
            "flex items-center justify-between px-4 py-2 text-[15px] font-medium cursor-pointer transition-colors duration-200",
            isActive
              ? "bg-white/10 text-white"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          )}
          onClick={() => hasSubItems && toggleExpand(item.title)}
        >
          <div className="flex items-center gap-3">
            <item.icon
              className={cn(
                "h-5 w-5 transition-colors duration-200",
                isActive ? "text-white" : "text-gray-300"
              )}
            />
            {hasSubItems ? (
              <span>{item.title}</span>
            ) : (
              <Link href={item.href} className="flex-1">
                {item.title}
              </Link>
            )}
          </div>
          {hasSubItems && (
            <ChevronDown
              className={cn("h-4 w-4 text-gray-300 transition-transform", {
                "transform rotate-180": isExpanded,
              })}
            />
          )}
        </div>
        {hasSubItems && isExpanded && item.subItems && (
          <div className="ml-8 space-y-1">
            {item.subItems.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={cn(
                  "group flex items-center gap-3 px-4 py-2 text-[15px] font-medium transition-colors duration-200",
                  pathname === subItem.href
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <subItem.icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    pathname === subItem.href ? "text-white" : "text-gray-300"
                  )}
                />
                {subItem.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const NavSection = ({
    title,
    items,
  }: {
    title: string;
    items: NavItem[];
  }) => {
    // Filter out items based on user role
    const filteredItems = items.filter(
      (item) => session?.user?.role !== "admin" || item.role !== "user"
    );

    if (filteredItems.length === 0) return null;

    return (
      <div className="space-y-1">
        <h3 className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-1">
          {filteredItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <nav className="space-y-6">
      <NavSection title="Overview" items={navigation.main} />
      <NavSection title="Orders" items={navigation.orders} />
      <NavSection title="Preferences" items={navigation.preferences} />
      <NavSection title="Settings" items={navigation.settings} />

      <div className="pt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group flex w-full items-center gap-3 px-4 py-2 text-[15px] font-medium text-red-400 hover:bg-red-400/10 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 text-red-400" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
