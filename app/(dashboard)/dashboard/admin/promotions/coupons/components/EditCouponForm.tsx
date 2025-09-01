"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  isActive: boolean;
}

interface EditCouponFormProps {
  coupon: Coupon;
  trigger?: React.ReactNode;
}

export default function EditCouponForm({
  coupon,
  trigger,
}: EditCouponFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: coupon.code,
    type: coupon.type,
    value: coupon.value.toString(),
    minPurchase: coupon.minPurchase?.toString() || "",
    maxDiscount: coupon.maxDiscount?.toString() || "",
    startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
    endDate: new Date(coupon.endDate).toISOString().slice(0, 16),
    usageLimit: coupon.usageLimit?.toString() || "",
    isActive: coupon.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/promotions/coupons?id=${coupon._id}`,
        {
          method: "PATCH",
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
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update coupon");
      }

      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Coupon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="SUMMER2024"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Discount Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "percentage" | "fixed") =>
                setFormData({ ...formData, type: value })
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
            <Label htmlFor="value">
              Discount Value ({formData.type === "percentage" ? "%" : "$"})
            </Label>
            <Input
              id="value"
              type="number"
              required
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              placeholder={formData.type === "percentage" ? "10" : "10.00"}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="minPurchase">Minimum Purchase Amount ($)</Label>
            <Input
              id="minPurchase"
              type="number"
              value={formData.minPurchase}
              onChange={(e) =>
                setFormData({ ...formData, minPurchase: e.target.value })
              }
              placeholder="50.00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxDiscount">Maximum Discount Amount ($)</Label>
            <Input
              id="maxDiscount"
              type="number"
              value={formData.maxDiscount}
              onChange={(e) =>
                setFormData({ ...formData, maxDiscount: e.target.value })
              }
              placeholder="100.00"
            />
          </div>
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
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="usageLimit">Usage Limit</Label>
            <Input
              id="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({ ...formData, usageLimit: e.target.value })
              }
              placeholder="100"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="isActive">Status</Label>
            <Select
              value={formData.isActive ? "active" : "inactive"}
              onValueChange={(value) =>
                setFormData({ ...formData, isActive: value === "active" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Coupon"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
