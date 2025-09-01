"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FiEye, FiShoppingCart } from "react-icons/fi";
import QuickView from "./QuickView";
import type { Product } from "@/types";

export default function MostViewedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    const fetchMostViewedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching most viewed products...");

        const response = await fetch("/api/products/most-viewed?limit=4");
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch most viewed products: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Fetched products:", data);

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        setProducts(data);
      } catch (error) {
        console.error("Error fetching most viewed products:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMostViewedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffa509]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500 py-8">{error}</div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 py-8">
            No viewed products found
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8"
        >
          <h2 className="text-2xl font-bold">Most Viewed Products</h2>
          <Link
            href="/products"
            className="text-[#ffa509] hover:text-[#050b2c] transition-colors"
          >
            View All Products
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden group"
            >
              <div className="relative overflow-hidden">
                {/* Views Badge */}
                <div className="absolute top-2 left-2 bg-[#050b2c] text-white text-xs font-bold px-2 py-1 rounded-md z-20 flex items-center gap-1">
                  <FiEye className="w-4 h-4" />
                  {product.views || 0} views
                </div>

                {/* Product Image */}
                <div className="relative">
                  <Link href={`/products/${product._id}`}>
                    <div className="relative h-48 w-full">
                      <Image
                        src={product.coverImage || product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

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
              </div>

              <div className="p-4">
                <Link href={`/products/${product._id}`}>
                  <h3 className="text-lg font-medium text-gray-800 mb-2 hover:text-[#ffa509] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[#050b2c]">
                    ${product.price.toFixed(2)}
                  </span>
                  <Link href={`/products/${product._id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 bg-[#ffa509] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      <span>View</span>
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <QuickView
        productId={selectedProduct || ""}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
