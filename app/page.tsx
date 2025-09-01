"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/app/components/ProductCard";
import CategoryFilter from "@/app/components/CategoryFilter";
import SearchBar from "@/app/components/SearchBar";
import ProductSort from "@/app/components/ProductSort";
import FlashSaleProducts from "@/components/FlashSaleProducts";
import HeroCarousel from "@/components/HeroCarousel";
import PopularCategories from "@/components/PopularCategories";
import DealOfTheDay from "@/components/DealOfTheDay";
import DiscountCodes from "@/app/components/DiscountCodes";
import MostViewedProducts from "@/components/MostViewedProducts";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  coverImage: string;
  stock: number;
}

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroCarousel />
      <PopularCategories />
      <DealOfTheDay />
      <DiscountCodes />
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 animate-fade-in">
            Flash Sales
          </h2>
          <FlashSaleProducts />
        </div>
      </section>
      <MostViewedProducts />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
