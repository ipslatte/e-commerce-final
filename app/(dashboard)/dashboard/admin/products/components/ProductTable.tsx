"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  coverImage: string;
  images: string[];
  stock: number;
}

interface ProductTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductTable({
  products,
  currentPage,
  totalPages,
  onPageChange,
}: ProductTableProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleEdit = (productId: string) => {
    router.push(`/dashboard/admin/products/edit/${productId}`);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setIsDeleting(productId);
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-[#050b2c] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <motion.tr
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {product.coverImage ? (
                        <Image
                          src={product.coverImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#050b2c]">
                        {product.name}
                      </div>
                      {product.images.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-[#ffa509]/10 text-[#ffa509]">
                          +{product.images.length} images
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#050b2c]/60">
                    {product.category}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#050b2c]">
                    ${product.price.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock > 10
                        ? "bg-green-100 text-green-800"
                        : product.stock > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(product._id)}
                    className="text-[#050b2c] hover:text-[#ffa509] transition-colors p-2 rounded-lg hover:bg-[#ffa509]/5 mr-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={isDeleting === product._id}
                    className="text-[#c90b0b] hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    {isDeleting === product._id ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"
                      />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-100">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#050b2c]/60">
              Showing page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <nav className="relative z-0 inline-flex -space-x-px">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "z-10 bg-[#ffa509]/10 text-[#ffa509] hover:bg-[#ffa509]/20"
                    : "bg-white text-[#050b2c]/60 hover:bg-gray-50"
                } ${page === 1 ? "rounded-l-lg" : ""} ${
                  page === totalPages ? "rounded-r-lg" : ""
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
