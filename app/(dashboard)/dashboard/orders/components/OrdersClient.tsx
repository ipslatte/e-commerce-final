"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

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
  pending: "from-yellow-400 to-yellow-500",
  processing: "from-blue-400 to-blue-500",
  completed: "from-green-400 to-green-500",
  cancelled: "from-red-400 to-red-500",
};

const statusIcons = {
  pending: "⏳",
  processing: "🔄",
  completed: "✅",
  cancelled: "❌",
};

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#ffa509]" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <h3 className="text-xl font-semibold text-[#050b2c] mb-3">
            No orders yet
          </h3>
          <p className="text-gray-600">
            When you make a purchase, your orders will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {orders.map((order) => (
        <motion.div
          key={order._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-[#050b2c]">
                    Order #{order._id.slice(-8)}
                  </h3>
                  <div
                    className={`px-4 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${
                      statusColors[order.status]
                    } flex items-center gap-2`}
                  >
                    <span>{statusIcons[order.status]}</span>
                    <span>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 mt-1">
                  Placed on {formatDate(new Date(order.createdAt))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Total</p>
                <p className="text-2xl font-bold text-[#050b2c]">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-6">
              <div className="grid gap-6">
                {order.items.map((item) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-6"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-xl"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#050b2c] text-lg mb-1">
                        {item.name}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Quantity: {item.quantity}</p>
                        {item.attributes && (
                          <p>
                            {Object.entries(item.attributes)
                              .map(
                                ([key, value]) =>
                                  `${
                                    key.charAt(0).toUpperCase() + key.slice(1)
                                  }: ${value}`
                              )
                              .join(", ")}
                          </p>
                        )}
                      </div>
                      <p className="mt-2 font-medium text-[#ffa509]">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 rounded-xl p-6">
              <h4 className="font-semibold text-[#050b2c] mb-4">
                Shipping Details
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 font-medium mb-2">Recipient</p>
                  <p className="text-[#050b2c]">
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="text-[#050b2c]">
                    {order.shippingAddress.phone}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-2">
                    Delivery Address
                  </p>
                  <p className="text-[#050b2c]">
                    {order.shippingAddress.addressLine1}
                  </p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="text-[#050b2c]">
                      {order.shippingAddress.addressLine2}
                    </p>
                  )}
                  <p className="text-[#050b2c]">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-[#050b2c]">
                    {order.shippingAddress.country}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
