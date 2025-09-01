import mongoose, { Schema } from "mongoose";

const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: "ProductVariant",
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [CartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
CartSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
