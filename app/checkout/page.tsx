"use client";

import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCart } from "@/providers/cart-provider";
import { FiShoppingBag, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("Missing Stripe publishable key");
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = Number(searchParams.get("amount"));
  const { cart } = useCart();

  useEffect(() => {
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please add items to your cart first");
      router.push("/cart");
      return;
    }

    if (!cart?.items.length) {
      toast.error("Your cart is empty");
      router.push("/cart");
      return;
    }

    // Create PaymentIntent as soon as the page loads
    fetch("/api/payment/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        items: cart.items.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.variant?.price || item.product.price,
          quantity: item.quantity,
          image: item.product.coverImage,
          attributes: item.selectedAttributes,
        })),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create payment intent");
        }
        return data;
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setError(undefined);
      })
      .catch((err) => {
        console.error("Payment error:", err);
        setError(err.message);
        toast.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [amount, router, cart]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-red-50 p-8 rounded-lg shadow-sm">
              <h1 className="text-3xl font-bold text-[#c90b0b] mb-4">Error</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <button
                onClick={() => router.push("/cart")}
                className="inline-flex items-center px-6 py-3 bg-[#050b2c] text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                <FiShoppingBag className="mr-2" />
                Return to Cart
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa509]"></div>
            <p className="mt-4 text-gray-600">Preparing your checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header with Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-[#050b2c] flex items-center justify-center">
                  <FiLock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#050b2c]">
                    Secure Checkout
                  </h1>
                  <div className="flex items-center text-[#ffa509] mt-1">
                    <FiLock className="w-4 h-4 mr-1" />
                    <span className="text-sm">SSL Encrypted Payment</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-[#ffa509]"></span>
                <span>Secure Connection</span>
                <span className="w-2 h-2 rounded-full bg-[#ffa509]"></span>
                <span>256-bit SSL</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Checkout Form */}
              {clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#ffa509",
                        colorBackground: "#ffffff",
                        colorText: "#050b2c",
                        colorDanger: "#c90b0b",
                        fontFamily: "system-ui, sans-serif",
                        borderRadius: "8px",
                      },
                    },
                  }}
                >
                  <CheckoutForm amount={amount} />
                </Elements>
              )}
            </div>

            {/* Order Summary Card - Right Side */}
            <div className="lg:w-[380px]">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm sticky top-4"
              >
                <div className="border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-[#050b2c] p-6">
                    Order Summary
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                    {/* Discount Section */}
                    {clientSecret && (
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: "stripe",
                            variables: {
                              colorPrimary: "#ffa509",
                              colorBackground: "#ffffff",
                              colorText: "#050b2c",
                              colorDanger: "#c90b0b",
                              fontFamily: "system-ui, sans-serif",
                              borderRadius: "8px",
                            },
                          },
                        }}
                      >
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Discount</span>
                          <span className="font-medium text-[#c90b0b]">
                            -$
                            {(
                              amount -
                              Number(searchParams.get("finalAmount") || amount)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </Elements>
                    )}
                    <div className="h-px bg-gray-100"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-[#050b2c]">
                        Total
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#050b2c]">
                          $
                          {(
                            Number(searchParams.get("finalAmount")) || amount
                          ).toFixed(2)}
                        </span>
                        <div className="text-sm text-gray-500">USD</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Protection Notice */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <FiLock className="w-5 h-5 text-[#ffa509] mt-0.5" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-[#050b2c]">
                          Secure Payment
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Your payment information is encrypted and secure. We
                          never store your card details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
