"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  ListBulletIcon,
  ArchiveBoxIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  subItems?: NavItem[];
}

const navigation = {
  main: [{ name: "Dashboard", href: "/dashboard/admin", icon: HomeIcon }],
  catalog: [
    {
      name: "Products",
      href: "#",
      icon: ShoppingBagIcon,
      subItems: [
        {
          name: "All Products",
          href: "/dashboard/admin/products",
          icon: ListBulletIcon,
        },
        {
          name: "Add Product",
          href: "/dashboard/admin/products/add",
          icon: PlusIcon,
        },
        {
          name: "Analytics",
          href: "/dashboard/admin/products/analytics",
          icon: ChartBarIcon,
        },
        {
          name: "Out of Stock",
          href: "/dashboard/admin/products/low-stock",
          icon: ArchiveBoxIcon,
        },
        {
          name: "Most Viewed",
          href: "/dashboard/admin/products/most-viewed",
          icon: ChartBarIcon,
        },
        {
          name: "Sales Analytics",
          href: "/dashboard/admin/products/sales",
          icon: ChartBarIcon,
        },
        {
          name: "Bulk Operations",
          href: "/dashboard/admin/products/bulk-operations",
          icon: ChartBarIcon,
        },
        {
          name: "Import/Export",
          href: "/dashboard/admin/products/import",
          icon: FolderIcon,
        },
      ],
    },
    {
      name: "Categories",
      href: "#",
      icon: TagIcon,
      subItems: [
        {
          name: "All Categories",
          href: "/dashboard/admin/categories",
          icon: ListBulletIcon,
        },
        {
          name: "Add Category",
          href: "/dashboard/admin/categories/add",
          icon: PlusIcon,
        },
      ],
    },
  ],
  promotions: [
    {
      name: "Promotions",
      href: "#",
      icon: TagIcon,
      subItems: [
        {
          name: "All Promotions",
          href: "/dashboard/admin/promotions",
          icon: ListBulletIcon,
        },
        {
          name: "Coupons",
          href: "/dashboard/admin/promotions/coupons",
          icon: TagIcon,
        },
        {
          name: "Flash Sales",
          href: "/dashboard/admin/promotions/flash-sales",
          icon: TagIcon,
        },
      ],
    },
  ],
  sales: [
    {
      name: "Orders",
      href: "#",
      icon: ChartBarIcon,
      subItems: [
        {
          name: "All Orders",
          href: "/dashboard/admin/orders",
          icon: ListBulletIcon,
        },
        {
          name: "Pending",
          href: "/dashboard/admin/orders/pending",
          icon: ChartBarIcon,
        },
        {
          name: "Completed",
          href: "/dashboard/admin/orders/completed",
          icon: ChartBarIcon,
        },
      ],
    },
    {
      name: "Reviews",
      href: "#",
      icon: ListBulletIcon,
      subItems: [
        {
          name: "All Reviews",
          href: "/dashboard/admin/reviews",
          icon: ListBulletIcon,
        },
        {
          name: "Pending",
          href: "/dashboard/admin/reviews/pending",
          icon: ChartBarIcon,
        },
        {
          name: "Approved",
          href: "/dashboard/admin/reviews/approved",
          icon: ChartBarIcon,
        },
        {
          name: "Rejected",
          href: "/dashboard/admin/reviews/rejected",
          icon: ChartBarIcon,
        },
      ],
    },
  ],
  users: [
    {
      name: "Customers",
      href: "#",
      icon: UsersIcon,
      subItems: [
        {
          name: "All Customers",
          href: "/dashboard/admin/users",
          icon: ListBulletIcon,
        },
        {
          name: "Add Customer",
          href: "/dashboard/admin/users/add",
          icon: PlusIcon,
        },
      ],
    },
  ],
  settings: [
    {
      name: "Settings",
      href: "#",
      icon: Cog6ToothIcon,
      subItems: [
        {
          name: "General",
          href: "/dashboard/admin/settings",
          icon: Cog6ToothIcon,
        },
        {
          name: "Security",
          href: "/dashboard/admin/settings/security",
          icon: Cog6ToothIcon,
        },
      ],
    },
  ],
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.name);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isParentExpanded = item.subItems?.some((subItem) =>
      subItem.subItems?.some((grandChild) => pathname === grandChild.href)
    );

    return (
      <div>
        <div
          className={`group flex items-center justify-between px-4 py-2 text-[15px] font-medium cursor-pointer transition-colors duration-200 ${
            (isActive || isParentExpanded) && !hasSubItems
              ? "bg-white/10 text-white"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          }`}
          onClick={() => (hasSubItems ? toggleExpand(item.name) : null)}
        >
          <div className="flex items-center">
            <item.icon
              className={`${
                isCollapsed ? "w-6 h-6" : "mr-3 h-5 w-5"
              } flex-shrink-0 transition-colors duration-200 ${
                (isActive || isParentExpanded) && !hasSubItems
                  ? "text-white"
                  : "text-gray-300"
              }`}
              aria-hidden="true"
            />
            {!isCollapsed && (
              <span className="flex-1">
                {hasSubItems ? (
                  item.name
                ) : (
                  <Link href={item.href}>{item.name}</Link>
                )}
              </span>
            )}
          </div>
          {!isCollapsed && hasSubItems && (
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-300 transition-transform ${
                isExpanded ? "transform rotate-180" : ""
              }`}
            />
          )}
        </div>
        {hasSubItems && isExpanded && !isCollapsed && item.subItems && (
          <div className="ml-8 space-y-1">
            {item.subItems.map((subItem) => (
              <div key={subItem.href}>
                {subItem.subItems ? (
                  <NavItem item={subItem} />
                ) : (
                  <Link
                    href={subItem.href}
                    className={`group flex items-center px-4 py-2 text-[15px] font-medium transition-colors duration-200 ${
                      pathname === subItem.href
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <subItem.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        pathname === subItem.href
                          ? "text-white"
                          : "text-gray-300"
                      }`}
                      aria-hidden="true"
                    />
                    {subItem.name}
                  </Link>
                )}
              </div>
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
  }) => (
    <div className="space-y-1">
      {!isCollapsed && (
        <h3
          className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider"
          id="projects-headline"
        >
          {title}
        </h3>
      )}
      <div
        className="space-y-1"
        role="group"
        aria-labelledby="projects-headline"
      >
        {items.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      {/* Static sidebar for desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-[99] hidden md:block ${
          isCollapsed ? "w-16" : "w-64"
        } transition-all duration-300 bg-[#050b2c]`}
      >
        <div className="flex h-full flex-col border-r border-gray-700/50">
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              {!isCollapsed && (
                <h1 className="text-xl font-semibold text-white">Admin</h1>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg border border-gray-700 hover:bg-white/5"
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5 text-gray-300" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5 text-gray-300" />
                )}
              </button>
            </div>
            <nav className="flex-1 space-y-6 py-4">
              <NavSection title="Overview" items={navigation.main} />
              <NavSection title="Catalog" items={navigation.catalog} />
              <NavSection title="Promotions" items={navigation.promotions} />
              <NavSection title="Sales" items={navigation.sales} />
              <NavSection title="Users" items={navigation.users} />
              <NavSection title="Settings" items={navigation.settings} />

              <div className="px-4 pt-4 mt-auto">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="group flex w-full items-center px-4 py-2 text-[15px] font-medium text-red-400 hover:bg-red-400/10 transition-colors duration-200"
                >
                  <ArrowLeftOnRectangleIcon
                    className={`${
                      isCollapsed ? "w-6 h-6" : "mr-3 h-5 w-5"
                    } text-red-400`}
                    aria-hidden="true"
                  />
                  {!isCollapsed && "Sign Out"}
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={`${
          isCollapsed ? "md:ml-16" : "md:ml-64"
        } relative z-0 min-h-screen bg-gray-100 transition-all duration-300`}
      >
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white md:hidden">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-[#64748b] focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Page content */}
        <main className="py-4">
          <div className="px-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
