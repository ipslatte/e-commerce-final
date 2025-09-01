"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Tag, Plus, AlertCircle, Edit2, Trash2, X, Save } from "lucide-react";

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
  description: string;
  slug: string;
  attributes: AttributeDefinition[];
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      } else {
        setError(data.error || "Failed to fetch categories");
      }
    } catch (error) {
      setError("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleOptionsChange = (value: string) => {
    const options = value.split(",").map((opt) => opt.trim());
    setNewAttribute((prev) => ({
      ...prev,
      options,
    }));
  };

  const addAttribute = () => {
    if (!newAttribute.name) {
      setError("Attribute name is required");
      return;
    }

    // Check if we're editing an existing attribute
    const existingIndex = formData.attributes.findIndex(
      (attr) => attr.name === newAttribute.name
    );

    if (existingIndex !== -1) {
      // Update existing attribute
      const updatedAttributes = [...formData.attributes];
      updatedAttributes[existingIndex] = { ...newAttribute };
      setFormData((prev) => ({
        ...prev,
        attributes: updatedAttributes,
      }));
    } else {
      // Check for duplicate names only when adding new attribute
      if (formData.attributes.some((attr) => attr.name === newAttribute.name)) {
        setError("Attribute name must be unique");
        return;
      }
      // Add new attribute
      setFormData((prev) => ({
        ...prev,
        attributes: [...prev.attributes, { ...newAttribute }],
      }));
    }

    // Reset newAttribute state
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory._id}`
        : "/api/admin/categories";

      const method = editingCategory ? "PUT" : "POST";

      // Ensure attributes array is included
      const requestBody = {
        name: formData.name,
        description: formData.description,
        attributes: Array.isArray(formData.attributes)
          ? formData.attributes
          : [],
      };

      console.log("Submitting category with data:", requestBody);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Response from server:", data);

      if (response.ok) {
        setFormData({ name: "", description: "", attributes: [] });
        setEditingCategory(null);
        fetchCategories();
      } else {
        console.error("Server error:", data.error);
        setError(
          data.error ||
            `Failed to ${editingCategory ? "update" : "create"} category`
        );
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(`Failed to ${editingCategory ? "update" : "create"} category`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      attributes: category.attributes || [],
    });
    setNewAttribute({
      name: "",
      type: "text",
      required: false,
      options: [],
    });
  };

  const editAttribute = (attribute: AttributeDefinition) => {
    setNewAttribute({
      name: attribute.name,
      type: attribute.type,
      required: attribute.required,
      options: attribute.options || [],
    });
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setIsDeletingId(categoryId);
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCategories();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete category");
      }
    } catch (error) {
      setError("Failed to delete category");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", attributes: [] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 p-8"
    >
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-2xl font-bold text-[#050b2c]">Categories</h1>
              <p className="text-[#050b2c]/60">
                Manage your product categories and attributes
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard/admin/categories/add")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white rounded-lg hover:shadow-lg hover:shadow-[#ffa509]/20 transition-all"
          >
            <Plus className="h-5 w-5" />
            Add Category
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

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#050b2c]">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-[#050b2c] hover:text-[#ffa509] hover:bg-[#ffa509]/5 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      disabled={isDeletingId === category._id}
                      className="p-2 text-[#c90b0b] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {isDeletingId === category._id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
                        />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[#050b2c]/60 mb-4 line-clamp-2">
                  {category.description}
                </p>
                {category.attributes && category.attributes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-[#050b2c]">
                      Attributes ({category.attributes.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {category.attributes.map((attr, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-[#050b2c]/5 text-[#050b2c] rounded-full"
                        >
                          {attr.name}
                          {attr.required && (
                            <span className="text-[#ffa509] ml-1">*</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#050b2c]">
                    Edit Category
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-[#050b2c]/60 hover:text-[#050b2c] hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

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
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
                      required
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
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
                    />
                  </div>

                  {/* Attributes Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#050b2c]">
                      Attributes
                    </h3>

                    {/* Add New Attribute */}
                    <div className="p-4 bg-[#050b2c]/5 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#050b2c] mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={newAttribute.name}
                            onChange={handleAttributeChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
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
                            onChange={(e) =>
                              handleOptionsChange(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/20 focus:border-[#ffa509]"
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
                          <span className="text-sm text-[#050b2c]">
                            Required
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={addAttribute}
                          className="px-4 py-2 bg-[#050b2c] text-white rounded-lg hover:bg-[#050b2c]/90 transition-colors"
                        >
                          Add Attribute
                        </button>
                      </div>
                    </div>

                    {/* Existing Attributes */}
                    {formData.attributes.length > 0 && (
                      <div className="space-y-2">
                        {formData.attributes.map((attr, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => editAttribute(attr)}
                                className="p-1 text-[#050b2c] hover:text-[#ffa509] transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAttribute(index)}
                                className="p-1 text-[#c90b0b] hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-[#050b2c] hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white rounded-lg hover:shadow-lg hover:shadow-[#ffa509]/20 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
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
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
