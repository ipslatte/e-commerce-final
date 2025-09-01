"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { EditCouponForm } from "@/components/EditCouponForm";
import {
  Ticket,
  Calendar,
  DollarSign,
  Users,
  Edit2,
  Trash2,
  Loader2,
  Plus,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  value: number;
  minPurchase: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  status: string;
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

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/promotions/coupons");
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      const data = await response.json();
      setCoupons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch coupons");
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    try {
      const response = await fetch(
        `/api/admin/promotions/coupons?id=${couponId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete coupon");
      }

      setCoupons((prevCoupons) =>
        prevCoupons.filter((coupon) => coupon._id !== couponId)
      );
      toast.success("Coupon deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete coupon"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffa509]" />
        <p className="mt-4 text-[#050b2c]">Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-[#ffa509]/10 rounded-lg">
            <Ticket className="h-6 w-6 text-[#ffa509]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#050b2c]">Coupons</h2>
            <p className="text-[#050b2c]/60">
              Manage your discount coupons and promotions
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Button
            asChild
            variant="outline"
            className="border-[#050b2c] text-[#050b2c] hover:bg-[#050b2c] hover:text-white"
          >
            <Link href="/dashboard/admin/promotions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffa509] text-white border-none shadow-lg shadow-[#ffa509]/20 transition-all duration-300"
          >
            <Link href="/dashboard/admin/promotions/coupons/create">
              <Plus className="h-4 w-4 mr-2" />
              Create New Coupon
            </Link>
          </Button>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-[#c90b0b] p-4 rounded-lg text-[#c90b0b]"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {coupons.map((coupon) => (
            <motion.div
              key={coupon._id}
              variants={item}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-[#050b2c]/10 overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                {/* Coupon Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#ffa509]/10 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-[#ffa509]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#050b2c]">
                      {coupon.code}
                    </h3>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditCouponForm coupon={coupon} onSuccess={fetchCoupons} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-[#c90b0b] border-[#c90b0b] hover:bg-[#c90b0b]/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this coupon? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(coupon._id)}
                            className="bg-[#c90b0b] hover:bg-[#c90b0b]/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Coupon Details */}
                <div className="space-y-3">
                  <div className="flex items-center text-[#050b2c]/60 gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium text-[#050b2c]">
                      {coupon.discountType === "percentage"
                        ? `${coupon.value}% off`
                        : `$${coupon.value} off`}
                    </span>
                  </div>

                  <div className="flex items-center text-[#050b2c]/60 gap-2">
                    <Calendar className="h-4 w-4" />
                    <div className="text-sm">
                      {new Date(coupon.startDate).toLocaleDateString()} -{" "}
                      {new Date(coupon.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center text-[#050b2c]/60 gap-2">
                    <Users className="h-4 w-4" />
                    <div className="text-sm">
                      Usage Limit: {coupon.usageLimit || "Unlimited"}
                    </div>
                  </div>

                  {coupon.minPurchase > 0 && (
                    <div className="flex items-center text-[#050b2c]/60 gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      <div className="text-sm">
                        Min. Purchase: ${coupon.minPurchase}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="pt-4 border-t border-[#050b2c]/10">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      coupon.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-[#050b2c]/10 text-[#050b2c]"
                    }`}
                  >
                    {coupon.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {coupons.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[400px] text-[#050b2c]/60"
        >
          <Ticket className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">No Coupons Found</p>
          <p className="mb-4">Create your first coupon to get started</p>
          <Link href="/dashboard/admin/promotions/coupons/create">
            <Button className="bg-[#050b2c] hover:bg-[#050b2c]/90">
              <Plus className="h-4 w-4 mr-2" />
              Create New Coupon
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
