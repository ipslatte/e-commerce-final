"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface SaleItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

interface SalesData {
  sales: SaleItem[];
  totalPages: number;
  currentPage: number;
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  monthlyGrowth: {
    revenue: number;
    sales: number;
  };
}

export default function ProductSalesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("7days");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/admin/products/sales?timeframe=${timeframe}&page=${currentPage}&search=${searchQuery}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch sales data");
        }

        setSalesData(data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [timeframe, currentPage, searchQuery]);

  if (status === "loading" || isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5"
      >
        <div className="w-12 h-12 border-4 border-[#ffa509] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#050b2c] font-medium">Loading sales data...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffa509]/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-[#ffa509]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#050b2c]">
                Sales Analytics
              </h1>
              <p className="text-[#050b2c]/60">
                Monitor your product sales performance
              </p>
            </div>
          </div>

          {/* Time Frame Selector */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm">
            {[
              { value: "7days", label: "7 Days" },
              { value: "30days", label: "30 Days" },
              { value: "90days", label: "90 Days" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeframe === option.value
                    ? "bg-[#050b2c] text-white"
                    : "text-[#050b2c]/60 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border-l-4 border-[#c90b0b] text-[#c90b0b] p-4 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">Error:</span> {error}
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-[#050b2c] to-[#0a1854] p-6 rounded-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <DollarSign className="h-6 w-6" />
              </div>
              {salesData?.monthlyGrowth?.revenue &&
              salesData.monthlyGrowth.revenue > 0 ? (
                <div className="flex items-center gap-1 text-green-400">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm">
                    +{salesData.monthlyGrowth.revenue}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-400">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="text-sm">
                    {salesData?.monthlyGrowth?.revenue}%
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-white/60">Total Revenue</h3>
            <p className="text-3xl font-bold mt-1">
              ${salesData?.totalRevenue?.toFixed(2) || "0.00"}
            </p>
          </div>

          {/* Total Sales Card */}
          <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-6 rounded-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
              {salesData?.monthlyGrowth?.sales &&
              salesData.monthlyGrowth.sales > 0 ? (
                <div className="flex items-center gap-1 text-green-400">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm">
                    +{salesData.monthlyGrowth.sales}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-400">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="text-sm">
                    {salesData?.monthlyGrowth?.sales}%
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-white/60">Total Sales</h3>
            <p className="text-3xl font-bold mt-1">
              {salesData?.totalSales || 0}
            </p>
          </div>

          {/* Average Order Value Card */}
          <div className="bg-gradient-to-br from-[#050b2c] to-[#0a1854] p-6 rounded-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-white/60">
              Average Order Value
            </h3>
            <p className="text-3xl font-bold mt-1">
              ${salesData?.averageOrderValue?.toFixed(2) || "0.00"}
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#050b2c]/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
            />
          </div>
        </div>

        {/* Sales Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!salesData ||
                !salesData.sales ||
                salesData.sales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-[#050b2c]/60">
                        <DollarSign className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-1">
                          No Sales Data
                        </p>
                        <p className="text-sm">
                          {searchQuery
                            ? "No sales found matching your search criteria"
                            : "No sales recorded for the selected time period"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  salesData.sales.map((sale) => (
                    <motion.tr
                      key={sale._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <Image
                              src={sale.productImage}
                              alt={sale.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#050b2c]">
                              {sale.productName}
                            </div>
                            <div className="text-xs text-[#050b2c]/40">
                              ID: {sale.productId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#050b2c]">
                          {new Date(sale.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-[#050b2c]/40">
                          {new Date(sale.date).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#050b2c]">
                          {sale.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#050b2c]">
                          ${sale.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#050b2c]">
                          ${sale.total.toFixed(2)}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {salesData && salesData.totalPages > 1 && (
            <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#050b2c]/60">
                    Showing page{" "}
                    <span className="font-medium">{salesData.currentPage}</span>{" "}
                    of{" "}
                    <span className="font-medium">{salesData.totalPages}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-[#050b2c] hover:bg-[#ffa509]/5 hover:text-[#ffa509]"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === salesData.totalPages}
                    className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                      currentPage === salesData.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-[#050b2c] hover:bg-[#ffa509]/5 hover:text-[#ffa509]"
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
