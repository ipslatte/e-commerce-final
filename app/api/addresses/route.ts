import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import Address from "@/models/Address";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    await client.connect();

    const body = await req.json();

    // If this is set as default, unset any existing default
    if (body.isDefault) {
      await Address.updateMany(
        { userId: session.user.id },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      ...body,
      userId: session.user.id,
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    await client.connect();

    const addresses = await Address.find({ userId: session.user.id });
    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}
