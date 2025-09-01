"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  ChevronDown,
  Search,
  Calendar,
  MapPin,
  Phone,
  User,
  DollarSign,
  Package,
  Clock,
  BarChart3,
  Truck,
  Filter,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  attributes?: Record<string, string>;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  createdAt: string;
}

const statusColors = {
  pending: "bg-[#ffa509]/10 text-[#ffa509]",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-[#050b2c]/10 text-[#050b2c]",
  cancelled: "bg-[#c90b0b]/10 text-[#c90b0b]",
};

export default function CompletedOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("all"); // all, today, week, month
  const { toast } = useToast();

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders?status=completed");
      if (!response.ok) throw new Error("Failed to fetch completed orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load completed orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      toast({
        title: "Success",
        description: "Order status updated successfully",
      });

      fetchCompletedOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order._id
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const orderDate = new Date(order.createdAt);
    const now = new Date();

    switch (dateFilter) {
      case "today":
        return orderDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return orderDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return orderDate >= monthAgo;
      default:
        return true;
    }
  });

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );
  const averageOrderValue = totalRevenue / filteredOrders.length || 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#050b2c] border-t-transparent rounded-full"
        />
        <p className="mt-4 text-[#050b2c] font-medium">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 p-8"
      >
        <div className="p-4 bg-white rounded-full shadow-lg mb-4">
          <CheckCircle className="h-8 w-8 text-[#050b2c]" />
        </div>
        <h3 className="text-xl font-semibold text-[#050b2c]">
          No completed orders
        </h3>
        <p className="mt-2 text-[#050b2c]/60 text-center max-w-md">
          Orders that have been completed will appear here.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#050b2c]/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-[#050b2c]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#050b2c]">
                Completed Orders
              </h1>
              <p className="text-[#050b2c]/60">
                View and manage completed orders
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#050b2c]/40" />
              <input
                type="text"
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-[250px] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#050b2c]/20 focus:border-[#050b2c]"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px] border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter by date</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#050b2c]/10 rounded-lg">
                <Package className="h-6 w-6 text-[#050b2c]" />
              </div>
              <div>
                <p className="text-sm text-[#050b2c]/60">Total Orders</p>
                <p className="text-2xl font-bold text-[#050b2c]">
                  {filteredOrders.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ffa509]/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-[#ffa509]" />
              </div>
              <div>
                <p className="text-sm text-[#050b2c]/60">Total Revenue</p>
                <p className="text-2xl font-bold text-[#050b2c]">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#c90b0b]/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-[#c90b0b]" />
              </div>
              <div>
                <p className="text-sm text-[#050b2c]/60">Average Order Value</p>
                <p className="text-2xl font-bold text-[#050b2c]">
                  ${averageOrderValue.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#050b2c]/10"
              >
                {/* Order Header */}
                <div className="p-6 bg-gradient-to-r from-[#050b2c]/10 to-transparent">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#050b2c] flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-[#050b2c]" />
                        Order #{order._id.slice(-8)}
                      </h3>
                      <div className="flex items-center gap-2 text-[#050b2c]/60 mt-1">
                        <Calendar className="h-4 w-4" />
                        <p className="text-sm">
                          Completed on {formatDate(new Date(order.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) =>
                          handleStatusChange(order._id, value)
                        }
                      >
                        <SelectTrigger className="w-[180px] border-[#050b2c]/20">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="p-2 hover:bg-[#050b2c]/10 rounded-lg transition-colors"
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            expandedOrders.includes(order._id)
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <AnimatePresence>
                  {expandedOrders.includes(order._id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Products */}
                      <div className="p-6 border-t border-[#050b2c]/10">
                        <h4 className="text-sm font-medium text-[#050b2c]/60 mb-4 flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Order Items
                        </h4>
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div
                              key={item.productId}
                              className="flex items-center gap-4 p-4 bg-[#050b2c]/5 rounded-lg hover:bg-[#050b2c]/10 transition-colors"
                            >
                              <div className="relative h-16 w-16 flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-[#050b2c] truncate">
                                  {item.name}
                                </h4>
                                <div className="mt-1 text-sm text-[#050b2c]/60">
                                  <p>Quantity: {item.quantity}</p>
                                  {item.attributes && (
                                    <p className="truncate">
                                      {Object.entries(item.attributes)
                                        .map(
                                          ([key, value]) =>
                                            `${
                                              key.charAt(0).toUpperCase() +
                                              key.slice(1)
                                            }: ${value}`
                                        )
                                        .join(", ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-[#050b2c]">
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping & Total */}
                      <div className="p-6 grid md:grid-cols-2 gap-6 border-t border-[#050b2c]/10">
                        <div>
                          <h4 className="text-sm font-medium text-[#050b2c]/60 mb-4 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Shipping Address
                          </h4>
                          <div className="space-y-2 text-sm text-[#050b2c]">
                            <p className="flex items-center gap-2">
                              <User className="h-4 w-4 text-[#050b2c]/40" />
                              {order.shippingAddress.fullName}
                            </p>
                            <p>{order.shippingAddress.addressLine1}</p>
                            {order.shippingAddress.addressLine2 && (
                              <p>{order.shippingAddress.addressLine2}</p>
                            )}
                            <p>
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state}{" "}
                              {order.shippingAddress.postalCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                            <p className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-[#050b2c]/40" />
                              {order.shippingAddress.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-end">
                          <div className="bg-[#050b2c]/5 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[#050b2c]/60">
                                Subtotal
                              </span>
                              <span className="font-medium text-[#050b2c]">
                                ${order.total.toFixed(2)}
                              </span>
                            </div>
                            <div className="border-t border-[#050b2c]/10 pt-2 mt-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-[#050b2c]">
                                  Total
                                </span>
                                <span className="text-lg font-bold text-[#050b2c]">
                                  ${order.total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
