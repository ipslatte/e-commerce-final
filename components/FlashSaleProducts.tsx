"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiShoppingCart, FiEye, FiClock } from "react-icons/fi";
import QuickView from "./QuickView";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  rating?: number;
  numReviews?: number;
  stock: number;
  sold: number;
}

interface FlashSaleProduct extends Product {
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
  products: FlashSaleProduct[];
  isActive: boolean;
}

export default function FlashSaleProducts() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const response = await fetch("/api/flash-sales/active");
        if (!response.ok) {
          throw new Error("Failed to fetch flash sales");
        }
        const data = await response.json();
        console.log("Fetched flash sales:", data); // Debug log
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
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffa509]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  if (!flashSales || flashSales.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No active flash sales
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {flashSales.map((sale) => {
        // Parse dates
        const startDate = new Date(sale.startDate);
        const endDate = new Date(sale.endDate);
        const now = new Date();
        const isUpcoming = startDate > now;

        return (
          <motion.div
            key={sale._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#050b2c] to-[#1a1f42] rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{sale.name}</h2>
                  <p className="text-white/80 mt-1">{sale.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  {isUpcoming ? (
                    <div className="text-blue-400 text-sm font-medium flex items-center gap-2">
                      <FiClock className="w-5 h-5" />
                      Starts in: <CountdownTimer endDate={startDate} />
                    </div>
                  ) : (
                    <div className="text-[#ffa509] text-sm font-medium flex items-center gap-2">
                      <FiClock className="w-5 h-5" />
                      Ends in: <CountdownTimer endDate={endDate} />
                    </div>
                  )}
                  <div className="text-xs text-white/60 mt-1">
                    {formatDate(sale.startDate)} - {formatDate(sale.endDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className={`bg-white rounded-lg overflow-hidden group relative ${
                        isUpcoming ? "opacity-75" : ""
                      }`}
                    >
                      {/* Sale Status Banner */}
                      <div
                        className={`absolute top-0 left-0 right-0 text-center py-1 text-xs font-bold text-white ${
                          isUpcoming ? "bg-blue-500" : "bg-[#ffa509]"
                        }`}
                      >
                        {isUpcoming ? "Coming Soon" : "Flash Sale"}
                      </div>

                      <div className="p-4 pt-8">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="relative w-32 h-32 flex-shrink-0">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-contain rounded-lg"
                              sizes="128px"
                            />
                            {/* Discount Badge */}
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold w-12 h-12 rounded-full flex items-center justify-center transform rotate-12">
                              {product.discountType === "percentage"
                                ? `${product.discountValue}%`
                                : `$${product.discountValue}`}
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <Link href={`/products/${product._id}`}>
                              <h3 className="text-lg font-semibold text-[#050b2c] hover:text-[#ffa509] transition-colors line-clamp-2">
                                {product.name}
                              </h3>
                            </Link>

                            {/* Ratings */}
                            <div className="flex items-center gap-1 mt-2">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <svg
                                  key={index}
                                  className={`w-4 h-4 ${
                                    index < (product.rating || 0)
                                      ? "text-[#ffa509]"
                                      : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-sm text-gray-600 ml-1">
                                ({product.numReviews || 0})
                              </span>
                            </div>

                            {/* Price */}
                            <div className="mt-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-[#050b2c]">
                                  ${discountedPrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className="text-sm text-red-500 font-medium">
                                  Save $
                                  {(product.price - discountedPrice).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Stock Status */}
                            <div className="mt-2 flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-600">
                                  Stock:
                                </span>
                                <span
                                  className={`text-sm font-medium ${
                                    (product.stock || 0) > 10
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {product.stock || 0} left
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-600">
                                  Sold:
                                </span>
                                <span className="text-sm font-medium text-[#050b2c]">
                                  {product.sold || 0}
                                </span>
                              </div>
                            </div>

                            {/* Max Quantity */}
                            {product.maxQuantityPerCustomer && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="text-sm text-gray-600">
                                  Limit:
                                </span>
                                <span className="text-sm font-medium text-[#050b2c]">
                                  {product.maxQuantityPerCustomer} per order
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/products/${product._id}`}
                            className="flex-1"
                          >
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                                isUpcoming
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-[#050b2c] text-white hover:bg-opacity-90"
                              }`}
                              disabled={isUpcoming}
                            >
                              <FiShoppingCart className="w-4 h-4" />
                              {isUpcoming ? "Coming Soon" : "View Details"}
                            </motion.button>
                          </Link>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedProduct(product._id)}
                            className="p-2.5 bg-[#ffa509] text-white rounded-md hover:bg-opacity-90"
                          >
                            <FiEye className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* Progress Bar for Stock */}
                        <div className="mt-4">
                          {(product.sold || 0) + (product.stock || 0) > 0 && (
                            <>
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#ffa509] rounded-full"
                                  style={{
                                    width: `${
                                      ((product.sold || 0) /
                                        ((product.sold || 0) +
                                          (product.stock || 0))) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1 text-center">
                                {Math.round(
                                  ((product.sold || 0) /
                                    ((product.sold || 0) +
                                      (product.stock || 0))) *
                                    100
                                )}
                                % Sold
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      })}

      <QuickView
        productId={selectedProduct || ""}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

function CountdownTimer({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const total = endDate.getTime() - Date.now();
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    return { hours, minutes, seconds, total };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = getTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.total <= 0) {
    return <span>Sale ended</span>;
  }

  return (
    <span className="font-mono">
      {String(timeLeft.hours).padStart(2, "0")}:
      {String(timeLeft.minutes).padStart(2, "0")}:
      {String(timeLeft.seconds).padStart(2, "0")}
    </span>
  );
}
