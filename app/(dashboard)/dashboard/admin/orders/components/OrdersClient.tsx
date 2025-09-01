"use client";

import { useEffect, useState } from "react";
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
  Package,
  Clock,
  MapPin,
  Phone,
  User,
  ChevronDown,
  Search,
  Filter,
  ShoppingBag,
  Calendar,
  DollarSign,
  Truck,
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
  pending: "bg-[#ffa509]/10 text-[#ffa509] border-[#ffa509]",
  processing: "bg-blue-100 text-blue-600 border-blue-600",
  completed: "bg-green-100 text-green-600 border-green-600",
  cancelled: "bg-[#c90b0b]/10 text-[#c90b0b] border-[#c90b0b]",
};

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
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
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#ffa509] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 rounded-2xl"
      >
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <ShoppingBag className="h-16 w-16 text-[#ffa509] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#050b2c]">
            No orders yet
          </h3>
          <p className="mt-2 text-[#050b2c]/60 max-w-md">
            When customers make purchases, their orders will appear here.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6 bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 min-h-screen rounded-2xl"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#ffa509]/10 rounded-lg shrink-0">
              <ShoppingBag className="h-5 w-5 text-[#ffa509]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#050b2c]/60 truncate">Total Orders</p>
              <p className="text-xl font-bold text-[#050b2c] truncate">
                {orders.length}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#050b2c]/10 rounded-lg shrink-0">
              <DollarSign className="h-5 w-5 text-[#050b2c]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#050b2c]/60 truncate">
                Total Revenue
              </p>
              <p className="text-xl font-bold text-[#050b2c] truncate">
                $
                {orders
                  .reduce((sum, order) => sum + order.total, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#c90b0b]/10 rounded-lg shrink-0">
              <Clock className="h-5 w-5 text-[#c90b0b]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#050b2c]/60 truncate">
                Pending Orders
              </p>
              <p className="text-xl font-bold text-[#050b2c] truncate">
                {orders.filter((order) => order.status === "pending").length}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg shrink-0">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#050b2c]/60 truncate">Processing</p>
              <p className="text-xl font-bold text-[#050b2c] truncate">
                {orders.filter((order) => order.status === "processing").length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#050b2c]/40" />
            <input
              type="text"
              placeholder="Search orders by ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#050b2c]/60" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-gray-200 bg-gray-50">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Order Header */}
              <div className="p-6 bg-gradient-to-r from-[#050b2c]/5 to-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-[#050b2c] flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#ffa509]" />
                        Order #{order._id.slice(-8)}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#050b2c]/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(new Date(order.createdAt))}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />$
                        {order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) =>
                        handleStatusChange(order._id, value)
                      }
                    >
                      <SelectTrigger className="w-[180px] border-gray-200 bg-white">
                        <SelectValue placeholder="Update status" />
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
                      className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                    >
                      <ChevronDown
                        className={`h-5 w-5 text-[#050b2c]/60 transition-transform duration-200 ${
                          expandedOrders.has(order._id) ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <AnimatePresence>
                {expandedOrders.has(order._id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Order Items */}
                    <div className="p-6 border-t border-dashed border-gray-200">
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div
                            key={`${order._id}-${item.productId}-${index}`}
                            className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white shadow-sm">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-[#050b2c]">
                                {item.name}
                              </h4>
                              <div className="mt-1 text-sm text-[#050b2c]/60 space-y-1">
                                <p>Quantity: {item.quantity}</p>
                                {item.attributes && (
                                  <p>
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
                              <p className="text-sm text-[#050b2c]/60">
                                Total: $
                                {(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Total */}
                    <div className="p-6 grid md:grid-cols-2 gap-6 border-t border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-[#050b2c] mb-4 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#ffa509]" />
                          Shipping Address
                        </h4>
                        <div className="space-y-2 text-sm text-[#050b2c]/60">
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <User className="h-4 w-4" />
                            <p>{order.shippingAddress.fullName}</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
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
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Phone className="h-4 w-4" />
                            <p>{order.shippingAddress.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="bg-[#050b2c] text-white rounded-lg p-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white/60">Subtotal</span>
                            <span className="font-medium">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-white/60">Shipping</span>
                            <span className="font-medium">$0.00</span>
                          </div>
                          <div className="border-t border-white/10 pt-4">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total</span>
                              <span className="text-lg font-semibold">
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
  );
}
