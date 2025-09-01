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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function AddFlashSaleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
    products: [] as Array<{
      productId: string;
      discountType: "percentage" | "fixed";
      discountValue: number;
      maxQuantityPerCustomer?: number;
      totalQuantity?: number;
    }>,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("/api/admin/flash-sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create flash sale");
      }

      toast({
        title: "Success",
        description: "Flash sale created successfully",
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating flash sale:", error);
      toast({
        title: "Error",
        description: "Failed to create flash sale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Flash Sale</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Flash Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Flash Sale Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Summer Flash Sale"
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
              placeholder="Special summer discounts on selected items"
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
            <Label>Products</Label>
            <div className="space-y-2">
              {formData.products.map((product, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Product ID</Label>
                    <Input
                      value={product.productId}
                      onChange={(e) => {
                        const newProducts = [...formData.products];
                        newProducts[index].productId = e.target.value;
                        setFormData({ ...formData, products: newProducts });
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Label>Type</Label>
                    <Select
                      value={product.discountType}
                      onValueChange={(value: "percentage" | "fixed") => {
                        const newProducts = [...formData.products];
                        newProducts[index].discountType = value;
                        setFormData({ ...formData, products: newProducts });
                      }}
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
                      onChange={(e) => {
                        const newProducts = [...formData.products];
                        newProducts[index].discountValue = Number(
                          e.target.value
                        );
                        setFormData({ ...formData, products: newProducts });
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      const newProducts = formData.products.filter(
                        (_, i) => i !== index
                      );
                      setFormData({ ...formData, products: newProducts });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    ...formData,
                    products: [
                      ...formData.products,
                      {
                        productId: "",
                        discountType: "percentage",
                        discountValue: 0,
                      },
                    ],
                  })
                }
              >
                Add Product
              </Button>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Flash Sale"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
