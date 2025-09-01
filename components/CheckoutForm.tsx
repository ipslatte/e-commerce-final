"use client";

import { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddressSelector from "@/components/AddressSelector";
import { useSearchParams } from "next/navigation";
import { FiTag, FiCreditCard, FiMapPin, FiCheck, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

interface Address {
  _id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface CheckoutFormProps {
  amount: number;
  productId?: string;
}

export default function CheckoutForm({ amount, productId }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<Address>();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string>("");
  const [couponSuccess, setCouponSuccess] = useState<string>("");
  const [originalAmount, setOriginalAmount] = useState(amount);

  // Handle flash sale price
  useEffect(() => {
    const flashSaleId = searchParams.get("flashSaleId");
    const discountType = searchParams.get("discountType");
    const discountValue = searchParams.get("discountValue");

    if (flashSaleId && discountType && discountValue) {
      const value = Number(discountValue);
      let flashSaleDiscount = 0;

      if (discountType === "percentage") {
        flashSaleDiscount = (amount * value) / 100;
      } else {
        flashSaleDiscount = value;
      }

      setOriginalAmount(amount);
      setDiscount(flashSaleDiscount);
    }
  }, [amount, searchParams]);

  const handleCouponApply = async () => {
    if (!couponCode) {
      setCouponError("Please enter a coupon code");
      setCouponSuccess("");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: originalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply coupon");
      }

      const discountAmount = Number(data.discount) || 0;
      const discountValue = Number(data.value) || 0;

      setDiscount((prevDiscount) => prevDiscount + discountAmount);
      setAppliedCouponId(data.couponId);
      setCouponSuccess(
        `Coupon applied! ${
          data.type === "percentage"
            ? `${discountValue}% off`
            : `$${discountValue.toFixed(2)} off`
        } - You saved $${discountAmount.toFixed(2)}`
      );

      // Update URL with final amount
      const url = new URL(window.location.href);
      url.searchParams.set(
        "finalAmount",
        (originalAmount - discountAmount).toFixed(2)
      );
      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      setCouponError(
        error instanceof Error ? error.message : "Failed to apply coupon"
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCouponRemove = () => {
    setCouponCode("");
    // Only remove the coupon discount, keep flash sale discount if any
    const flashSaleId = searchParams.get("flashSaleId");
    const discountType = searchParams.get("discountType");
    const discountValue = searchParams.get("discountValue");

    if (flashSaleId && discountType && discountValue) {
      const value = Number(discountValue);
      let flashSaleDiscount = 0;

      if (discountType === "percentage") {
        flashSaleDiscount = (amount * value) / 100;
      } else {
        flashSaleDiscount = value;
      }

      setDiscount(flashSaleDiscount);
    } else {
      setDiscount(0);
    }
    setAppliedCouponId(null);
    setCouponError("");
    setCouponSuccess("");

    // Reset URL to original amount
    const url = new URL(window.location.href);
    url.searchParams.delete("finalAmount");
    window.history.replaceState({}, "", url.toString());
  };

  const finalAmount = Math.max(0, originalAmount - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!selectedAddress) {
      setMessage("Please select a shipping address");
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          shipping: {
            address: {
              line1: selectedAddress.addressLine1,
              line2: selectedAddress.addressLine2 || "",
              city: selectedAddress.city,
              state: selectedAddress.state,
              postal_code: selectedAddress.postalCode,
              country: selectedAddress.country,
            },
            name: selectedAddress.fullName,
            phone: selectedAddress.phone,
          },
        },
      });

      if (error) {
        setMessage(error.message || "An error occurred during payment.");
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
    }

    setIsProcessing(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto space-y-8"
    >
      <div className="space-y-6">
        {/* Shipping Address Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center mb-4 text-[#050b2c]">
            <FiMapPin className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Shipping Address</h2>
          </div>
          <AddressSelector
            onAddressSelect={setSelectedAddress}
            selectedAddressId={selectedAddress?._id}
          />
        </motion.div>

        {/* Coupon Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center mb-4 text-[#050b2c]">
            <FiTag className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Have a Coupon?</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="couponCode" className="text-[#050b2c]">
                  Coupon Code
                </Label>
                <Input
                  id="couponCode"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="uppercase border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
                  disabled={appliedCouponId !== null}
                />
              </div>
              {appliedCouponId ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleCouponRemove}
                  className="bg-[#c90b0b] hover:bg-opacity-90"
                >
                  <FiX className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleCouponApply}
                  disabled={isApplyingCoupon || !couponCode}
                  className="bg-[#ffa509] hover:bg-opacity-90 text-white"
                >
                  {isApplyingCoupon ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Applying...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FiCheck className="w-4 h-4 mr-1" />
                      Apply
                    </span>
                  )}
                </Button>
              )}
            </div>
            {couponError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#c90b0b] bg-red-50 p-2 rounded-md flex items-center"
              >
                <FiX className="w-4 h-4 mr-1" />
                {couponError}
              </motion.div>
            )}
            {couponSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-green-600 bg-green-50 p-2 rounded-md flex items-center"
              >
                <FiCheck className="w-4 h-4 mr-1" />
                {couponSuccess}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center mb-4 text-[#050b2c]">
            <FiCreditCard className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Payment Details</h2>
          </div>
          <PaymentElement />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Button
            type="submit"
            disabled={isProcessing || !stripe || !elements || !selectedAddress}
            className="w-full bg-[#050b2c] hover:bg-opacity-90 text-white py-3 text-lg font-medium"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Processing...
              </span>
            ) : (
              <span>Pay ${finalAmount.toFixed(2)}</span>
            )}
          </Button>
          {message && (
            <div className="mt-4 text-center text-sm text-[#c90b0b]">
              {message}
            </div>
          )}
        </motion.div>
      </div>
    </form>
  );
}
