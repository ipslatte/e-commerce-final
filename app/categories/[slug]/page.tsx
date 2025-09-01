"use client";

import { Suspense, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { FiFilter } from "react-icons/fi";

interface Props {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default function CategoryPage({ params, searchParams }: Props) {
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch category details
        const categoryRes = await fetch(`/api/categories/${params.slug}`);
        if (!categoryRes.ok) {
          throw new Error("Failed to fetch category");
        }
        const categoryData = await categoryRes.json();
        setCategory(categoryData);

        // Fetch products for this category
        const params = new URLSearchParams({
          ...searchParams,
          category: categoryData._id,
        });

        const productsRes = await fetch(`/api/products?${params}`);
        if (!productsRes.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
        setTotal(productsData.total || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ffa509] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return notFound();
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#050b2c] text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center capitalize">
              {category.name}
            </h1>
            <p className="text-center mt-4 text-gray-300">
              No products found in this category
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#050b2c] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center capitalize animate-fade-in">
            {category.name}
          </h1>
          <p className="text-center mt-4 text-gray-300 animate-fade-in animation-delay-200">
            Discover our amazing collection of {category.name}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="md:w-1/4 animate-slide-up">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-6">
                <FiFilter className="text-[#ffa509]" />
                <h2 className="text-xl font-semibold">Filters</h2>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-4">Price Range</h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa509]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa509]"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h3 className="font-medium mb-4">Sort By</h3>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa509]"
                  defaultValue={searchParams.sort || "newest"}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Apply Filters Button */}
              <button className="w-full bg-[#ffa509] text-white py-2 rounded-md hover:bg-opacity-90 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:w-3/4 animate-fade-in animation-delay-300">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {total} Products Found
                </h2>
              </div>

              <Suspense fallback={<div>Loading products...</div>}>
                <ProductGrid products={products} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
