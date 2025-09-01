"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Analytics {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryDistribution: { [key: string]: number };
  salesTrends: {
    labels: string[];
    data: number[];
  };
  topProducts: {
    labels: string[];
    sales: number[];
    revenue: number[];
  };
  stockLevels: {
    labels: string[];
    data: number[];
  };
}

export default function ProductAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/products/analytics");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch analytics");
        }

        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (status === "loading" || isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <div className="w-12 h-12 border-4 border-[#ffa509] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#050b2c] font-medium">Loading analytics...</p>
      </motion.div>
    );
  }

  if (!analytics) return null;

  const salesTrendsConfig = {
    labels: analytics.salesTrends?.labels || [],
    datasets: [
      {
        label: "Sales Trend",
        data: analytics.salesTrends?.data || [],
        borderColor: "#ffa509",
        backgroundColor: "rgba(255, 165, 9, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const topProductsConfig = {
    labels: analytics.topProducts?.labels || [],
    datasets: [
      {
        label: "Sales",
        data: analytics.topProducts?.sales || [],
        backgroundColor: "#050b2c",
        borderColor: "#050b2c",
        borderWidth: 1,
        categoryPercentage: 0.5,
        barPercentage: 0.8,
      },
      {
        label: "Revenue",
        data: analytics.topProducts?.revenue || [],
        backgroundColor: "#ffa509",
        borderColor: "#ffa509",
        borderWidth: 1,
        categoryPercentage: 0.5,
        barPercentage: 0.8,
      },
    ],
  };

  const categoryDistributionConfig = {
    labels: Object.keys(analytics.categoryDistribution || {}),
    datasets: [
      {
        data: Object.values(analytics.categoryDistribution || {}),
        backgroundColor: [
          "rgba(5, 11, 44, 0.8)",
          "rgba(255, 165, 9, 0.8)",
          "rgba(201, 11, 11, 0.8)",
          "rgba(5, 11, 44, 0.6)",
          "rgba(255, 165, 9, 0.6)",
        ],
        borderColor: ["#050b2c", "#ffa509", "#c90b0b", "#050b2c", "#ffa509"],
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-[#050b2c]">
            Product Analytics
          </h1>
          <div className="ml-auto flex items-center space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 text-[#050b2c] flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Refresh Data</span>
            </button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-[#c90b0b] text-[#c90b0b] px-4 py-3 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </motion.div>
        )}

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Total Products
              </h3>
              <div className="p-2 bg-[#050b2c] bg-opacity-10 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#050b2c]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#050b2c]">
              {analytics.totalProducts}
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">In stock</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
              <div className="p-2 bg-[#ffa509] bg-opacity-10 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#ffa509]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#050b2c]">
              {analytics.totalSales}
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Total orders</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Total Revenue
              </h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#050b2c]">
              ${analytics.totalRevenue.toFixed(2)}
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Gross revenue</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Average Price
              </h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#050b2c]">
              ${analytics.averagePrice.toFixed(2)}
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Per product</span>
            </div>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold text-[#050b2c] mb-6">
              Sales Trends
            </h3>
            <div className="h-80">
              <Line
                data={salesTrendsConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top" as const,
                      labels: {
                        font: {
                          size: 12,
                        },
                        usePointStyle: true,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0,0,0,0.05)",
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold text-[#050b2c] mb-6">
              Top Products
            </h3>
            {(() => {
              console.log("Top Products Data:", {
                labels: analytics.topProducts?.labels,
                sales: analytics.topProducts?.sales,
                revenue: analytics.topProducts?.revenue,
              });
              return null;
            })()}
            <div className="h-80 bg-gray-50">
              <Bar
                data={topProductsConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: "x",
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                  },
                  scales: {
                    x: {
                      stacked: false,
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      stacked: false,
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0,0,0,0.05)",
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-[#050b2c] mb-6">
              Category Distribution
            </h3>
            <div className="h-96">
              <Doughnut
                data={categoryDistributionConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right" as const,
                      labels: {
                        font: {
                          size: 12,
                        },
                        usePointStyle: true,
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
