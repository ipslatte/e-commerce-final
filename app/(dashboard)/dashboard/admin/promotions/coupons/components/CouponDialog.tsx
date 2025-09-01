"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CouponForm from "./CouponForm";

interface CouponDialogProps {
  onSubmit: (data: any) => void;
}

export default function CouponDialog({ onSubmit }: CouponDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    await onSubmit(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new coupon. All dates are in
            your local timezone.
          </DialogDescription>
        </DialogHeader>
        <CouponForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
