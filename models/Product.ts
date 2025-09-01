import mongoose, { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide a product category"],
    },
    coverImage: {
      type: String,
      required: [true, "Please provide a product image"],
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, "Please provide product stock quantity"],
      min: [0, "Stock cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, "Low stock threshold cannot be negative"],
    },
    views: {
      type: Number,
      default: 0,
    },
    lastViewed: {
      type: Date,
      default: null,
    },
    notifyLowStock: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    lastSold: {
      type: Date,
      default: null,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality
productSchema.index({ name: "text", description: "text" });

// Middleware to validate attributes against category schema
productSchema.pre("save", async function (next) {
  if (this.isModified("attributes") || this.isModified("category")) {
    try {
      const Category = mongoose.model("Category");
      const category = await Category.findById(this.category);

      if (!category) {
        return next(new Error("Category not found"));
      }

      // Validate required attributes
      for (const attrDef of category.attributes) {
        if (attrDef.required && !this.attributes.has(attrDef.name)) {
          return next(
            new Error(`Required attribute "${attrDef.name}" is missing`)
          );
        }

        if (this.attributes.has(attrDef.name)) {
          const value = this.attributes.get(attrDef.name);

          // Type validation
          switch (attrDef.type) {
            case "number":
              if (typeof value !== "number") {
                return next(
                  new Error(`Attribute "${attrDef.name}" must be a number`)
                );
              }
              break;
            case "boolean":
              if (typeof value !== "boolean") {
                return next(
                  new Error(`Attribute "${attrDef.name}" must be a boolean`)
                );
              }
              break;
            case "select":
              if (!attrDef.options.includes(value)) {
                return next(
                  new Error(`Invalid value for attribute "${attrDef.name}"`)
                );
              }
              break;
            case "multiselect":
              if (
                !Array.isArray(value) ||
                !value.every((v) => attrDef.options.includes(v))
              ) {
                return next(
                  new Error(`Invalid value for attribute "${attrDef.name}"`)
                );
              }
              break;
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        return next(error);
      }
      return next(new Error("An unknown error occurred"));
    }
  }

  // Check if stock is below threshold and should notify
  if (this.isModified("stock") && this.notifyLowStock) {
    if (this.stock <= this.lowStockThreshold) {
      // Emit low stock event (will be implemented in the notification system)
      console.log(
        `Low stock alert for product ${this.name}: ${this.stock} items remaining`
      );
    }
  }

  next();
});

export const Product = models.Product || model("Product", productSchema);
