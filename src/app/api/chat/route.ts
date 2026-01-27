import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.LLM_BASE_URL; // https://xxxxx.trycloudflare.com
  const token = process.env.LLM_TOKEN;   // 長いランダム文字列

  if (!base || !token) {
    return NextResponse.json(
      { error: "Server is not configured: missing LLM_BASE_URL or LLM_TOKEN" },
      { status: 500 }
    );
  }

  const body = await req.text();

  // ★ここが重要：PC側の llm-gateway は /chat
  const r = await fetch(`${base}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
    cache: "no-store",
  });

  const text = await r.text();

  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}