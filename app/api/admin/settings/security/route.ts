import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return new NextResponse("Invalid current password", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .collection("users")
      .updateOne(
        { email: session.user.email },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );

    return new NextResponse("Password updated successfully");
  } catch (error) {
    console.error("[SECURITY_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
