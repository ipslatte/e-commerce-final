"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Heart, Trash2, ShoppingCart, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";
import { motion } from "framer-motion";

interface ProductAttributes {
  [key: string]: string | string[];
}

interface Product {
  _id: string;
  name: string;
  price: number;
  coverImage: string;
  stock: number;
  slug: string;
  attributes?: ProductAttributes;
}

interface WishlistItem {
  productId: Product;
  addedAt: string;
}

export default function WishlistClient() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist");
      if (!response.ok) throw new Error("Failed to fetch wishlist");
      const data = await response.json();
      setWishlistItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove from wishlist");

      setWishlistItems((prev) =>
        prev.filter((item) => item.productId._id !== productId)
      );

      toast({
        title: "Success",
        description: "Item removed from wishlist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product._id);
    try {
      await addToCart(product, 1);
      toast({
        title: "Success",
        description: "Item added to cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#ffa509] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full"
        >
          <Heart className="h-16 w-16 mx-auto text-[#ffa509] mb-4" />
          <h3 className="text-xl font-semibold text-[#050b2c] mb-3">
            Your wishlist is empty
          </h3>
          <p className="text-gray-600 mb-6">
            Start adding items you love to your wishlist
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#050b2c] to-[#0a1854] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            <Package className="h-5 w-5 mr-2" />
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {wishlistItems.map((item, index) => (
          <motion.div
            key={item.productId._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <Link
              href={`/products/${item.productId.slug}`}
              className="block relative aspect-square overflow-hidden"
            >
              <Image
                src={item.productId.coverImage}
                alt={item.productId.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <div className="p-6">
              <Link href={`/products/${item.productId.slug}`}>
                <h3 className="text-lg font-semibold text-[#050b2c] group-hover:text-[#ffa509] transition-colors duration-300 mb-2">
                  {item.productId.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between mb-4">
                <p className="text-2xl font-bold text-[#050b2c]">
                  ${item.productId.price.toFixed(2)}
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.productId.stock > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.productId.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleAddToCart(item.productId)}
                  disabled={
                    addingToCart === item.productId._id ||
                    item.productId.stock === 0
                  }
                  className="flex-1 bg-gradient-to-r from-[#050b2c] to-[#0a1854] text-white hover:shadow-lg transition-all duration-300"
                >
                  {addingToCart === item.productId._id ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeFromWishlist(item.productId._id)}
                  className="text-[#c90b0b] hover:text-white hover:bg-[#c90b0b] border-[#c90b0b] transition-colors duration-300"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
