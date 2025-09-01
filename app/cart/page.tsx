"use client";

import { useCart } from "@/providers/cart-provider";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

interface ProductAttributes {
  [key: string]: string | string[];
}

interface ProductVariant {
  _id: string;
  sku: string;
  price: number;
  stock: number;
  attributes: {
    [key: string]: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  coverImage: string;
  stock: number;
  attributes?: ProductAttributes;
}

interface CartItem {
  _id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  flashSale?: {
    id: string;
    discountType: string;
    discountValue: number;
  };
}

interface Cart {
  _id: string;
  items: CartItem[];
}

function calculateDiscountedPrice(
  originalPrice: number,
  flashSale?: { discountType: string; discountValue: number }
): number {
  if (!flashSale) return originalPrice;

  if (flashSale.discountType === "percentage") {
    return originalPrice - (originalPrice * flashSale.discountValue) / 100;
  } else {
    return Math.max(0, originalPrice - flashSale.discountValue);
  }
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, isLoading } = useCart();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa509]"></div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-[#050b2c]">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8">
            Start shopping to add items to your cart.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#ffa509] text-white px-8 py-3 rounded-full hover:bg-[#050b2c] transition-colors duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      setUpdatingItemId(itemId);
      await updateQuantity(itemId, newQuantity);
      toast.success("Cart updated successfully");
    } catch (error) {
      toast.error("Failed to update cart");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItemId(itemId);
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const totalAmount =
    cart?.items.reduce((total, item) => {
      const basePrice = item.variant?.price || item.product.price;
      const discountedPrice = calculateDiscountedPrice(
        basePrice,
        item.flashSale
      );
      return total + discountedPrice * item.quantity;
    }, 0) || 0;

  const renderAttributeValue = (value: string | string[]): string => {
    return Array.isArray(value) ? value.join(", ") : value;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[#050b2c]">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {cart?.items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row p-6">
                  <div className="relative h-48 md:h-32 md:w-32 flex-shrink-0 mb-4 md:mb-0">
                    <Image
                      src={item.product.coverImage}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-grow md:ml-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-[#050b2c]">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={updatingItemId === item._id}
                        className="text-[#c90b0b] hover:text-red-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Product Attributes */}
                    {item.product.attributes &&
                      Object.entries(item.product.attributes).length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-[#050b2c]">
                            Product Specifications:
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {Object.entries(item.product.attributes).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="text-sm text-gray-600"
                                >
                                  <span className="font-medium">{key}:</span>{" "}
                                  {renderAttributeValue(value)}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Variant Attributes */}
                    {item.variant && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-[#050b2c]">
                          Selected Options:
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {Object.entries(item.variant.attributes).map(
                            ([key, value]) => (
                              <div key={key} className="text-sm text-gray-600">
                                <span className="font-medium">{key}:</span>{" "}
                                {value}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between mt-4">
                      <div className="flex items-center text-[#050b2c] font-medium">
                        {item.flashSale && (
                          <span className="text-sm text-gray-500 line-through mr-2">
                            $
                            {(
                              (item.variant?.price || item.product.price) *
                              item.quantity
                            ).toFixed(2)}
                          </span>
                        )}
                        <span className="text-lg">
                          $
                          {(
                            calculateDiscountedPrice(
                              item.variant?.price || item.product.price,
                              item.flashSale
                            ) * item.quantity
                          ).toFixed(2)}
                        </span>
                        {item.flashSale && (
                          <Badge
                            variant="destructive"
                            className="ml-2 bg-[#c90b0b]"
                          >
                            {item.flashSale.discountType === "percentage"
                              ? `${item.flashSale.discountValue}% OFF`
                              : `$${item.flashSale.discountValue} OFF`}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center mt-4 md:mt-0">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item._id, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 || updatingItemId === item._id
                            }
                            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 border-x border-gray-200 min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item._id, item.quantity + 1)
                            }
                            disabled={updatingItemId === item._id}
                            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-[#050b2c]">
              Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-[#050b2c]">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Shipping</span>
                <span className="text-[#050b2c]">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-[#050b2c]">Total</span>
                <span className="text-[#050b2c]">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <Link
                href={`/checkout?amount=${totalAmount}`}
                className={`block w-full bg-[#ffa509] text-white text-center py-3 rounded-full mt-6 hover:bg-[#050b2c] transition-colors duration-300 ${
                  totalAmount <= 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={(e) => {
                  if (totalAmount <= 0) {
                    e.preventDefault();
                    toast.error("Your cart is empty");
                  }
                }}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
