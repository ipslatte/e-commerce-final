import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Aggregate users with their order statistics
    const users = await db
      .collection("users")
      .aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "email",
            foreignField: "userEmail",
            as: "orders",
          },
        },
        {
          $addFields: {
            ordersCount: { $size: "$orders" },
            totalSpent: {
              $reduce: {
                input: "$orders",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.total"] },
              },
            },
          },
        },
        {
          $project: {
            password: 0,
            orders: 0,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, status, role } = body;

    // Validate required fields
    if (!name || !email || !password || !status || !role) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse("Invalid email format", { status: 400 });
    }

    // Validate password length
    if (password.length < 8) {
      return new NextResponse("Password must be at least 8 characters long", {
        status: 400,
      });
    }

    // Validate role
    if (role !== "customer") {
      return new NextResponse("Can only create customer accounts", {
        status: 400,
      });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if email already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      _id: result.insertedId,
      name,
      email,
      role,
      status,
    });
  } catch (error) {
    console.error("[USERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
