"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Package, AlertTriangle } from "lucide-react";

interface AttributeDefinition {
  name: string;
  type: "text" | "number" | "boolean" | "select" | "multiselect";
  required: boolean;
  options: string[];
  defaultValue?: any;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  attributes: AttributeDefinition[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  coverImage: string;
  images: string[];
  stock: number;
  attributes: Map<string, any>;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const coverImageRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    attributes: new Map<string, any>(),
  });

  // Separate useEffect for fetching product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${id}`);
        const product = await response.json();

        if (response.ok) {
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            stock: product.stock.toString(),
            attributes: new Map(Object.entries(product.attributes || {})),
          });
          setCoverImagePreview(product.coverImage);
          setImagesPreviews(product.images);
        } else {
          setError("Failed to fetch product");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to fetch product");
      }
    };

    fetchProduct();
  }, [id]);

  // Separate useEffect for fetching categories and setting selected category
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories");
        const data = await response.json();
        if (response.ok) {
          setCategories(data);
          // Find and set the selected category if formData.category exists
          if (formData.category) {
            const category = data.find(
              (c: Category) => c._id === formData.category
            );
            if (category) {
              setSelectedCategory(category);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []); // Only run once on component mount

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update selected category when category changes
    if (name === "category") {
      const category = categories.find((c) => c._id === value);
      setSelectedCategory(category || null);
      // Reset attributes when category changes
      setFormData((prev) => ({
        ...prev,
        category: value,
        attributes: new Map(),
      }));
    }
  };

  const handleAttributeChange = (name: string, value: any) => {
    setFormData((prev) => {
      const newAttributes = new Map(prev.attributes);
      newAttributes.set(name, value);
      return {
        ...prev,
        attributes: newAttributes,
      };
    });
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const previews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          setImagesPreviews([...previews]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const { url } = await response.json();
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!formData.category) {
        throw new Error("Please select a category");
      }

      let updatedData: any = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        attributes: Object.fromEntries(formData.attributes),
      };

      // Handle cover image upload if changed
      const coverImageFile = coverImageRef.current?.files?.[0];
      if (coverImageFile) {
        const coverImageUrl = await uploadImage(coverImageFile);
        updatedData.coverImage = coverImageUrl;
      }

      // Handle additional images upload if changed
      const additionalImages = imagesRef.current?.files;
      if (additionalImages && additionalImages.length > 0) {
        const imageUrls = [];
        for (const file of Array.from(additionalImages)) {
          const imageUrl = await uploadImage(file);
          imageUrls.push(imageUrl);
        }
        updatedData.images = imageUrls;
      }

      // Update the product
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      router.push("/dashboard/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete product");
      }

      router.push("/dashboard/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 max-w-5xl"
    >
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-2"
        >
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#050b2c]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#050b2c] flex items-center gap-2">
              <Package className="h-6 w-6" />
              Edit Product
            </h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[#050b2c]/60 mt-1"
            >
              Update your product information and manage its details
            </motion.p>
          </div>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-[#c90b0b]" />
          <p className="text-[#c90b0b] text-sm">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
          <h2 className="text-lg font-semibold text-[#050b2c] mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#050b2c] mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509] transition-colors"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#050b2c] mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509] transition-colors"
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#050b2c] mb-2">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-[#050b2c]/60">
                  $
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509] transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#050b2c] mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509] transition-colors"
                placeholder="Enter stock quantity"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#050b2c] mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509] transition-colors"
              placeholder="Enter product description"
            />
          </div>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
          <h2 className="text-lg font-semibold text-[#050b2c] mb-4">
            Product Images
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#050b2c] mb-2">
                Cover Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-lg hover:border-[#ffa509] transition-colors">
                <div className="space-y-1 text-center">
                  {coverImagePreview ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={coverImagePreview}
                        alt="Cover preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#ffa509] hover:text-[#ffa509]/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#ffa509]">
                      <span>Change image</span>
                      <input
                        ref={coverImageRef}
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#050b2c] mb-2">
                Additional Images
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-lg hover:border-[#ffa509] transition-colors">
                <div className="space-y-1 text-center">
                  {imagesPreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {imagesPreviews.map((preview, index) => (
                        <div key={index} className="relative w-full h-24">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#ffa509] hover:text-[#ffa509]/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#ffa509]">
                      <span>Change images</span>
                      <input
                        ref={imagesRef}
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Attributes */}
        {selectedCategory && selectedCategory.attributes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-[#050b2c] mb-6">
              Product Attributes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCategory.attributes.map((attr) => (
                <div key={attr.name}>
                  <label className="block text-sm font-medium text-[#050b2c] mb-2">
                    {attr.name}
                    {attr.required && (
                      <span className="text-[#c90b0b] ml-1">*</span>
                    )}
                  </label>

                  {attr.type === "text" && (
                    <input
                      type="text"
                      value={formData.attributes.get(attr.name) || ""}
                      onChange={(e) =>
                        handleAttributeChange(attr.name, e.target.value)
                      }
                      required={attr.required}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509] transition-colors"
                    />
                  )}

                  {attr.type === "number" && (
                    <input
                      type="number"
                      value={formData.attributes.get(attr.name) || ""}
                      onChange={(e) =>
                        handleAttributeChange(attr.name, e.target.value)
                      }
                      required={attr.required}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509] transition-colors"
                    />
                  )}

                  {attr.type === "boolean" && (
                    <select
                      value={formData.attributes.get(attr.name) || ""}
                      onChange={(e) =>
                        handleAttributeChange(attr.name, e.target.value)
                      }
                      required={attr.required}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509] transition-colors"
                    >
                      <option value="">Select...</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  )}

                  {(attr.type === "select" || attr.type === "multiselect") && (
                    <select
                      value={
                        attr.type === "multiselect"
                          ? undefined
                          : formData.attributes.get(attr.name) || ""
                      }
                      multiple={attr.type === "multiselect"}
                      onChange={(e) => {
                        if (attr.type === "multiselect") {
                          const selected = Array.from(
                            e.target.selectedOptions
                          ).map((option) => option.value);
                          handleAttributeChange(attr.name, selected);
                        } else {
                          handleAttributeChange(attr.name, e.target.value);
                        }
                      }}
                      required={attr.required}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509] transition-colors"
                    >
                      {!attr.required && <option value="">Select...</option>}
                      {attr.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center"
        >
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2.5 rounded-lg border border-[#c90b0b] text-[#c90b0b] hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="h-5 w-5" />
            Delete Product
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg border border-gray-200 text-[#050b2c] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white hover:shadow-lg hover:shadow-[#ffa509]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Updating...
                </div>
              ) : (
                "Update Product"
              )}
            </button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}
