"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProductTable from "../components/ProductTable";
import ProductFilters from "../components/ProductFilters";

export default function OutOfStockProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          stock: "0", // Only get products with stock = 0
          ...(filters.category && { category: filters.category }),
          ...(filters.minPrice && { minPrice: filters.minPrice }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
          ...(filters.search && { search: filters.search }),
        });

        const response = await fetch(`/api/admin/products?${queryParams}`);
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching out-of-stock products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Out of Stock Products
        </h1>
      </div>

      <ProductFilters filters={filters} onFilterChange={handleFilterChange} />

      <ProductTable
        products={products}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
