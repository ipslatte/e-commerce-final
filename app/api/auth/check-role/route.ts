import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session data:", session); // Debug log

    if (!session || !session.user) {
      console.log("No session or user found"); // Debug log
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("User data:", session.user); // Debug log

    // Return the user's role from the session
    const role = session.user.role || "user";
    console.log("Determined role:", role); // Debug log

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Detailed error in check-role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
