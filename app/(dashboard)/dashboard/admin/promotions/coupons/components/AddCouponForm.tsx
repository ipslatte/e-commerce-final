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

export default function AddCouponForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
    try {
      setLoading(true);
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create coupon");
      }

      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Coupon</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
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
              onValueChange={(value) =>
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
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Coupon"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
