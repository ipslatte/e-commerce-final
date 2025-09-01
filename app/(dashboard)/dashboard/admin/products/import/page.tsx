"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  Upload,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function ImportProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState({
    loading: false,
    message: "",
    error: "",
  });

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

      // Refresh products list
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="p-2 bg-[#ffa509]/10 rounded-lg">
            <Upload className="h-6 w-6 text-[#ffa509]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#050b2c]">
              Import Products
            </h1>
            <p className="text-[#050b2c]/60">
              Import multiple products using a spreadsheet file
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {/* Instructions */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#050b2c] mb-4 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#ffa509]" />
              Instructions
            </h2>
            <div className="space-y-3 text-[#050b2c]/70">
              <ol className="list-decimal list-inside space-y-3">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Download our sample template to see the required format
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Fill in your product data following the template structure
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Upload your completed file using the form below
                </motion.li>
              </ol>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 bg-[#050b2c]/5 rounded-lg"
              >
                <h3 className="font-medium text-[#050b2c] mb-2">
                  Required Fields:
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>• name</div>
                  <div>• description</div>
                  <div>• price</div>
                  <div>• category</div>
                  <div>• stock</div>
                </div>
                <div className="mt-2 text-sm">
                  Optional: coverImage, images (comma-separated URLs)
                </div>
              </motion.div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <Link
                href="/sample-products-import.xlsx"
                className="inline-flex items-center px-6 py-3 rounded-lg text-[#050b2c] bg-[#050b2c]/5 hover:bg-[#050b2c]/10 transition-colors duration-300"
                download
              >
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                Download Sample Template
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-[#050b2c]/10 rounded-lg hover:border-[#ffa509] transition-colors duration-300 flex flex-col items-center justify-center gap-4"
              >
                <div className="p-4 bg-[#ffa509]/10 rounded-full">
                  <Upload className="h-6 w-6 text-[#ffa509]" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-[#050b2c]">
                    Click to upload file
                  </p>
                  <p className="text-sm text-[#050b2c]/60 mt-1">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>
              </button>
            </motion.div>

            {/* Status Messages */}
            {importStatus.loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-[#050b2c]/5 rounded-lg flex items-center gap-3"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-green-50 rounded-lg flex items-center gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{importStatus.message}</span>
              </motion.div>
            )}

            {importStatus.error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 text-[#c90b0b]" />
                <span className="text-[#c90b0b]">{importStatus.error}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 flex justify-end"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-[#050b2c] bg-white hover:bg-[#050b2c]/5 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Products
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
