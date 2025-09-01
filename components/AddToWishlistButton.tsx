"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import type { Product } from "@/types";

interface AddToWishlistButtonProps {
  product: Product;
  className?: string;
  iconClassName?: string;
}

export default function AddToWishlistButton({
  product,
  className = "",
  iconClassName = "",
}: AddToWishlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    // Check if product is in wishlist when component mounts
    const checkWishlistStatus = async () => {
      if (!session) return;

      try {
        const response = await fetch("/api/wishlist");
        if (!response.ok) return;

        const wishlistItems = await response.json();
        const isInList = wishlistItems.some(
          (item: any) => item.productId._id === product._id
        );
        setIsInWishlist(isInList);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [session, product._id]);

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link

    if (!session) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (isInWishlist) {
        // Remove from wishlist
        response = await fetch(`/api/wishlist?productId=${product._id}`, {
          method: "DELETE",
        });
      } else {
        // Add to wishlist
        response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: product._id }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.error === "Product already in wishlist"
        ) {
          setIsInWishlist(true);
          toast({
            title: "Already in wishlist",
            description: `${product.name} is already in your wishlist`,
          });
          return;
        }
        throw new Error(data.error || "Failed to update wishlist");
      }

      setIsInWishlist(!isInWishlist);
      toast({
        title: "Success",
        description: isInWishlist
          ? `${product.name} removed from wishlist`
          : `${product.name} added to wishlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update wishlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`hover:bg-pink-50 ${
        isInWishlist ? "text-pink-500 border-pink-500" : ""
      } ${className}`}
      onClick={handleAddToWishlist}
      disabled={isLoading}
      title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart
        className={`h-5 w-5 ${isLoading ? "animate-pulse" : ""} ${
          isInWishlist ? "fill-current" : ""
        } ${iconClassName}`}
      />
    </Button>
  );
}
