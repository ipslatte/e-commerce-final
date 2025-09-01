"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiShoppingCart, FiEye, FiHeart, FiArrowRight } from "react-icons/fi";
import QuickView from "./QuickView";
import AddToWishlistButton from "./AddToWishlistButton";
import { useCart } from "@/providers/cart-provider";
import type { Product } from "@/types";
import { Button } from "./ui/button";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { addToCart } = useCart();

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

  const handleAddToCart = async (productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      await addToCart(product, 1);
    }
  };

  const renderStars = (rating: number = 0, numReviews: number = 0) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-[#ffa509] fill-current"
                : "text-gray-300 fill-current"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-500 ml-1">({numReviews})</span>
      </div>
    );
  };

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {products.map((product) => (
          <motion.div
            key={product._id}
            variants={item}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={
                  product.coverImage || product.images[0] || "/placeholder.png"
                }
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <button
                  onClick={() => setSelectedProduct(product._id)}
                  className="bg-white text-[#050b2c] p-3 rounded-full hover:bg-[#ffa509] hover:text-white transition-colors shadow-lg"
                >
                  <FiEye className="w-5 h-5" />
                </button>
                <AddToWishlistButton
                  product={{
                    ...product,
                    attributes: product.attributes || {},
                  }}
                  className="bg-white text-[#050b2c] p-3 rounded-full hover:bg-[#ffa509] hover:text-white transition-colors shadow-lg"
                  iconClassName="w-5 h-5"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 space-y-3">
              <span className="inline-block text-sm text-gray-500">
                {product.category.name}
              </span>
              <Link href={`/products/${product._id}`}>
                <h3 className="text-lg font-semibold text-[#050b2c] hover:text-[#ffa509] transition-colors leading-tight line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              {/* Rating Stars */}
              <div>
                {renderStars(product.rating || 0, product.numReviews || 0)}
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 h-10 overflow-hidden">
                {product.description}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl font-bold text-[#050b2c]">
                  ${product.price.toFixed(2)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => handleAddToCart(product._id)}
                  className="w-full bg-[#050b2c] hover:bg-[#050b2c]/90 text-white flex items-center justify-center gap-2"
                  disabled={product.stock === 0}
                >
                  <FiShoppingCart className="w-4 h-4" />
                  Add to Cart
                </Button>
                <Link href={`/products/${product._id}`}>
                  <Button className="w-full bg-[#ffa509] hover:bg-[#ffa509]/90 text-white flex items-center justify-center gap-2">
                    <FiArrowRight className="w-4 h-4" />
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickView
          productId={selectedProduct}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default ProductGrid;
