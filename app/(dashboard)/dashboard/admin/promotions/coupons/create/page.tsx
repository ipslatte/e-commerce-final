"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function CreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/promotions/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          value: Number(formData.value),
          minPurchase: formData.minPurchase
            ? Number(formData.minPurchase)
            : undefined,
          maxDiscount: formData.maxDiscount
            ? Number(formData.maxDiscount)
            : undefined,
          usageLimit: formData.usageLimit
            ? Number(formData.usageLimit)
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create coupon");
      }

      toast.success("Coupon created successfully");
      router.push("/dashboard/admin/promotions/coupons");
      router.refresh();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create coupon"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create New Coupon</h2>
      </div>
      <div className="grid gap-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="SUMMER2024"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Discount Type</Label>
            <Select
              name="type"
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="value">Discount Value</Label>
            <Input
              id="value"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleChange}
              required
              placeholder={formData.type === "percentage" ? "10" : "10.00"}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="minPurchase">Minimum Purchase Amount ($)</Label>
            <Input
              id="minPurchase"
              name="minPurchase"
              type="number"
              value={formData.minPurchase}
              onChange={handleChange}
              placeholder="50.00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxDiscount">Maximum Discount Amount ($)</Label>
            <Input
              id="maxDiscount"
              name="maxDiscount"
              type="number"
              value={formData.maxDiscount}
              onChange={handleChange}
              placeholder="100.00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="usageLimit">Usage Limit</Label>
            <Input
              id="usageLimit"
              name="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="100"
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Coupon"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
