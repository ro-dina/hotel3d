import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.LLM_BASE_URL; // 例: https://xxxxx.trycloudflare.com
  const token = process.env.LLM_TOKEN;   // 例: 長いランダム文字列

  if (!base || !token) {
    return NextResponse.json(
      { error: "Server is not configured: missing LLM_BASE_URL or LLM_TOKEN" },
      { status: 500 }
    );
  }

  const body = await req.text();

  const r = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body,
    // タイムアウト気味のときは Vercel の実行時間に注意（短期デモならOK）
  });

  const text = await r.text();

  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}