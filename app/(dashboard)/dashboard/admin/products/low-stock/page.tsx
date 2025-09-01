"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  stockStatus: string;
  stockPercentage: number;
  coverImage: string;
}

export default function LowStockProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    const fetchLowStockProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/admin/products/low-stock?page=${currentPage}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch low stock products");
        }

        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching low stock products:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLowStockProducts();
  }, [currentPage]);

  if (status === "loading" || isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <div className="w-12 h-12 border-4 border-[#ffa509] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#050b2c] font-medium">Loading products...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-6 w-6 text-[#ffa509]" />
          <div>
            <h1 className="text-2xl font-bold text-[#050b2c]">
              Low Stock Products
            </h1>
            <p className="mt-1 text-[#050b2c]/60">
              Monitor and manage products with low inventory levels
            </p>
          </div>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border-l-4 border-[#c90b0b] text-[#c90b0b] rounded"
        >
          <p className="flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <Image
                          src={product.coverImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#050b2c]">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#050b2c]/60">
                      {product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          product.stockStatus === "Out of Stock"
                            ? "bg-[#c90b0b]"
                            : "bg-[#ffa509]"
                        }`}
                      ></div>
                      <div className="text-sm font-medium text-[#050b2c]">
                        {product.stock} units
                      </div>
                      <div className="text-xs text-[#050b2c]/40">
                        ({product.stockPercentage}%)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-[#050b2c]">
                        {product.lowStockThreshold}
                      </div>
                      <div className="text-xs text-[#050b2c]/40">units</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/admin/products/edit/${product._id}`
                        )
                      }
                      className="text-[#050b2c] hover:text-[#ffa509] transition-colors p-2 rounded-lg hover:bg-[#ffa509]/5"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[#050b2c]/60">
                Showing page <span className="font-medium">{currentPage}</span>{" "}
                of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <nav className="relative z-0 inline-flex -space-x-px">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-[#050b2c] hover:bg-[#ffa509]/5 hover:text-[#ffa509]"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "z-10 bg-[#ffa509]/10 text-[#ffa509] hover:bg-[#ffa509]/20"
                        : "bg-white text-[#050b2c]/60 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-[#050b2c] hover:bg-[#ffa509]/5 hover:text-[#ffa509]"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
