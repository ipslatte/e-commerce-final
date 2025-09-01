"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  _id: string;
  name: string;
}

interface FilterProps {
  onFilterChange: (filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
  }) => void;
}

export default function ProductFilters({ onFilterChange }: FilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
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
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-[#050b2c]"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span className="font-medium">Filters</span>
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Filter Content */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-4 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-[#050b2c] mb-3">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category._id}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#050b2c] cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category._id}
                    checked={filters.category === category._id}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-4 h-4 text-[#ffa509] border-gray-300 focus:ring-[#ffa509]"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium text-[#050b2c] mb-3">
              Price Range
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Max</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  placeholder="1000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-sm font-medium text-[#050b2c] mb-3">Sort By</h3>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleApply}
              className="flex-1 bg-[#050b2c] hover:bg-[#050b2c]/90 text-white"
            >
              Apply Filters
            </Button>
            {(filters.category ||
              filters.minPrice ||
              filters.maxPrice ||
              filters.sort !== "newest") && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="px-3 text-[#c90b0b] border-[#c90b0b] hover:bg-[#c90b0b]/5"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
