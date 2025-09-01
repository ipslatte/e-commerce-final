"use client";

import { motion } from "framer-motion";
import { FiGift, FiCopy, FiCheck } from "react-icons/fi";
import { useState, useEffect } from "react";

interface Coupon {
  code: string;
  type: "percentage" | "fixed" | "shipping";
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  endDate: string;
  description?: string;
  remainingUses?: number | null;
}

export default function DiscountCodes() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/coupons/active");
        if (!response.ok) {
          throw new Error("Failed to fetch coupons");
        }
        const data = await response.json();
        console.log("Fetched coupons:", data); // Debug log
        setCoupons(data);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        setError("Failed to load coupons. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDiscount = (coupon: Coupon) => {
    switch (coupon.type) {
      case "percentage":
        return `${coupon.value}% OFF`;
      case "fixed":
        return `$${coupon.value} OFF`;
      case "shipping":
        return "FREE SHIPPING";
      default:
        return `${coupon.value}% OFF`;
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-r from-[#050b2c] to-[#1a1f42]">
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
      <section className="py-12 bg-gradient-to-r from-[#050b2c] to-[#1a1f42]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Error Loading Coupons
          </h2>
          <p className="text-white/80 text-lg">{error}</p>
        </div>
      </section>
    );
  }

  if (coupons.length === 0) {
    return (
      <section className="py-12 bg-gradient-to-r from-[#050b2c] to-[#1a1f42]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            No Active Coupons
          </h2>
          <p className="text-white/80 text-lg">
            Check back later for special offers!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-r from-[#050b2c] to-[#1a1f42]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Active Discount Codes
          </h2>
          <p className="text-white/80 text-lg">
            Use these codes at checkout to save on your purchase
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon, index) => (
            <motion.div
              key={coupon.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 hover:border-[#ffa509]/50 transition-all duration-300"
            >
              {/* Header with Discount Value */}
              <div className="bg-gradient-to-r from-[#ffa509] to-[#ffb73d] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiGift className="w-6 h-6 text-white" />
                    <h3 className="text-2xl font-bold text-white">
                      {formatDiscount(coupon)}
                    </h3>
                  </div>
                  {coupon.remainingUses !== null && (
                    <span className="text-white/80 text-sm">
                      {coupon.remainingUses} uses left
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Description */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {coupon.description || "Special Offer"}
                  </h4>
                  {coupon.minPurchase > 0 && (
                    <p className="text-sm text-white/60">
                      Min. Purchase: ${coupon.minPurchase}
                    </p>
                  )}
                  {coupon.maxDiscount && (
                    <p className="text-sm text-white/60">
                      Max Discount: ${coupon.maxDiscount}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <p className="text-sm text-white/60">
                  Expires: {new Date(coupon.endDate).toLocaleDateString()}
                </p>

                {/* Coupon Code */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/5 rounded-md px-4 py-3 font-mono text-lg font-semibold text-[#ffa509]">
                    {coupon.code}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyCode(coupon.code)}
                    className="bg-[#ffa509] text-white p-3 rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    {copiedCode === coupon.code ? (
                      <FiCheck className="w-5 h-5" />
                    ) : (
                      <FiCopy className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-white/60 text-sm"
        >
          * Terms and conditions apply. Offers cannot be combined with other
          promotions.
        </motion.div>
      </div>
    </section>
  );
}
