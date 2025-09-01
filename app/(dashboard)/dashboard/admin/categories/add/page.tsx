"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Tag,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AttributeDefinition {
  name: string;
  type: "text" | "number" | "boolean" | "select" | "multiselect";
  required: boolean;
  options: string[];
  defaultValue?: any;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    attributes: [] as AttributeDefinition[],
  });
  const [newAttribute, setNewAttribute] = useState<AttributeDefinition>({
    name: "",
    type: "text",
    required: false,
    options: [],
  });

  const handleAttributeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setNewAttribute((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addAttribute = () => {
    if (!newAttribute.name) {
      setError("Attribute name is required");
      return;
    }

    if (formData.attributes.some((attr) => attr.name === newAttribute.name)) {
      setError("Attribute name must be unique");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { ...newAttribute }],
    }));

    setNewAttribute({
      name: "",
      type: "text",
      required: false,
      options: [],
    });
    setError("");
  };

  const removeAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleOptionsChange = (value: string) => {
    const options = value.split(",").map((opt) => opt.trim());
    setNewAttribute((prev) => ({
      ...prev,
      options,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Submitting category with data:", formData);
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Response from server:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      router.push("/dashboard/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Error creating category:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create category"
      );
    } finally {
      setIsLoading(false);
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
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffa509]/10 rounded-lg">
              <Tag className="h-6 w-6 text-[#ffa509]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#050b2c]">
                Add Category
              </h1>
              <p className="text-[#050b2c]/60">Create a new product category</p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-[#050b2c] bg-white rounded-lg hover:bg-[#050b2c]/5 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Categories
          </button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-[#c90b0b] text-[#c90b0b] rounded-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#050b2c] mb-1"
                >
                  Category Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[#050b2c] mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
                  placeholder="Enter category description"
                />
              </div>

              {/* Attributes Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#050b2c]">
                    Category Attributes
                  </h3>
                  {formData.attributes.length > 0 && (
                    <span className="text-sm text-[#ffa509] bg-[#ffa509]/10 px-2 py-1 rounded-full">
                      {formData.attributes.length} attributes
                    </span>
                  )}
                </div>

                {/* Existing Attributes */}
                {formData.attributes.length > 0 && (
                  <div className="space-y-2">
                    {formData.attributes.map((attr, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <span className="font-medium text-[#050b2c]">
                            {attr.name}
                          </span>
                          <span className="text-sm text-[#050b2c]/60 ml-2">
                            ({attr.type})
                            {attr.required && (
                              <span className="text-[#ffa509] ml-1">*</span>
                            )}
                          </span>
                          {(attr.type === "select" ||
                            attr.type === "multiselect") &&
                            attr.options.length > 0 && (
                              <div className="text-sm text-[#050b2c]/40 mt-1">
                                Options: {attr.options.join(", ")}
                              </div>
                            )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttribute(index)}
                          className="p-1 text-[#c90b0b] hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Add New Attribute */}
                <div className="p-4 bg-[#050b2c]/5 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#050b2c] mb-1">
                        Attribute Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newAttribute.name}
                        onChange={handleAttributeChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
                        placeholder="Enter attribute name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#050b2c] mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        value={newAttribute.type}
                        onChange={handleAttributeChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="select">Select</option>
                        <option value="multiselect">Multi-select</option>
                      </select>
                    </div>
                  </div>

                  {(newAttribute.type === "select" ||
                    newAttribute.type === "multiselect") && (
                    <div>
                      <label className="block text-sm font-medium text-[#050b2c] mb-1">
                        Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newAttribute.options.join(", ")}
                        onChange={(e) => handleOptionsChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="required"
                        checked={newAttribute.required}
                        onChange={handleAttributeChange}
                        className="rounded border-gray-300 text-[#ffa509] focus:ring-[#ffa509]"
                      />
                      <span className="text-sm text-[#050b2c]">Required</span>
                    </label>
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="flex items-center gap-2 px-4 py-2 bg-[#050b2c] text-white rounded-lg hover:bg-[#050b2c]/90 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Attribute
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-[#050b2c] hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white rounded-lg hover:shadow-lg hover:shadow-[#ffa509]/20 transition-all disabled:opacity-50"
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
                  <>
                    <Save className="h-5 w-5" />
                    Create Category
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
