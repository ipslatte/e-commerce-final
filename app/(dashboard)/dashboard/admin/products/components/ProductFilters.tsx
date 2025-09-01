"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface FilterProps {
  onFilterChange: (filters: {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
}

export default function ProductFilters({ onFilterChange }: FilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#050b2c]/40" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-[#050b2c] placeholder-[#050b2c]/40 focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#050b2c] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20"
        >
          <Filter className="h-4 w-4 mr-2" />
          {isFiltersVisible ? "Hide Filters" : "Show Filters"}
        </button>
        {Object.values(filters).some(Boolean) && (
          <button
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#c90b0b] hover:text-red-700 focus:outline-none"
          >
            <X className="h-4 w-4 mr-2" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Filter Options */}
      {isFiltersVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white border border-gray-200 rounded-lg"
        >
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#050b2c]">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-[#050b2c] focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filters */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#050b2c]">
              Min Price
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              placeholder="0.00"
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-[#050b2c] placeholder-[#050b2c]/40 focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#050b2c]">
              Max Price
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              placeholder="1000.00"
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-[#050b2c] placeholder-[#050b2c]/40 focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
