"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { FiFilter, FiSearch } from "react-icons/fi";

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      const res = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();
      setProducts(data);
      setTotal(data.length || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);

    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams);

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (sort) params.set("sort", sort);
    else params.delete("sort");

    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");

    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Hero Section with Pattern Background */}
      <div className="bg-[#050b2c] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <h1
            className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          >
            Discover Our Products
          </h1>
          <p
            className="text-center mt-6 text-gray-300 text-lg max-w-2xl mx-auto"
          >
            Browse through our carefully curated collection of premium products
          </p>

          {/* Search Bar */}
          <div
            className="max-w-2xl mx-auto mt-10"
          >
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa509] text-gray-800 text-lg shadow-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-[#ffa509] text-white px-8 py-3 rounded-xl hover:bg-[#e59408] transition-colors shadow-lg font-medium text-lg"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className="lg:w-1/4"
          >
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-4">
              <div className="flex items-center gap-3 mb-8">
                <FiFilter className="text-[#ffa509] w-6 h-6" />
                <h2 className="text-2xl font-semibold text-[#050b2c]">
                  Filters
                </h2>
              </div>

              {/* Categories Filter */}
              <div className="mb-8">
                <h3 className="font-medium text-[#050b2c] mb-4 text-lg">
                  Categories
                </h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa509] text-gray-700"
                >
                  <option value="">All Categories</option>
                  {categories.map((category: any) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h3 className="font-medium text-[#050b2c] mb-4 text-lg">
                  Price Range
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa509] text-gray-700"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa509] text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-8">
                <h3 className="font-medium text-[#050b2c] mb-4 text-lg">
                  Sort By
                </h3>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa509] text-gray-700"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                </select>
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={handleFilter}
                className="w-full bg-[#050b2c] text-white py-3 rounded-xl hover:bg-opacity-90 transition-colors font-medium text-lg shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div
            className="lg:w-3/4"
          >
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-[#050b2c]">
                  {total} Products Found
                </h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="relative w-20 h-20">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-[#ffa509] border-opacity-20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-[#ffa509] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <ProductGrid products={products} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
