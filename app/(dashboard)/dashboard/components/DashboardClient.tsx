"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  User,
  Package,
  Clock,
  CreditCard,
  MapPin,
  ChevronRight,
  Star,
  Settings,
} from "lucide-react";
import { formatDistance } from "date-fns";
import { ObjectId } from "mongodb";

interface Order {
  _id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
}

interface DashboardClientProps {
  user: {
    name: string;
    email: string;
  };
  data: {
    recentOrders: Order[];
    totalOrders: number;
    wishlistCount: number;
    totalSpent: number;
    addressCount: number;
  };
}

const stats = [
  {
    title: "Total Orders",
    value: (totalOrders: number) => totalOrders,
    icon: ShoppingBag,
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Wishlist Items",
    value: (wishlistCount: number) => wishlistCount,
    icon: Heart,
    color: "from-pink-500 to-pink-600",
  },
  {
    title: "Total Spent",
    value: (totalSpent: number) =>
      `$${totalSpent.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    icon: CreditCard,
    color: "from-[#ffa509] to-[#ff8c00]",
  },
  {
    title: "Saved Addresses",
    value: (addressCount: number) => addressCount,
    icon: MapPin,
    color: "from-green-500 to-green-600",
  },
];

const quickActions = [
  {
    title: "My Wishlist",
    description: (wishlistCount: number) => `${wishlistCount} saved items`,
    icon: Heart,
    href: "/dashboard/wishlist",
    color: "from-pink-500 to-pink-600",
  },
  {
    title: "My Reviews",
    description: "View and manage reviews",
    icon: Star,
    href: "/dashboard/reviews",
    color: "from-[#ffa509] to-[#ff8c00]",
  },
  {
    title: "Account Settings",
    description: "Update your preferences",
    icon: Settings,
    href: "/dashboard/settings",
    color: "from-[#050b2c] to-[#0a1854]",
  },
];

export default function DashboardClient({ user, data }: DashboardClientProps) {
  const { recentOrders, totalOrders, wishlistCount, totalSpent, addressCount } =
    data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#050b2c] to-[#050b2c]/90 rounded-2xl p-8 text-white shadow-xl"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}</h1>
          <p className="text-white/80">
            Here's an overview of your account activity
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const value = stat.value(
              stat.title === "Total Orders"
                ? totalOrders
                : stat.title === "Wishlist Items"
                ? wishlistCount
                : stat.title === "Total Spent"
                ? totalSpent
                : addressCount
            );

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-500 truncate">
                          {stat.title}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-[#050b2c] truncate">
                          {value}
                        </p>
                      </div>
                      <div
                        className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-r ${stat.color}`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#050b2c]">
                  Recent Orders
                </h2>
                <p className="text-gray-500 mt-1">
                  Track your recent purchases
                </p>
              </div>
              <Link
                href="/dashboard/orders"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[#050b2c] hover:bg-[#050b2c]/5 transition-colors"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-[#050b2c]">
                  No orders yet
                </h3>
                <p className="text-gray-500 mt-1">
                  Start shopping to see your orders here
                </p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#050b2c]/5 rounded-xl">
                        <Package className="h-6 w-6 text-[#050b2c]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#050b2c]">
                          Order #{order._id}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDistance(
                            new Date(order.createdAt),
                            new Date(),
                            {
                              addSuffix: true,
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#050b2c]">
                        ${order.total.toFixed(2)}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffa509]/10 text-[#ffa509]">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const description =
              typeof action.description === "function"
                ? action.description(wishlistCount)
                : action.description;

            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="h-full"
              >
                <Link href={action.href} className="h-full block">
                  <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative h-full">
                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-r ${action.color}`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-[#050b2c] group-hover:text-[#ffa509] transition-colors truncate">
                            {action.title}
                          </h3>
                          <p className="text-gray-500 truncate">
                            {description}
                          </p>
                        </div>
                        <ChevronRight className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-[#ffa509] transition-colors" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
