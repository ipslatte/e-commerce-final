"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Package, Truck, MapPin } from "lucide-react";
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
  status: "pending" | "processing";
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
  estimatedDelivery?: string;
  trackingNumber?: string;
  currentLocation?: string;
}

const statusColors = {
  pending: "from-yellow-400 to-yellow-500",
  processing: "from-blue-400 to-blue-500",
};

const statusIcons = {
  pending: "⏳",
  processing: "🔄",
};

const deliverySteps = [
  { icon: Package, label: "Order Confirmed" },
  { icon: Package, label: "Processing" },
  { icon: Truck, label: "In Transit" },
  { icon: MapPin, label: "Delivered" },
];

export default function ActiveOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const response = await fetch("/api/orders/active");
      if (!response.ok) throw new Error("Failed to fetch active orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load active orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryProgress = (status: string) => {
    switch (status) {
      case "pending":
        return 1;
      case "processing":
        return 2;
      default:
        return 0;
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
            No active orders
          </h3>
          <p className="text-gray-600">
            You don't have any orders currently in progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      {orders.map((order) => (
        <motion.div
          key={order._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="p-6">
            {/* Order Header */}
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

            {/* Delivery Progress */}
            <div className="bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-[#050b2c] mb-6">
                Delivery Status
              </h4>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
                <div
                  className="absolute top-5 left-5 h-0.5 bg-[#ffa509] transition-all duration-500"
                  style={{
                    width: `${
                      (getDeliveryProgress(order.status) /
                        (deliverySteps.length - 1)) *
                      100
                    }%`,
                  }}
                />

                {/* Steps */}
                <div className="relative grid grid-cols-4 gap-2">
                  {deliverySteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index < getDeliveryProgress(order.status);
                    const isCurrent =
                      index === getDeliveryProgress(order.status);

                    return (
                      <div
                        key={step.label}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isActive || isCurrent
                              ? "bg-[#ffa509] text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <p
                          className={`mt-2 text-sm font-medium text-center ${
                            isActive || isCurrent
                              ? "text-[#050b2c]"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Delivery */}
              {order.estimatedDelivery && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-semibold text-[#050b2c]">
                    {formatDate(new Date(order.estimatedDelivery))}
                  </p>
                </div>
              )}
            </div>

            {/* Order Items */}
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

            {/* Shipping Details */}
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
