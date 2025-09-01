"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useCart } from "@/providers/cart-provider";

interface PaymentDetails {
  id: string;
  status: string;
  amount: number;
  currency: string;
}

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const payment_intent = searchParams.get("payment_intent");

  useEffect(() => {
    if (!payment_intent) {
      setStatus("error");
      return;
    }

    // Verify the payment on the server
    fetch(`/api/payment/verify?payment_intent=${payment_intent}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setPaymentDetails(data.paymentIntent);
          clearCart(); // Clear the cart after successful payment
          toast.success("Payment successful!");
        } else {
          throw new Error(data.error || "Payment verification failed");
        }
      })
      .catch((error) => {
        console.error("Payment verification error:", error);
        setStatus("error");
        toast.error(error.message || "Failed to verify payment");
      });
  }, [payment_intent, clearCart]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Verifying your payment...
          </h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-8">
            There was an issue verifying your payment. Please contact support if
            you believe this is an error.
          </p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-green-600">
              Payment Successful!
            </h2>
            {paymentDetails && (
              <div className="mb-8 text-left">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment ID:</span>{" "}
                    {paymentDetails.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Amount:</span> $
                    {paymentDetails.amount.toFixed(2)}{" "}
                    {paymentDetails.currency.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span>{" "}
                    <span className="capitalize">{paymentDetails.status}</span>
                  </p>
                </div>
              </div>
            )}
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. You will receive an email
              confirmation shortly.
            </p>
            <div className="space-y-4">
              <Link
                href="/orders"
                className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
              >
                View Orders
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
