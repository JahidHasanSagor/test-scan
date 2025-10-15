import { NextResponse } from "next/server";
import { runSecurityScan } from "@/lib/security/scanner";

export async function GET() {
  try {
    const scanResult = await runSecurityScan();
    
    return NextResponse.json(scanResult);
  } catch (error) {
    console.error("Security scan error:", error);
    return NextResponse.json(
      { error: "Failed to run security scan" },
      { status: 500 }
    );
  }
}