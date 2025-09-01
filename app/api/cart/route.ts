import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/config/db";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";

// Helper function to populate cart items
async function populateCartItems(cart: any) {
  return cart
    .populate({
      path: "items.product",
      select: "name price coverImage stock attributes",
    })
    .populate({
      path: "items.variant",
      select: "sku price stock attributes",
    });
}

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: session.user.id,
        items: [],
      });
    }

    // Populate cart with complete product and variant information
    cart = await populateCartItems(cart);

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { productId, variantId, quantity = 1 } = await req.json();

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    await connectDB();

    // Verify product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // If variant is specified, check variant stock
    if (variantId) {
      const variant = product.variants?.find(
        (v) => v._id.toString() === variantId
      );
      if (!variant) {
        return new NextResponse("Variant not found", { status: 404 });
      }
      if (variant.stock < quantity) {
        return new NextResponse("Not enough stock", { status: 400 });
      }
    } else {
      // Check main product stock
      if (product.stock < quantity) {
        return new NextResponse("Not enough stock", { status: 400 });
      }
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      cart = await Cart.create({
        user: session.user.id,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (!variantId ? !item.variant : item.variant?.toString() === variantId)
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
      });
    }

    await cart.save();

    // Populate cart with complete product and variant information
    cart = await populateCartItems(cart);

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { itemId, quantity } = await req.json();

    if (!itemId || quantity < 1) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    await connectDB();

    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      return new NextResponse("Cart not found", { status: 404 });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return new NextResponse("Item not found in cart", { status: 404 });
    }

    // Verify stock availability
    const product = await Product.findById(item.product);
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    if (item.variant) {
      const variant = product.variants?.find(
        (v) => v._id.toString() === item.variant.toString()
      );
      if (!variant || variant.stock < quantity) {
        return new NextResponse("Not enough stock", { status: 400 });
      }
    } else if (product.stock < quantity) {
      return new NextResponse("Not enough stock", { status: 400 });
    }

    item.quantity = quantity;
    await cart.save();

    // Populate cart with complete product and variant information
    const updatedCart = await populateCartItems(cart);

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Update cart error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { itemId } = await req.json();

    if (!itemId) {
      return new NextResponse("Item ID is required", { status: 400 });
    }

    await connectDB();

    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      return new NextResponse("Cart not found", { status: 404 });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    // Populate cart with complete product and variant information
    const updatedCart = await populateCartItems(cart);

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Remove from cart error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
