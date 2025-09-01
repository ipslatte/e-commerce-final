"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BarChart2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Package,
  TrendingUp,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  category: string;
  views: number;
  lastViewed: string;
  coverImage: string;
  stock: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function MostViewedProductsPage() {
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
    const fetchMostViewedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/admin/products/most-viewed?page=${currentPage}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch most viewed products");
        }

        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching most viewed products:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostViewedProducts();
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 p-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#ffa509]/10 rounded-lg">
            <BarChart2 className="h-6 w-6 text-[#ffa509]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#050b2c]">
              Most Viewed Products
            </h1>
            <p className="text-[#050b2c]/60">
              Track and analyze your most popular products
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <motion.div
            variants={item}
            className="bg-gradient-to-br from-[#050b2c] to-[#0a1854] p-6 rounded-xl text-white"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Views</p>
                <p className="text-2xl font-bold">
                  {products
                    .reduce((sum, product) => sum + product.views, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-6 rounded-xl text-white"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-white/60">Most Viewed</p>
                <p className="text-2xl font-bold">
                  {products[0]?.views.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-gradient-to-br from-[#050b2c] to-[#0a1854] p-6 rounded-xl text-white"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 border-l-4 border-[#c90b0b] text-[#c90b0b] rounded"
        >
          <p className="flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </p>
        </motion.div>
      )}

      {/* Product Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              variants={item}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={product.coverImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1 bg-[#050b2c] text-white text-sm font-medium rounded-full">
                    #{index + 1}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#050b2c] line-clamp-1">
                    {product.name}
                  </h3>
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/admin/products/edit/${product._id}`
                      )
                    }
                    className="p-2 text-[#050b2c] hover:text-[#ffa509] hover:bg-[#ffa509]/5 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#050b2c]/60">Category</span>
                    <span className="font-medium text-[#050b2c]">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#050b2c]/60">Views</span>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#ffa509]" />
                      <span className="font-medium text-[#050b2c]">
                        {product.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#050b2c]/60">Stock</span>
                    <span className="font-medium text-[#050b2c]">
                      {product.stock} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#050b2c]/60">Last Viewed</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#ffa509]" />
                      <span className="font-medium text-[#050b2c]">
                        {product.lastViewed}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center">
          <nav className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-[#ffa509]/10 text-[#ffa509] border-[#ffa509]"
                        : "bg-white text-[#050b2c]/60 hover:bg-[#ffa509]/5 hover:text-[#ffa509]"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#050b2c] hover:bg-[#ffa509]/5 hover:text-[#ffa509]"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </motion.div>
    </motion.div>
  );
}
