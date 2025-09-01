"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FiShoppingCart, FiEye, FiClock } from "react-icons/fi";
import QuickView from "@/components/QuickView";
import CountdownTimer from "@/components/CountdownTimer";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxQuantityPerCustomer?: number;
}

interface FlashSale {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  products: Product[];
  isActive: boolean;
}

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/flash-sales/active");
        if (!response.ok) {
          throw new Error("Failed to fetch flash sales");
        }
        const data = await response.json();
        setFlashSales(data);
      } catch (err) {
        setError("Failed to load flash sales");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  const calculateDiscountedPrice = (
    price: number,
    discountType: string,
    discountValue: number
  ) => {
    if (discountType === "percentage") {
      return price - (price * discountValue) / 100;
    }
    return Math.max(0, price - discountValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffa509]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600 py-8">{error}</div>
        </div>
      </div>
    );
  }

  if (!flashSales || flashSales.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 py-8">
            No active flash sales at the moment
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#050b2c] text-white py-16">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            Flash Sales
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-300 text-lg"
          >
            Don't miss out on these amazing limited-time deals!
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {flashSales.map((sale) => {
            const startDate = new Date(sale.startDate);
            const endDate = new Date(sale.endDate);
            const now = new Date();
            const isUpcoming = startDate > now;

            return (
              <motion.div
                key={sale._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6 border-b">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#050b2c]">
                        {sale.name}
                      </h2>
                      <p className="text-gray-600 mt-1">{sale.description}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      {isUpcoming ? (
                        <div className="text-blue-500 text-sm font-medium flex items-center gap-2">
                          <FiClock className="w-5 h-5" />
                          Starts in:{" "}
                          <CountdownTimer endDate={startDate.toISOString()} />
                        </div>
                      ) : (
                        <div className="text-red-500 text-sm font-medium flex items-center gap-2">
                          <FiClock className="w-5 h-5" />
                          Ends in:{" "}
                          <CountdownTimer endDate={endDate.toISOString()} />
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(sale.startDate)} -{" "}
                        {formatDate(sale.endDate)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sale.products.map((product) => {
                      const discountedPrice = calculateDiscountedPrice(
                        product.price,
                        product.discountType,
                        product.discountValue
                      );

                      return (
                        <motion.div
                          key={product._id}
                          whileHover={{ y: -5 }}
                          className={`bg-white rounded-lg shadow-md overflow-hidden group relative ${
                            isUpcoming ? "opacity-75" : ""
                          }`}
                        >
                          <div className="relative">
                            <Link href={`/products/${product._id}`}>
                              <div className="relative h-48 w-full">
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                />
                              </div>
                            </Link>

                            {/* Discount Badge */}
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-md">
                              {product.discountType === "percentage"
                                ? `${product.discountValue}% OFF`
                                : `$${product.discountValue} OFF`}
                            </div>

                            {/* Quick View Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedProduct(product._id)}
                                className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-md flex items-center gap-2 transform transition-all duration-300"
                              >
                                <FiEye className="w-5 h-5" />
                                Quick View
                              </motion.button>
                            </div>
                          </div>

                          <div className="p-4">
                            <Link href={`/products/${product._id}`}>
                              <h3 className="text-lg font-semibold text-gray-800 hover:text-[#ffa509] transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                            </Link>

                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xl font-bold text-red-500">
                                ${discountedPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                            </div>

                            {product.maxQuantityPerCustomer && (
                              <p className="mt-2 text-sm text-gray-600">
                                Max {product.maxQuantityPerCustomer} per
                                customer
                              </p>
                            )}

                            <Link
                              href={`/products/${product._id}`}
                              className="block mt-4"
                            >
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                                  isUpcoming
                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                    : "bg-[#ffa509] text-white hover:bg-opacity-90"
                                }`}
                                disabled={isUpcoming}
                              >
                                <FiShoppingCart className="w-5 h-5" />
                                {isUpcoming ? "Coming Soon" : "Shop Now"}
                              </motion.button>
                            </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <QuickView
        productId={selectedProduct || ""}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
