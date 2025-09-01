"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiX, FiShoppingCart, FiStar } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "./CountdownTimer";
import { getProductPrice } from "@/lib/utils/price";
import { trackProductView } from "@/lib/utils/viewTracker";
import type { Product, FlashSale } from "@/types";

interface QuickViewProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickView({
  productId,
  isOpen,
  onClose,
}: QuickViewProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [price, setPrice] = useState({
    originalPrice: 0,
    finalPrice: 0,
    hasFlashSale: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const priceData = await getProductPrice(productId);

        // Set product data
        if (priceData.originalPrice > 0) {
          const productRes = await fetch(`/api/products/${productId}`);
          if (!productRes.ok) throw new Error("Failed to fetch product");
          const productData = await productRes.json();
          setProduct(productData);

          // Track product view with duplicate prevention
          await trackProductView(productId);
        }

        // Set price and flash sale data
        setPrice(priceData);
        setFlashSale(priceData.flashSale || null);
        setSelectedImage(0);

        console.log("Price data:", priceData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [productId, isOpen]);

  // Create URL with flash sale parameters
  const getProductUrl = () => {
    if (!product) return "";

    const baseUrl = `/products/${product._id}`;
    if (!flashSale) return baseUrl;

    const params = new URLSearchParams();
    params.set("flashSaleId", flashSale.id);
    params.set("discountType", flashSale.discountType);
    params.set("discountValue", flashSale.discountValue.toString());
    params.set("endDate", flashSale.endDate);

    const url = `${baseUrl}?${params.toString()}`;
    console.log("Constructed URL:", url);
    return url;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Quick View Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white z-50 overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <FiX className="w-6 h-6" />
            </button>

            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffa509]"></div>
              </div>
            ) : product ? (
              <div className="p-6">
                {/* Image Gallery */}
                <div className="mb-6">
                  <div className="relative h-[400px] w-full mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={product.images[selectedImage]}
                      alt={`${product.name} - View ${selectedImage + 1}`}
                      fill
                      className="object-contain"
                      priority
                    />
                    {flashSale && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full"
                      >
                        {flashSale.discountType === "percentage"
                          ? `${flashSale.discountValue}% OFF`
                          : `$${flashSale.discountValue} OFF`}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden ${
                          selectedImage === index
                            ? "ring-2 ring-[#ffa509]"
                            : "ring-1 ring-gray-200"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} - Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {product.name}
                  </h2>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <FiStar
                          key={index}
                          className={`w-5 h-5 ${
                            index < (product.rating || 0)
                              ? "text-[#ffa509] fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.numReviews || 0} reviews)
                    </span>
                  </div>

                  <p className="text-gray-600">{product.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.span
                          initial={{ scale: 1 }}
                          animate={{
                            scale: price.hasFlashSale ? [1, 1.1, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          className="text-2xl font-bold text-[#050b2c]"
                        >
                          ${price.finalPrice.toFixed(2)}
                        </motion.span>
                        {price.hasFlashSale && (
                          <>
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-lg text-gray-500 line-through"
                            >
                              ${price.originalPrice.toFixed(2)}
                            </motion.span>
                            <Badge variant="destructive" className="ml-2">
                              Flash Sale!
                            </Badge>
                          </>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {product.stock} in stock
                      </span>
                    </div>

                    {flashSale && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-red-500"
                      >
                        <span>Ends in:</span>
                        <CountdownTimer endDate={flashSale.endDate} />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Link href={getProductUrl()} className="w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-[#ffa509] text-white py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiShoppingCart className="w-5 h-5" />
                        View Details
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Product not found</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
