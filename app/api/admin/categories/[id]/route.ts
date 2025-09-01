import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/config/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import mongoose from "mongoose";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/admin/categories/[id] - Get a single category
export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();
    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error in GET /api/admin/categories/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] - Update a category
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const category = await Category.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error in PUT /api/admin/categories/[id]:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Delete a category
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if category is being used by any products
    const productsCount = await Product.countDocuments({ category: params.id });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category that has products" },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(params.id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/categories/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
