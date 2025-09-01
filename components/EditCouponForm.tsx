"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface EditCouponFormProps {
  coupon: Coupon;
  onSuccess: () => void;
}

export function EditCouponForm({ coupon, onSuccess }: EditCouponFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Coupon, "_id">>({
    code: coupon.code,
    discountType: coupon.discountType,
    value: coupon.value,
    minPurchase: coupon.minPurchase,
    maxDiscount: coupon.maxDiscount,
    startDate: coupon.startDate.split("T")[0],
    endDate: coupon.endDate.split("T")[0],
    usageLimit: coupon.usageLimit,
    status: coupon.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/promotions/coupons?id=${coupon._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update coupon");
      }

      toast.success("Coupon updated successfully");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update coupon"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "value" ||
        name === "minPurchase" ||
        name === "maxDiscount" ||
        name === "usageLimit"
          ? parseFloat(value)
          : value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Coupon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="code">Coupon Code</label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="discountType">Discount Type</label>
            <Select
              name="discountType"
              value={formData.discountType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, discountType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="value">Value</label>
            <Input
              id="value"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="minPurchase">Minimum Purchase</label>
            <Input
              id="minPurchase"
              name="minPurchase"
              type="number"
              value={formData.minPurchase}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="maxDiscount">Maximum Discount</label>
            <Input
              id="maxDiscount"
              name="maxDiscount"
              type="number"
              value={formData.maxDiscount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="startDate">Start Date</label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="endDate">End Date</label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="usageLimit">Usage Limit</label>
            <Input
              id="usageLimit"
              name="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="status">Status</label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
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
