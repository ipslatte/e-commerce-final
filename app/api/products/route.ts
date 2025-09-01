import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import { Product } from "@/models/Product";
import { Types } from "mongoose";

interface ProductDocument {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: {
    _id: Types.ObjectId;
    name: string;
  };
  coverImage: string;
  stock: number;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");

    // Build query
    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category && Types.ObjectId.isValid(category)) {
      query.category = new Types.ObjectId(category);
    }

    // Build sort object
    let sortObj: any = { createdAt: -1 }; // Default sort
    switch (sort) {
      case "price_asc":
        sortObj = { price: 1 };
        break;
      case "price_desc":
        sortObj = { price: -1 };
        break;
      case "name_asc":
        sortObj = { name: 1 };
        break;
      case "name_desc":
        sortObj = { name: -1 };
        break;
    }

    // Fetch products with populated category
    const products = await Product.find(query)
      .populate("category", "name")
      .sort(sortObj)
      .lean<ProductDocument[]>();

    // Transform products to ensure consistent format
    const transformedProducts = products.map((product) => ({
      ...product,
      category: product.category?.name || "Uncategorized",
      _id: product._id.toString(),
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ message: "Create product endpoint" });
}
