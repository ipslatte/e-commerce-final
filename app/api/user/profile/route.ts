import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address } = body;

    // Email cannot be changed for security reasons
    if (body.email !== session.user.email) {
      return new NextResponse("Email cannot be changed", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Update user profile
    await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          name,
          phone,
          address,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      name,
      email: session.user.email,
      phone,
      address,
    });
  } catch (error) {
    console.error("[USER_PROFILE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
