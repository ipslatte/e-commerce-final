import { NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import { Category } from "@/models/Category";
import { Types } from "mongoose";

interface CategoryDocument {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

export async function GET() {
  try {
    await connectDB();

    // Get all categories with timeout handling
    const categories = await Promise.race([
      Category.find()
        .select("name slug")
        .sort({ name: 1 })
        .lean<CategoryDocument[]>(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Categories query timeout")), 5000)
      ),
    ]);

    // Transform categories to ensure consistent format
    const transformedCategories = (categories as CategoryDocument[]).map(
      (category) => ({
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
      })
    );

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
