import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, secret } = await request.json();

    // Security measure: require a secret key to prevent unauthorized access
    // You should set this in your .env file
    const ADMIN_PROMOTION_SECRET = process.env.ADMIN_PROMOTION_SECRET || "change-me-in-production";

    if (secret !== ADMIN_PROMOTION_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user role to admin
    await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.email, email));

    return NextResponse.json({
      success: true,
      message: `User ${email} has been promoted to admin`,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return NextResponse.json(
      { error: "Failed to promote user to admin" },
      { status: 500 }
    );
  }
}