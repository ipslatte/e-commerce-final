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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FlashSaleProduct {
  productId: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxQuantityPerCustomer?: number;
  totalQuantity?: number;
}

interface FlashSale {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  products: FlashSaleProduct[];
}

interface EditFlashSaleFormProps {
  flashSale: FlashSale;
  onSuccess: () => void;
}

export function EditFlashSaleForm({
  flashSale,
  onSuccess,
}: EditFlashSaleFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: flashSale.name,
    description: flashSale.description,
    startDate: new Date(flashSale.startDate).toISOString().slice(0, 16),
    endDate: new Date(flashSale.endDate).toISOString().slice(0, 16),
    isActive: flashSale.isActive,
    products: flashSale.products.map((product) => ({
      ...product,
      discountValue: product.discountValue.toString(),
    })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/promotions/flash-sales?id=${flashSale._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            products: formData.products.map((product) => ({
              ...product,
              discountValue: Number(product.discountValue),
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update flash sale");
      }

      toast.success("Flash sale updated successfully");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update flash sale"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Flash Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
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
          <div className="space-y-4">
            <Label>Products</Label>
            {formData.products.map((product, index) => (
              <div
                key={index}
                className="flex gap-2 items-end border p-4 rounded-lg"
              >
                <div className="flex-1">
                  <Label>Product ID</Label>
                  <Input
                    value={product.productId}
                    onChange={(e) =>
                      handleProductChange(index, "productId", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="w-32">
                  <Label>Type</Label>
                  <Select
                    value={product.discountType}
                    onValueChange={(value: "percentage" | "fixed") =>
                      handleProductChange(index, "discountType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">$</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={product.discountValue}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        "discountValue",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveProduct(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Flash Sale"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
