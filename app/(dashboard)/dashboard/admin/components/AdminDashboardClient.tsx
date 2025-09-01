"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  Layers,
  BarChart3,
  ListTree,
  TrendingUp,
  ChevronRight,
  Clock,
  UserPlus,
} from "lucide-react";
import { formatDistance } from "date-fns";
import { motion } from "framer-motion";

interface DashboardData {
  products: {
    total: number;
    categories: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    totalRevenue: number;
    last30Days: {
      revenue: number;
      count: number;
    };
    recent: Array<{
      id: string;
      createdAt: string;
      total: number;
      status: string;
    }>;
  };
  users: {
    total: number;
    customers: number;
    newLast30Days: number;
  };
}

interface AdminDashboardClientProps {
  data: DashboardData;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboardClient({
  data,
}: AdminDashboardClientProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="flex-1 p-8 bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5"
    >
      {/* Header Section */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-4xl font-bold text-[#050b2c]">
          Welcome back, Admin
        </h2>
        <p className="mt-2 text-[#050b2c]/60">
          Here's what's happening in your store today.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        {/* Revenue Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#050b2c]">
                Total Revenue
              </h3>
              <div className="p-2 bg-[#050b2c]/5 rounded-xl">
                <DollarSign className="h-5 w-5 text-[#050b2c]" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-[#050b2c]">
                ${data.orders.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +${data.orders.last30Days.revenue.toLocaleString()} this month
              </p>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#050b2c]">Orders</h3>
              <div className="p-2 bg-[#050b2c]/5 rounded-xl">
                <ShoppingBag className="h-5 w-5 text-[#050b2c]" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-[#050b2c]">
                {data.orders.total}
              </p>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {data.orders.last30Days.count} new this month
                </p>
                <p className="text-sm text-[#ffa509] flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {data.orders.pending} pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#050b2c]">Products</h3>
              <div className="p-2 bg-[#050b2c]/5 rounded-xl">
                <Package className="h-5 w-5 text-[#050b2c]" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-[#050b2c]">
                {data.products.total}
              </p>
              <p className="text-sm text-[#050b2c]/60 flex items-center gap-1">
                <Layers className="h-4 w-4" />
                Across {data.products.categories} categories
              </p>
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#050b2c]">
                Customers
              </h3>
              <div className="p-2 bg-[#050b2c]/5 rounded-xl">
                <Users className="h-5 w-5 text-[#050b2c]" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-[#050b2c]">
                {data.users.total}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                {data.users.newLast30Days} new this month
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="mb-8">
        <h3 className="text-xl font-semibold text-[#050b2c] mb-4">
          Quick Actions
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              href: "/dashboard/admin/products",
              icon: ShoppingBag,
              title: "Products",
              description: "Manage your product catalog",
              color: "from-[#050b2c] to-[#0a1854]",
            },
            {
              href: "/dashboard/admin/categories",
              icon: ListTree,
              title: "Categories",
              description: "Manage product categories",
              color: "from-[#ffa509] to-[#ff8c00]",
            },
            {
              href: "/dashboard/admin/orders",
              icon: Package,
              title: "Orders",
              description: "View and manage orders",
              color: "from-[#050b2c] to-[#0a1854]",
            },
            {
              href: "/dashboard/admin/users",
              icon: Users,
              title: "Users",
              description: "Manage user accounts",
              color: "from-[#ffa509] to-[#ff8c00]",
            },
            {
              href: "/dashboard/admin/analytics",
              icon: BarChart3,
              title: "Analytics",
              description: "View store performance",
              color: "from-[#050b2c] to-[#0a1854]",
            },
          ].map((action) => (
            <motion.div key={action.href} variants={item}>
              <Link href={action.href}>
                <Card
                  className="group relative overflow-hidden border-none bg-gradient-to-br hover:shadow-xl transition-all duration-300 text-white hover:scale-[1.02] h-[120px] flex items-center"
                  style={{
                    background: `linear-gradient(to bottom right, ${
                      action.color.includes("[#050b2c]") ? "#050b2c" : "#ffa509"
                    }, ${
                      action.color.includes("[#0a1854]") ? "#0a1854" : "#ff8c00"
                    })`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] transform translate-x-20 -translate-y-20 transition-transform group-hover:translate-x-16 group-hover:-translate-y-16 duration-700">
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-white/10">
                          <action.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {action.title}
                          </CardTitle>
                          <p className="text-sm opacity-80">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 opacity-50 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div variants={item}>
        <Card className="border-none bg-white shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-[#050b2c]">
                  Recent Orders
                </CardTitle>
                <p className="text-sm text-[#050b2c]/60 mt-1">
                  Latest transactions
                </p>
              </div>
              <Link href="/dashboard/admin/orders">
                <Button
                  variant="ghost"
                  className="gap-2 text-[#050b2c] hover:text-[#ffa509] transition-colors"
                >
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.orders.recent.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.orders.recent.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-[#050b2c]">
                        Order #{order.id.slice(-8)}
                      </p>
                      <div className="text-sm text-[#050b2c]/60">
                        {formatDistance(new Date(order.createdAt), new Date(), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#050b2c]">
                        ${order.total.toFixed(2)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-block
                        ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                            ? "bg-[#ffa509]/10 text-[#ffa509]"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#050b2c]/60">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                No recent orders
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
