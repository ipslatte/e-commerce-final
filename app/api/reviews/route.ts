import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Review } from "@/models/Review";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    await client.connect();

    const reviews = await Review.find({ userId: session.user.id })
      .populate("productId", "name coverImage")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const productId = formData.get("productId") as string;
    const rating = parseInt(formData.get("rating") as string);
    const title = formData.get("title") as string;
    const comment = formData.get("review") as string;
    const imageFiles = formData.getAll("images") as File[];

    if (!productId || !rating || !title || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    await client.connect();

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      userId: session.user.id,
      productId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Handle image uploads
    const images: string[] = [];
    if (imageFiles.length > 0) {
      // Upload images to your storage service (e.g., Cloudinary, S3)
      // For now, we'll store them as base64 strings
      for (const file of imageFiles) {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;
        images.push(dataUrl);
      }
    }

    const review = await Review.create({
      userId: session.user.id,
      productId,
      rating,
      title,
      comment,
      images,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("productId", "name coverImage")
      .lean();

    return NextResponse.json(populatedReview);
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
