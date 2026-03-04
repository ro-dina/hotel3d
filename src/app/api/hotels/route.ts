import { NextResponse } from "next/server";
import { HOTELS } from "@/app/data/mockHotels";

export async function GET() {
  return NextResponse.json(HOTELS, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
