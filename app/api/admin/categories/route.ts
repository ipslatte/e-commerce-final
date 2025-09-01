import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/config/db";
import { Category } from "@/models/Category";

// GET /api/admin/categories - Get all categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error in GET /api/admin/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    console.log("Received category data:", body);

    const category = await Category.create(body);
    console.log("Created category:", category);

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/admin/categories:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
