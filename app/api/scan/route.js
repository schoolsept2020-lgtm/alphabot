import { runCryptoScan, formatTelegramMessage, sendTelegramMessage } from "@/lib/scanner";
import { NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST() {
  try {
    const coins = await runCryptoScan();
    global._lastScan = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      coins,
    };
    try {
      const msg = formatTelegramMessage(coins, "MANUAL");
      await sendTelegramMessage(msg);
    } catch (_) {}
    return NextResponse.json({ success: true, coins, timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
