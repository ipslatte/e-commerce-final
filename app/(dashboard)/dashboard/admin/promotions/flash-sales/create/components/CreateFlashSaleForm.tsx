"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  Calendar,
  Package,
  Tag,
} from "lucide-react";
import Link from "next/link";

interface Product {
  productId: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

export default function CreateFlashSaleForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
    products: [] as Product[],
  });

  const [newProduct, setNewProduct] = useState<Product>({
    productId: "",
    discountType: "percentage",
    discountValue: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/promotions/flash-sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create flash sale");
      }

      toast.success("Flash sale created successfully");
      router.push("/dashboard/admin/promotions/flash-sales");
    } catch (error) {
      console.error("Error creating flash sale:", error);
      toast.error("Failed to create flash sale");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.productId || !newProduct.discountValue) {
      toast.error("Please fill in all product fields");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));

    setNewProduct({
      productId: "",
      discountType: "percentage",
      discountValue: 0,
    });
  };

  const handleRemoveProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

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
            <h2 className="text-2xl font-bold text-[#050b2c]">
              Create Flash Sale
            </h2>
            <p className="text-[#050b2c]/60">
              Set up a new time-limited promotion
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            asChild
            variant="outline"
            className="border-[#050b2c] text-[#050b2c] hover:bg-[#050b2c] hover:text-white"
          >
            <Link href="/dashboard/admin/promotions/flash-sales">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Flash Sales
            </Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#050b2c]/10">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#050b2c] flex items-center gap-2">
                  <Tag className="h-5 w-5 text-[#ffa509]" />
                  Basic Information
                </h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Flash Sale Name</Label>
                    <Input
                      id="name"
                      required
                      placeholder="Summer Flash Sale"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="border-[#050b2c]/20 focus-visible:ring-[#ffa509]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Special summer discounts on selected items"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="border-[#050b2c]/20 focus-visible:ring-[#ffa509]"
                    />
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#050b2c] flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#ffa509]" />
                  Date and Time
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="border-[#050b2c]/20 focus-visible:ring-[#ffa509]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="border-[#050b2c]/20 focus-visible:ring-[#ffa509]"
                    />
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#050b2c] flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#ffa509]" />
                  Products
                </h3>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-4 items-end">
                    <div className="grid gap-2">
                      <Label>Product ID</Label>
                      <Input
                        placeholder="Enter product ID"
                        value={newProduct.productId}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            productId: e.target.value,
                          })
                        }
                        className="border-[#050b2c]/20 focus-visible:ring-[#ffa509]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Discount Type</Label>
                      <Select
                        value={newProduct.discountType}
                        onValueChange={(value: "percentage" | "fixed") =>
                          setNewProduct({ ...newProduct, discountType: value })
                        }
                      >
                        <SelectTrigger className="border-[#050b2c]/20 focus:ring-[#ffa509]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            Percentage (%)
                          </SelectItem>
                          <SelectItem value="fixed">
                            Fixed Amount ($)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Discount Value</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newProduct.discountValue || ""}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            discountValue: Number(e.target.value),
                          })
                        }
                        className="border-[#050b2c]/20 focus-visible:ring-[#ffa509]"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddProduct}
                      className="bg-[#050b2c] hover:bg-[#050b2c]/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>

                  {/* Product List */}
                  <div className="space-y-2">
                    {formData.products.map((product, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 bg-[#050b2c]/5 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-[#050b2c]">
                            {product.productId}
                          </span>
                          <span className="text-sm text-[#050b2c]/60">
                            {product.discountValue}
                            {product.discountType === "percentage"
                              ? "%"
                              : "$"}{" "}
                            off
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProduct(index)}
                          className="text-[#c90b0b] hover:text-[#c90b0b] hover:bg-[#c90b0b]/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffa509] text-white border-none shadow-lg shadow-[#ffa509]/20 transition-all duration-300"
            >
              {loading ? "Creating..." : "Create Flash Sale"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-[#050b2c] text-[#050b2c] hover:bg-[#050b2c] hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
