import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const settings = await db
      .collection("settings")
      .findOne({ type: "general" });

    return NextResponse.json(settings || {});
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
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
    const { name, description, email, phone, address, currency, timezone } =
      body;

    if (!name || !email) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const settings = {
      type: "general",
      name,
      description,
      email,
      phone,
      address,
      currency,
      timezone,
      updatedAt: new Date(),
    };

    await db
      .collection("settings")
      .updateOne({ type: "general" }, { $set: settings }, { upsert: true });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
