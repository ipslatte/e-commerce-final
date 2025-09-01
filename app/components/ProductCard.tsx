"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToWishlistButton from "@/components/AddToWishlistButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    _id: string;
    name: string;
  };
  coverImage: string;
  stock: number;
  attributes: {
    [key: string]: any;
  };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product._id}`} className="block">
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 truncate">
            {product.description}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">
              ${product.price.toFixed(2)}
            </p>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${
                product.stock > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </Link>

      {/* Wishlist Button */}
      <div className="absolute top-2 right-2">
        <AddToWishlistButton
          product={product}
          className="bg-white/80 backdrop-blur-sm hover:bg-white"
        />
      </div>
    </div>
  );
}
