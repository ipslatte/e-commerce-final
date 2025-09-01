import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import Address from "@/models/Address";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    await client.connect();

    // First, unset any existing default
    await Address.updateMany(
      { userId: session.user.id },
      { $set: { isDefault: false } }
    );

    // Then set the new default
    const address = await Address.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error updating default address:", error);
    return NextResponse.json(
      { error: "Failed to update default address" },
      { status: 500 }
    );
  }
}
