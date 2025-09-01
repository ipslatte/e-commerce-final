"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Settings2,
  DollarSign,
  Package,
  FolderTree,
  Trash2,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";

type BulkOperation =
  | "update-price"
  | "update-stock"
  | "delete"
  | "categorize"
  | "import"
  | "export";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function BulkOperationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedOperation, setSelectedOperation] = useState<
    BulkOperation | ""
  >("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [bulkValue, setBulkValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState({
    loading: false,
    message: "",
    error: "",
  });

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
        const response = await fetch("/api/admin/products");
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleBulkOperation = async () => {
    if (!selectedOperation || selectedProducts.length === 0) {
      setError("Please select an operation and at least one product");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: selectedOperation,
          productIds: selectedProducts,
          value: bulkValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to perform bulk operation");
      }

      setSuccess("Bulk operation completed successfully");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to perform bulk operation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ loading: true, message: "", error: "" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/products/bulk/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import products");
      }

      setImportStatus({
        loading: false,
        message: data.message,
        error: "",
      });

      router.refresh();
    } catch (error) {
      setImportStatus({
        loading: false,
        message: "",
        error:
          error instanceof Error ? error.message : "Failed to import products",
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/products/bulk/export");

      if (!response.ok) {
        throw new Error("Failed to export products");
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "products.xlsx";

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to export products"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 p-8 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#ffa509] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="p-2 bg-[#ffa509]/10 rounded-lg">
            <Settings2 className="h-6 w-6 text-[#ffa509]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#050b2c]">
              Bulk Operations
            </h1>
            <p className="text-[#050b2c]/60">
              Efficiently manage multiple products at once
            </p>
          </div>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-[#c90b0b] text-[#c90b0b] rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            <p>{success}</p>
          </motion.div>
        )}

        {/* Operation Selection */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Update Price */}
          <motion.button
            variants={item}
            onClick={() => setSelectedOperation("update-price")}
            className={`group p-6 rounded-xl border transition-all duration-300 ${
              selectedOperation === "update-price"
                ? "bg-gradient-to-br from-[#050b2c] to-[#0a1854] border-transparent text-white shadow-lg shadow-[#050b2c]/20"
                : "bg-white border-gray-200 hover:border-[#050b2c] text-[#050b2c]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-lg ${
                  selectedOperation === "update-price"
                    ? "bg-white/10"
                    : "bg-[#050b2c]/5 group-hover:bg-[#050b2c]/10"
                }`}
              >
                <DollarSign className="h-6 w-6" />
              </div>
              <ChevronRight
                className={`h-5 w-5 transition-transform ${
                  selectedOperation === "update-price"
                    ? "translate-x-1"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold mb-1">Update Price</h3>
            <p
              className={`text-sm ${
                selectedOperation === "update-price"
                  ? "text-white/60"
                  : "text-[#050b2c]/60"
              }`}
            >
              Change prices for multiple products at once
            </p>
          </motion.button>

          {/* Update Stock */}
          <motion.button
            variants={item}
            onClick={() => setSelectedOperation("update-stock")}
            className={`group p-6 rounded-xl border transition-all duration-300 ${
              selectedOperation === "update-stock"
                ? "bg-gradient-to-br from-[#050b2c] to-[#0a1854] border-transparent text-white shadow-lg shadow-[#050b2c]/20"
                : "bg-white border-gray-200 hover:border-[#050b2c] text-[#050b2c]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-lg ${
                  selectedOperation === "update-stock"
                    ? "bg-white/10"
                    : "bg-[#050b2c]/5 group-hover:bg-[#050b2c]/10"
                }`}
              >
                <Package className="h-6 w-6" />
              </div>
              <ChevronRight
                className={`h-5 w-5 transition-transform ${
                  selectedOperation === "update-stock"
                    ? "translate-x-1"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold mb-1">Update Stock</h3>
            <p
              className={`text-sm ${
                selectedOperation === "update-stock"
                  ? "text-white/60"
                  : "text-[#050b2c]/60"
              }`}
            >
              Adjust inventory levels for multiple products
            </p>
          </motion.button>

          {/* Categorize */}
          <motion.button
            variants={item}
            onClick={() => setSelectedOperation("categorize")}
            className={`group p-6 rounded-xl border transition-all duration-300 ${
              selectedOperation === "categorize"
                ? "bg-gradient-to-br from-[#050b2c] to-[#0a1854] border-transparent text-white shadow-lg shadow-[#050b2c]/20"
                : "bg-white border-gray-200 hover:border-[#050b2c] text-[#050b2c]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-lg ${
                  selectedOperation === "categorize"
                    ? "bg-white/10"
                    : "bg-[#050b2c]/5 group-hover:bg-[#050b2c]/10"
                }`}
              >
                <FolderTree className="h-6 w-6" />
              </div>
              <ChevronRight
                className={`h-5 w-5 transition-transform ${
                  selectedOperation === "categorize"
                    ? "translate-x-1"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold mb-1">Categorize</h3>
            <p
              className={`text-sm ${
                selectedOperation === "categorize"
                  ? "text-white/60"
                  : "text-[#050b2c]/60"
              }`}
            >
              Organize products into categories
            </p>
          </motion.button>

          {/* Delete */}
          <motion.button
            variants={item}
            onClick={() => setSelectedOperation("delete")}
            className={`group p-6 rounded-xl border transition-all duration-300 ${
              selectedOperation === "delete"
                ? "bg-gradient-to-br from-[#c90b0b] to-[#ff1a1a] border-transparent text-white shadow-lg shadow-[#c90b0b]/20"
                : "bg-white border-gray-200 hover:border-[#c90b0b] text-[#c90b0b]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-lg ${
                  selectedOperation === "delete"
                    ? "bg-white/10"
                    : "bg-[#c90b0b]/5 group-hover:bg-[#c90b0b]/10"
                }`}
              >
                <Trash2 className="h-6 w-6" />
              </div>
              <ChevronRight
                className={`h-5 w-5 transition-transform ${
                  selectedOperation === "delete"
                    ? "translate-x-1"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold mb-1">Delete Products</h3>
            <p
              className={`text-sm ${
                selectedOperation === "delete"
                  ? "text-white/60"
                  : "text-[#c90b0b]/60"
              }`}
            >
              Remove multiple products at once
            </p>
          </motion.button>

          {/* Import */}
          <motion.button
            variants={item}
            onClick={() => {
              setSelectedOperation("import");
              fileInputRef.current?.click();
            }}
            className="group p-6 rounded-xl border border-gray-200 bg-white hover:border-[#050b2c] text-[#050b2c] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-[#050b2c]/5 group-hover:bg-[#050b2c]/10">
                <Upload className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Import Products</h3>
            <p className="text-sm text-[#050b2c]/60">
              Import products from spreadsheet
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
          </motion.button>

          {/* Export */}
          <motion.button
            variants={item}
            onClick={handleExport}
            className="group p-6 rounded-xl border border-gray-200 bg-white hover:border-[#050b2c] text-[#050b2c] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-[#050b2c]/5 group-hover:bg-[#050b2c]/10">
                <Download className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Export Products</h3>
            <p className="text-sm text-[#050b2c]/60">
              Download product data as spreadsheet
            </p>
          </motion.button>
        </motion.div>

        {/* Value Input */}
        {selectedOperation &&
          selectedOperation !== "delete" &&
          selectedOperation !== "import" &&
          selectedOperation !== "export" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-[#050b2c] mb-4">
                {selectedOperation === "update-price"
                  ? "Enter New Price"
                  : selectedOperation === "update-stock"
                  ? "Enter New Stock Level"
                  : "Select Category"}
              </h2>
              <input
                type={selectedOperation === "update-price" ? "number" : "text"}
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder={
                  selectedOperation === "update-price"
                    ? "Enter new price..."
                    : selectedOperation === "update-stock"
                    ? "Enter new stock level..."
                    : "Enter category..."
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
                step={selectedOperation === "update-price" ? "0.01" : "1"}
              />
            </motion.div>
          )}

        {/* Product Selection */}
        {selectedOperation &&
          selectedOperation !== "import" &&
          selectedOperation !== "export" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-[#050b2c] mb-4">
                Select Products
              </h2>
              <div className="space-y-2">
                {products.map((product: any) => (
                  <label
                    key={product._id}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([
                            ...selectedProducts,
                            product._id,
                          ]);
                        } else {
                          setSelectedProducts(
                            selectedProducts.filter((id) => id !== product._id)
                          );
                        }
                      }}
                      className="h-4 w-4 text-[#ffa509] border-gray-300 rounded focus:ring-[#ffa509]"
                    />
                    <span className="ml-3 text-[#050b2c]">{product.name}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

        {/* Action Button */}
        {selectedOperation &&
          selectedOperation !== "import" &&
          selectedOperation !== "export" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <button
                onClick={handleBulkOperation}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
                  selectedOperation === "delete"
                    ? "bg-gradient-to-r from-[#c90b0b] to-[#ff1a1a] hover:shadow-lg hover:shadow-[#c90b0b]/20"
                    : "bg-gradient-to-r from-[#050b2c] to-[#0a1854] hover:shadow-lg hover:shadow-[#050b2c]/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  `Perform ${
                    selectedOperation.charAt(0).toUpperCase() +
                    selectedOperation.slice(1)
                  }`
                )}
              </button>
            </motion.div>
          )}

        {/* Import Status */}
        {importStatus.loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-[#ffa509] border-t-transparent rounded-full"
            />
            <span className="text-[#050b2c]">Importing products...</span>
          </motion.div>
        )}

        {importStatus.message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-[#050b2c]">{importStatus.message}</span>
          </motion.div>
        )}

        {importStatus.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-[#c90b0b]" />
            <span className="text-[#050b2c]">{importStatus.error}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
