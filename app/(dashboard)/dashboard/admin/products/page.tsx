"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Package } from "lucide-react";
import ProductTable from "./components/ProductTable";
import ProductFilters from "./components/ProductFilters";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  coverImage: string;
  images: string[];
  stock: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      });

      const response = await fetch(`/api/admin/products?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-[#050b2c] flex items-center gap-2"
          >
            <Package className="h-6 w-6" />
            Products Management
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-1 text-[#050b2c]/60"
          >
            Manage your product catalog, update inventory, and track product
            performance
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => router.push("/dashboard/admin/products/add")}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#ffa509]/20 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Product
        </motion.button>
      </div>

      {/* Filters */}
      <ProductFilters onFilterChange={handleFilterChange} />

      {/* Products Table */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-xl p-8"
        >
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-[#ffa509] border-t-transparent rounded-full"
            />
            <span className="ml-2 text-[#050b2c]/60">Loading products...</span>
          </div>
        </motion.div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-xl p-8 text-center"
        >
          <Package className="h-12 w-12 mx-auto text-[#050b2c]/20 mb-4" />
          <h3 className="text-lg font-medium text-[#050b2c] mb-2">
            No Products Found
          </h3>
          <p className="text-[#050b2c]/60 mb-4">
            {filters.search ||
            filters.category ||
            filters.minPrice ||
            filters.maxPrice
              ? "Try adjusting your filters or search terms"
              : "Start by adding your first product"}
          </p>
          <button
            onClick={() => router.push("/dashboard/admin/products/add")}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#ffa509]/20 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Product
          </button>
        </motion.div>
      ) : (
        <ProductTable
          products={products}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </motion.div>
  );
}
