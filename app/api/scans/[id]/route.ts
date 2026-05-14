import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Stateless mode is enabled. Individual scans are available only in the browser session that created them.",
    },
    { status: 410 },
  );
}
