"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users as UsersIcon,
  Search,
  Filter,
  Plus,
  UserCheck,
  UserX,
  Clock,
  ShoppingBag,
  DollarSign,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  Crown,
  Calendar,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  createdAt: string;
  lastLogin?: string;
  status: "active" | "inactive" | "blocked";
  ordersCount: number;
  totalSpent: number;
}

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "orders">("date");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      toast.success("User status updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update user status"
      );
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "orders":
          return b.ordersCount - a.ordersCount;
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="h-4 w-4" />;
      case "blocked":
        return <UserX className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050b2c]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#ffa509] border-t-transparent rounded-full"
        />
        <p className="mt-4 text-white/80 font-medium">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b2c] p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Users</h1>
              <p className="text-white/80">
                Manage your store users and customers
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/users/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#050b2c] rounded-xl hover:bg-white/90 transition-colors font-medium shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add Customer</span>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ffa509] rounded-xl">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">
                  {filteredUsers.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ffa509] rounded-xl">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-white">
                  {filteredUsers.reduce(
                    (sum, user) => sum + user.ordersCount,
                    0
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ffa509] rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white">
                  $
                  {filteredUsers
                    .reduce((sum, user) => sum + user.totalSpent, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#ffa509]/50"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#ffa509]/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#ffa509]/50"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "name" | "date" | "orders")
                }
                className="px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#ffa509]/50"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="orders">Sort by Orders</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredUsers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="md:col-span-2 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center"
              >
                <UsersIcon className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No Users Found
                </h3>
                <p className="text-white/60">
                  Try adjusting your search or filter criteria
                </p>
              </motion.div>
            ) : (
              filteredUsers.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-[#ffa509]/50 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            user.role === "admin"
                              ? "bg-[#ffa509]"
                              : "bg-white/10"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <Crown className="h-6 w-6 text-white" />
                          ) : (
                            getStatusIcon(user.status)
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-[#ffa509] transition-colors">
                            {user.name}
                          </h3>
                          <p className="text-white/60 text-sm">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Joined{" "}
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {user.role !== "admin" && (
                        <button
                          onClick={() =>
                            handleStatusChange(
                              user._id,
                              user.status === "blocked" ? "active" : "blocked"
                            )
                          }
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            user.status === "blocked"
                              ? "bg-white/10 text-white hover:bg-white/20"
                              : "bg-[#c90b0b]/20 text-[#c90b0b] hover:bg-[#c90b0b]/30"
                          }`}
                        >
                          {user.status === "blocked" ? "Unblock" : "Block"}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                          <ShoppingBag className="h-4 w-4" />
                          <span>Orders</span>
                        </div>
                        <p className="text-xl font-bold text-white">
                          {user.ordersCount}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Total Spent</span>
                        </div>
                        <p className="text-xl font-bold text-white">
                          ${user.totalSpent.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
