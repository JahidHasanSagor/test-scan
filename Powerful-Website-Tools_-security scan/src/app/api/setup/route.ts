import { db } from "@/db";
import { user, session, account, verification } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection by trying to query auth tables
    const checks = await Promise.allSettled([
      db.select().from(user).limit(1),
      db.select().from(session).limit(1),
      db.select().from(account).limit(1),
      db.select().from(verification).limit(1),
    ]);

    const tableStatus = {
      user: checks[0].status === "fulfilled",
      session: checks[1].status === "fulfilled",
      account: checks[2].status === "fulfilled",
      verification: checks[3].status === "fulfilled",
    };

    const missingTables = Object.entries(tableStatus)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name);

    const allTablesExist = missingTables.length === 0;

    return NextResponse.json({
      success: allTablesExist,
      message: allTablesExist 
        ? "✅ All auth tables exist - authentication should work!" 
        : "⚠️ Missing auth tables - authentication will fail",
      tableStatus,
      missingTables,
      solution: !allTablesExist 
        ? "Run 'npm run db:push' in your terminal to create missing tables, or contact support for help."
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        note: "Database connection failed. Check your TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN in .env file"
      },
      { status: 500 }
    );
  }
}