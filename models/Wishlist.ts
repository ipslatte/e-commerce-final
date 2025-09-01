import { Schema, model, models } from "mongoose";

export interface Wishlist {
  _id: string;
  userId: string;
  products: {
    productId: string;
    addedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure each product appears only once per user's wishlist
wishlistSchema.index({ userId: 1, "products.productId": 1 }, { unique: true });

export const Wishlist = models.Wishlist || model("Wishlist", wishlistSchema);
