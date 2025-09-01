import mongoose from "mongoose";

export interface FlashSale {
  _id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  products: Array<{
    productId: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    maxQuantityPerCustomer?: number;
    totalQuantity?: number;
    soldQuantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const flashSaleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        discountType: {
          type: String,
          required: true,
          enum: ["percentage", "fixed"],
        },
        discountValue: {
          type: Number,
          required: true,
          min: 0,
        },
        maxQuantityPerCustomer: {
          type: Number,
          min: 0,
        },
        totalQuantity: {
          type: Number,
          min: 0,
        },
        soldQuantity: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add indexes for faster lookups
flashSaleSchema.index({ startDate: 1, endDate: 1 });
flashSaleSchema.index({ isActive: 1 });
flashSaleSchema.index({ "products.productId": 1 });

export const FlashSale =
  mongoose.models.FlashSale || mongoose.model("FlashSale", flashSaleSchema);
