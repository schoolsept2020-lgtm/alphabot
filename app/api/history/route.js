import { NextResponse } from "next/server";

export async function GET() {
  const last = global._lastScan || null;
  return NextResponse.json({ lastScan: last });
}
