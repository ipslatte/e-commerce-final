import { NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import { Product } from "@/models/Product";
import { Types } from "mongoose";

interface ProductVariant {
  _id: Types.ObjectId;
  sku: string;
  price: number;
  stock: number;
  attributes: {
    [key: string]: string;
  };
}

interface BaseProduct {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  coverImage: string;
  category: {
    _id: Types.ObjectId;
    name: string;
  };
  variants?: ProductVariant[];
  attributes: Map<string, any> | Record<string, any>;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = (await Product.findById(id)
      .populate("category", "name")
      .lean()) as unknown as BaseProduct;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Transform _id to string for better JSON serialization
    const transformedProduct = {
      ...product,
      _id: product._id.toString(),
      category: {
        _id: product.category._id.toString(),
        name: product.category.name,
      },
      variants: (product.variants || []).map((variant) => ({
        ...variant,
        _id: variant._id.toString(),
      })),
      // Convert Map to plain object if it's a Map, otherwise use as is
      attributes:
        product.attributes instanceof Map
          ? Object.fromEntries(product.attributes)
          : product.attributes,
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
