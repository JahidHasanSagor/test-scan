import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { globalSettings, userSubmissionTracking } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    // Get or initialize global submission count
    let globalCount = 0;
    try {
      const settings = await db
        .select()
        .from(globalSettings)
        .where(eq(globalSettings.key, "total_submissions"))
        .limit(1);

      if (settings[0]?.value) {
        globalCount = parseInt(settings[0].value);
      } else {
        // Initialize the counter if it doesn't exist
        await db.insert(globalSettings).values({
          key: "total_submissions",
          value: "0"
        }).onConflictDoNothing();
        globalCount = 0;
      }
    } catch (error) {
      console.error("Error fetching global settings:", error);
      // If table doesn't exist, default to 0
      globalCount = 0;
    }

    // If user is authenticated, get their submission history
    let userSubmissionCount = 0;
    let isFirstSubmission = true;

    if (session?.user?.id) {
      try {
        const userSubmissions = await db
          .select()
          .from(userSubmissionTracking)
          .where(eq(userSubmissionTracking.userId, session.user.id));

        userSubmissionCount = userSubmissions.length;
        isFirstSubmission = userSubmissionCount === 0;
      } catch (error) {
        console.error("Error fetching user submissions:", error);
        // If table doesn't exist, default to first submission
        isFirstSubmission = true;
        userSubmissionCount = 0;
      }
    }

    return NextResponse.json({
      globalCount,
      userSubmissionCount,
      isFirstSubmission,
      isFreeEligible: globalCount < 100 || isFirstSubmission
    });
  } catch (error) {
    console.error("Error in stats endpoint:", error);
    // Return default values instead of error
    return NextResponse.json({
      globalCount: 0,
      userSubmissionCount: 0,
      isFirstSubmission: true,
      isFreeEligible: true
    });
  }
}