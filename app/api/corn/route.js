import { runCryptoScan, formatTelegramMessage, sendTelegramMessage } from "@/lib/scanner";
import { NextResponse } from "next/server";

let scanCount = 0;
export const maxDuration = 120;

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    scanCount += 1;
    const coins = await runCryptoScan();
    const message = formatTelegramMessage(coins, scanCount);
    await sendTelegramMessage(message);

    global._lastScan = {
      id: scanCount,
      timestamp: new Date().toISOString(),
      coins,
    };

    return NextResponse.json({ success: true, coinsFound: coins.length });
  } catch (err) {
    try {
      await sendTelegramMessage(`⚠️ *ALPHABOT Error*\nScan failed: \`${err.message}\``);
    } catch (_) {}
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
