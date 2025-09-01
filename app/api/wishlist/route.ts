import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Wishlist } from "@/models/Wishlist";
import clientPromise from "@/lib/mongodb";

// Get user's wishlist
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    await client.connect();

    const wishlist = await Wishlist.findOne({ userId: session.user.id })
      .populate("products.productId")
      .lean();

    return NextResponse.json(wishlist?.products || []);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// Add product to wishlist
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    await client.connect();

    // Check if product already exists in wishlist
    const existingWishlist = await Wishlist.findOne({
      userId: session.user.id,
      "products.productId": productId,
    });

    if (existingWishlist) {
      return NextResponse.json(
        { error: "Product already in wishlist" },
        { status: 400 }
      );
    }

    // Add product to wishlist
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: session.user.id },
      {
        $setOnInsert: { userId: session.user.id },
        $addToSet: { products: { productId } },
      },
      { upsert: true, new: true }
    )
      .populate("products.productId")
      .lean();

    return NextResponse.json(wishlist.products);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// Remove product from wishlist
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    await client.connect();

    // First, check if the product exists in the wishlist
    const existingWishlist = await Wishlist.findOne({
      userId: session.user.id,
      "products.productId": productId,
    });

    if (!existingWishlist) {
      return NextResponse.json(
        { error: "Product not found in wishlist" },
        { status: 404 }
      );
    }

    // Remove the product from wishlist
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { userId: session.user.id },
      { $pull: { products: { productId: productId } } },
      { new: true }
    )
      .populate("products.productId")
      .lean();

    return NextResponse.json(updatedWishlist?.products || []);
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
