import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { globalSettings, userSubmissionTracking } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Query global settings for total submissions count
    const globalSubmissionsResult = await db.select()
      .from(globalSettings)
      .where(eq(globalSettings.settingKey, 'total_submissions_count'))
      .limit(1);

    const globalSubmissionsCount = globalSubmissionsResult.length > 0 
      ? parseInt(globalSubmissionsResult[0].settingValue) 
      : 0;

    // Query global settings for free submission threshold
    const thresholdResult = await db.select()
      .from(globalSettings)
      .where(eq(globalSettings.settingKey, 'free_submission_threshold'))
      .limit(1);

    const freeSubmissionThreshold = thresholdResult.length > 0 
      ? parseInt(thresholdResult[0].settingValue) 
      : 100;

    // Query user submission tracking
    const userTrackingResult = await db.select()
      .from(userSubmissionTracking)
      .where(eq(userSubmissionTracking.userId, userId))
      .limit(1);

    // Handle case where user has no tracking record
    const userFirstSubmissionUsed = userTrackingResult.length > 0 
      ? userTrackingResult[0].firstSubmissionFreeUsed 
      : false;

    const userTotalSubmissions = userTrackingResult.length > 0 
      ? userTrackingResult[0].totalSubmissionsCount 
      : 0;

    // Calculate if user can submit for free
    let userCanSubmitFree = false;
    
    if (globalSubmissionsCount < freeSubmissionThreshold) {
      // Global count is below threshold - anyone can submit free
      userCanSubmitFree = true;
    } else if (globalSubmissionsCount >= freeSubmissionThreshold && !userFirstSubmissionUsed) {
      // Global count reached threshold but user hasn't used their first free submission
      userCanSubmitFree = true;
    }

    // Return submission status
    return NextResponse.json({
      global_submissions_count: globalSubmissionsCount,
      free_submission_threshold: freeSubmissionThreshold,
      user_first_submission_used: userFirstSubmissionUsed,
      user_total_submissions: userTotalSubmissions,
      user_can_submit_free: userCanSubmitFree
    }, { status: 200 });

  } catch (error) {
    console.error('GET submission status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}