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
import Link from "next/link";
import {
  Zap,
  Calendar,
  Package,
  Edit2,
  Trash2,
  Loader2,
  Plus,
  ArrowLeft,
  Clock,
  Tag,
  DollarSign,
} from "lucide-react";

interface FlashSale {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  products: {
    productId: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  }[];
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

export default function FlashSalesClient() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    try {
      const response = await fetch("/api/admin/promotions/flash-sales");
      if (!response.ok) {
        throw new Error("Failed to fetch flash sales");
      }
      const data = await response.json();
      setFlashSales(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch flash sales"
      );
      toast.error("Failed to fetch flash sales");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flashSaleId: string) => {
    try {
      const response = await fetch(
        `/api/admin/promotions/flash-sales?id=${flashSaleId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete flash sale");
      }

      setFlashSales((prev) =>
        prev.filter((flashSale) => flashSale._id !== flashSaleId)
      );
      toast.success("Flash sale deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete flash sale"
      );
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) return "Ended";

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getMaxDiscount = (products: FlashSale["products"]) => {
    if (products.length === 0) return "0%";
    const maxDiscount = Math.max(...products.map((p) => p.discountValue));
    const discountType = products[0].discountType;
    return `${maxDiscount}${discountType === "percentage" ? "%" : "$"}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffa509]" />
        <p className="mt-4 text-[#050b2c]">Loading flash sales...</p>
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
            <Zap className="h-6 w-6 text-[#ffa509]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#050b2c]">Flash Sales</h2>
            <p className="text-[#050b2c]/60">
              Create and manage limited-time promotions
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
            <Link href="/dashboard/admin/promotions/flash-sales/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Flash Sale
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
          {flashSales.map((flashSale) => (
            <motion.div
              key={flashSale._id}
              variants={item}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-[#050b2c]/10 overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                {/* Flash Sale Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#ffa509]/10 rounded-lg">
                      <Zap className="h-5 w-5 text-[#ffa509]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#050b2c]">
                        {flashSale.name}
                      </h3>
                      <p className="text-sm text-[#050b2c]/60">
                        {flashSale.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-[#050b2c] border-[#050b2c] hover:bg-[#050b2c]/10"
                      asChild
                    >
                      <Link
                        href={`/dashboard/admin/promotions/flash-sales/edit/${flashSale._id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
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
                          <AlertDialogTitle>Delete Flash Sale</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this flash sale?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(flashSale._id)}
                            className="bg-[#c90b0b] hover:bg-[#c90b0b]/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Flash Sale Details */}
                <div className="space-y-3">
                  <div className="flex items-center text-[#050b2c]/60 gap-2">
                    <Calendar className="h-4 w-4" />
                    <div className="text-sm">
                      {new Date(flashSale.startDate).toLocaleDateString()} -{" "}
                      {new Date(flashSale.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center text-[#050b2c]/60 gap-2">
                    <Clock className="h-4 w-4" />
                    <div className="text-sm font-medium text-[#ffa509]">
                      {getTimeRemaining(flashSale.endDate)}
                    </div>
                  </div>

                  <div className="flex items-center text-[#050b2c]/60 gap-2">
                    <Package className="h-4 w-4" />
                    <div className="text-sm">
                      {flashSale.products.length} Products
                    </div>
                  </div>

                  <div className="flex items-center text-[#050b2c]/60 gap-2">
                    <DollarSign className="h-4 w-4" />
                    <div className="text-sm">
                      Up to {getMaxDiscount(flashSale.products)} off
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-4 border-t border-[#050b2c]/10">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      flashSale.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-[#050b2c]/10 text-[#050b2c]"
                    }`}
                  >
                    {flashSale.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {flashSales.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[400px] text-[#050b2c]/60"
        >
          <Zap className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">No Flash Sales Found</p>
          <p className="mb-4">Create your first flash sale to get started</p>
          <Link href="/dashboard/admin/promotions/flash-sales/create">
            <Button className="bg-[#050b2c] hover:bg-[#050b2c]/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Flash Sale
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
