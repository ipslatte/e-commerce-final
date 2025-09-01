import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["active", "inactive", "blocked"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if the target user is an admin
    const targetUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (targetUser.role === "admin") {
      return new NextResponse("Cannot modify admin status", { status: 403 });
    }

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return new NextResponse("User not found", { status: 404 });
    }

    return new NextResponse("User status updated successfully");
  } catch (error) {
    console.error("[USER_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
