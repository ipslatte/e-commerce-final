import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import { Category } from "@/models/Category";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const category = await Category.findOne({ slug: params.slug }).lean();

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
    });
  } catch (error) {
    console.error("Error in GET /api/categories/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
