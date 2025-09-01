"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FiHeadphones, FiEye, FiShoppingCart } from "react-icons/fi";
import AddToWishlistButton from "@/components/AddToWishlistButton";
import QuickView from "./QuickView";

interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  coverImage: string;
  images: string[];
  stock: number;
  sold: number;
  onSale?: boolean;
  salePrice?: number;
  rating?: number;
  numReviews?: number;
  category: {
    _id: string;
    name: string;
  };
  attributes: {
    [key: string]: any;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function DealOfTheDay() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products based on active filter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url =
          activeFilter === "all"
            ? "/api/products?limit=4&featured=true"
            : `/api/products?limit=4&featured=true&category=${activeFilter}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        console.log("Raw API response:", data);

        // Transform the data to ensure we have valid IDs
        const transformedProducts = data.map((product: any) => ({
          ...product,
          _id: product._id || product.id, // Use _id or fallback to id
        }));

        console.log("Transformed products:", transformedProducts);
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffa509]"></div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold"
          >
            Deal of the day
          </motion.h2>

          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-[#ffa509] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Products
            </button>
            {categories.slice(0, 3).map((category) => (
              <button
                key={category._id}
                onClick={() => setActiveFilter(category._id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === category._id
                    ? "bg-[#ffa509] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products found in this category
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  {/* Sale Badge */}
                  {product.onSale && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-20">
                      -
                      {Math.round(
                        ((product.price - (product.salePrice || 0)) /
                          product.price) *
                          100
                      )}
                      %
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <AddToWishlistButton
                      product={product}
                      className="bg-white shadow-md hover:bg-gray-100"
                    />
                  </div>

                  {/* Product Image */}
                  <div className="relative">
                    <Link href={`/products/${product._id}`}>
                      <div className="relative h-48 w-full">
                        <Image
                          src={
                            product.coverImage ||
                            product.images?.[0] ||
                            "/placeholder.jpg"
                          }
                          alt={product.name}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    {/* Overlay and Quick View Button */}
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

                  <div className="flex items-center gap-1 mb-2">
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
                    <span className="text-sm text-gray-500">
                      ({product.numReviews || 0})
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-800">
                        ${(product.salePrice || product.price).toFixed(2)}
                      </span>
                      {product.onSale && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="text-gray-600">Available: </span>
                      {product.stock}
                      <span className="mx-1">|</span>
                      <span className="text-gray-600">Sold: </span>
                      {product.sold}
                    </div>
                  </div>

                  <Link href={`/products/${product._id}`}>
                    <button className="w-full mt-4 bg-[#ffa509] text-white py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2">
                      <FiShoppingCart className="w-5 h-5" />
                      View Details
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <QuickView
        productId={selectedProduct || ""}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
