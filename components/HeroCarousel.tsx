"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  slug: string;
  onSale?: boolean;
  salePrice?: number;
}

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch("/api/products?featured=true&limit=3");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setFeaturedProducts(data);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (featuredProducts.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredProducts.length]);

  if (loading || featuredProducts.length === 0) {
    return (
      <div className="relative h-screen w-full bg-[#050b2c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffa509]"></div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050b2c]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#050b2c] via-[#050b2c]/80 to-transparent z-10" />
            <Image
              src={featuredProducts[currentSlide].images[0]}
              alt={featuredProducts[currentSlide].name}
              fill
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-2xl"
                >
                  {featuredProducts[currentSlide].onSale && (
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-block bg-[#ffa509] text-white px-4 py-2 rounded-md text-sm font-medium mb-4"
                    >
                      SALE! UP TO{" "}
                      {Math.round(
                        ((featuredProducts[currentSlide].price -
                          (featuredProducts[currentSlide].salePrice || 0)) /
                          featuredProducts[currentSlide].price) *
                          100
                      )}
                      % OFF!
                    </motion.span>
                  )}

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl font-bold text-white mb-4"
                  >
                    {featuredProducts[currentSlide].name}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl text-gray-300 mb-8 line-clamp-2"
                  >
                    {featuredProducts[currentSlide].description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4"
                  >
                    <Link
                      href={`/products/${featuredProducts[currentSlide].slug}`}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#ffa509] text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-opacity-90 transition-colors inline-flex items-center gap-2"
                      >
                        Shop Now
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </motion.button>
                    </Link>
                    <div className="text-white">
                      <span className="text-2xl font-bold">
                        $
                        {(
                          featuredProducts[currentSlide].salePrice ||
                          featuredProducts[currentSlide].price
                        ).toFixed(2)}
                      </span>
                      {featuredProducts[currentSlide].onSale && (
                        <span className="ml-2 text-lg text-gray-400 line-through">
                          ${featuredProducts[currentSlide].price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Navigation */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {featuredProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-[#ffa509] w-8"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
