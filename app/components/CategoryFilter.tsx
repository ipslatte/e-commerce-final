"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function CategoryFilter() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("Fetching categories...");
        const response = await fetch("/api/categories");
        console.log("Categories response status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Categories API error:", errorText);
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Categories data:", data);
        if (!Array.isArray(data)) {
          console.error("Invalid categories data format:", data);
          throw new Error("Invalid categories data format");
        }
        setCategories(data);
      } catch (error) {
        console.error("Error in fetchCategories:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load categories"
        );
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    router.push(`/?${params.toString()}`);
  };

  if (loading) {
    return <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900">Categories</h3>
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => handleCategoryChange("all")}
          className={`text-left px-3 py-2 rounded-md text-sm ${
            !searchParams.get("category")
              ? "bg-blue-100 text-blue-800"
              : "hover:bg-gray-100"
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryChange(category._id)}
            className={`text-left px-3 py-2 rounded-md text-sm ${
              searchParams.get("category") === category._id
                ? "bg-blue-100 text-blue-800"
                : "hover:bg-gray-100"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
