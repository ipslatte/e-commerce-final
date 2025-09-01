import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return new NextResponse(
        "New password must be at least 8 characters long",
        {
          status: 400,
        }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user from database
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return new NextResponse("Current password is incorrect", { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    return new NextResponse("Password updated successfully");
  } catch (error) {
    console.error("[USER_SECURITY_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
