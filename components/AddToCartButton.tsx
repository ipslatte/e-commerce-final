"use client";

import { useState } from "react";
import { useCart } from "@/providers/cart-provider";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product, ProductVariant } from "@/types";

interface ProductAttributes {
  [key: string]: string | string[];
}

// Helper function to determine if an attribute is a color
const isColorAttribute = (name: string): boolean => {
  return (
    name.toLowerCase() === "color" ||
    name.toLowerCase() === "colours" ||
    name.toLowerCase() === "colors"
  );
};

// Helper function to convert attribute values to array
const getAttributeValues = (value: string | string[]): string[] => {
  return Array.isArray(value) ? value : [value];
};

// Add this helper function to calculate discounted price
const calculateDiscountedPrice = (
  price: number,
  flashSale?: AddToCartButtonProps["flashSale"]
): number => {
  if (!flashSale) return price;

  if (flashSale.discountType === "percentage") {
    return price - (price * flashSale.discountValue) / 100;
  }
  return Math.max(0, price - flashSale.discountValue);
};

interface AddToCartButtonProps {
  product: Product;
  variants?: ProductVariant[];
  initialQuantity?: number;
  flashSale?: {
    id: string;
    discountType: string;
    discountValue: number;
    endDate: string;
  };
}

export default function AddToCartButton({
  product,
  variants = [],
  initialQuantity = 1,
  flashSale,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(initialQuantity);
  const { addToCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Find matching variant based on selected attributes
  const findMatchingVariant = () => {
    if (variants.length === 0) return undefined;

    return variants.find((variant) => {
      return Object.entries(selectedAttributes).every(
        ([key, value]) => variant.attributes[key] === value
      );
    });
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  const handleAddToCart = async () => {
    if (status === "loading") return;

    if (!session) {
      toast.error("Please sign in to add items to cart");
      router.push("/login");
      return;
    }

    // Check if flash sale has expired
    if (flashSale && new Date(flashSale.endDate) < new Date()) {
      toast.error("This flash sale has expired");
      return;
    }

    // Check if all required attributes are selected
    const requiredAttributes = Object.entries(product.attributes || {})
      .filter(([_, values]) =>
        Array.isArray(values) ? values.length > 0 : values
      )
      .map(([key]) => key);

    const hasAllRequiredAttributes = requiredAttributes.every(
      (attr) => selectedAttributes[attr]
    );

    if (!hasAllRequiredAttributes) {
      toast.error("Please select all required options");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const matchingVariant = findMatchingVariant();

      await addToCart(
        product,
        quantity,
        matchingVariant,
        selectedAttributes,
        flashSale
          ? {
              id: flashSale.id,
              discountType: flashSale.discountType,
              discountValue: flashSale.discountValue,
            }
          : undefined
      );
      setIsOpen(false);
      router.push("/cart");
      toast.success("Added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add to cart";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!session) {
      toast.error("Please sign in to add items to cart");
      router.push("/login");
      return;
    }

    setIsOpen(open);
    if (!open) {
      // Reset selections when closing
      setSelectedAttributes({});
      setQuantity(initialQuantity);
    }
  };

  const hasOptions =
    (product.attributes && Object.keys(product.attributes).length > 0) ||
    variants.length > 0;

  const handleClick = () => {
    if (!session) {
      toast.error("Please sign in to add items to cart");
      router.push("/login");
      return;
    }

    if (hasOptions) {
      setIsOpen(true);
    } else {
      handleAddToCart();
    }
  };

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={handleClick}
          disabled={
            isLoading ||
            status === "loading" ||
            (flashSale && new Date(flashSale.endDate) < new Date())
          }
          className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors
            ${
              isLoading ||
              status === "loading" ||
              (flashSale && new Date(flashSale.endDate) < new Date())
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#ffa509] hover:bg-opacity-90"
            }`}
        >
          {status === "loading"
            ? "Loading..."
            : flashSale && new Date(flashSale.endDate) < new Date()
            ? "Sale Ended"
            : "Add to Cart"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Product Attributes */}
            {product.attributes &&
              Object.entries(product.attributes).map(([name, values]) => {
                const attributeValues = getAttributeValues(values);
                return (
                  <div key={name} className="space-y-3">
                    <label className="block text-base font-medium text-gray-900 capitalize">
                      {name}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {attributeValues.map((value) =>
                        isColorAttribute(name) ? (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleAttributeChange(name, value)}
                            className={`w-12 h-12 rounded-full relative group transition-all duration-200 ${
                              selectedAttributes[name] === value
                                ? "ring-2 ring-offset-2 ring-[#ffa509]"
                                : "ring-1 ring-gray-300 hover:ring-2 hover:ring-offset-2 hover:ring-[#ffa509]"
                            }`}
                          >
                            <span
                              className="absolute inset-0 rounded-full"
                              style={{ backgroundColor: value.toLowerCase() }}
                            />
                            <span className="sr-only">{value}</span>
                            {/* Color name tooltip */}
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                              {value}
                            </span>
                          </button>
                        ) : (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleAttributeChange(name, value)}
                            className={`px-4 py-2 rounded-md transition-all duration-200 ${
                              selectedAttributes[name] === value
                                ? "bg-[#ffa509] text-white"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {value}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="block text-base font-medium text-gray-900">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Display */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">Total:</span>
              <div className="flex items-center gap-2">
                {flashSale && (
                  <span className="text-sm text-gray-500 line-through">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                )}
                <span className="text-xl font-bold text-[#050b2c]">
                  $
                  {(
                    calculateDiscountedPrice(product.price, flashSale) *
                    quantity
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={
                isLoading ||
                (flashSale && new Date(flashSale.endDate) < new Date())
              }
              className={`w-full py-3 rounded-md text-white font-medium transition-colors ${
                isLoading ||
                (flashSale && new Date(flashSale.endDate) < new Date())
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#ffa509] hover:bg-opacity-90"
              }`}
            >
              {isLoading
                ? "Adding..."
                : flashSale && new Date(flashSale.endDate) < new Date()
                ? "Sale Ended"
                : "Add to Cart"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
