"use client";

import { useMemo, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM_HELP = `
あなたは、ホテル予約Webアプリの操作をサポートするナビゲーションAIです。
ユーザーの質問に対し、**簡潔な箇条書き**を用いて具体的な操作手順を案内してください。

## アプリの主要機能フロー
1. **ホテル一覧**: トップページからホテルを探す。
2. **予約（ダミー）**: 予約フォームに入力する（※実際には予約されず、料金も発生しません）。
3. **3D閲覧**: 予約完了後、Unity WebGLを用いてホテル内を3Dで自由に閲覧する。

## 回答のガイドライン
- **簡潔さ**: 挨拶や前置きは最小限にし、すぐに解決策を提示してください。
- **3D機能への言及**: 3Dが見られないという質問には、ブラウザの推奨環境（PC/Chrome推奨など）やロード時間について触れてください。
- **ダミー予約の強調**: 決済やキャンセルに関する質問には、「これはデモアプリであり、実際の金銭取引は発生しない」ことを明記してください。

## 回答例
ユーザー：「3Dで部屋を見たいです」
あなた：
以下の手順でご覧いただけます。
1. ホテル一覧から気になるホテルを選択してください。
2.「3Dビューで見る」ボタンをクリックすると、Unity WebGLが起動します。`;

// 送信する messages（system はサーバ側で足してもOK）
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "こんにちは！このサイトの使い方を案内できます。何をしたいですか？" },
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  async function send() {
    if (!canSend) return;
    const text = input.trim();
    setInput("");

    const next: Msg[] = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setBusy(true);

    try {
      // Ollama互換で投げやすいように messages を組み立て
      const payload = {
        messages: [
          { role: "system", content: SYSTEM_HELP },
          ...next.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ],
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }

      const data = (await res.json()) as { content?: string; message?: { content?: string } };

      // どっちでも受けられるように（ゲートウェイ側の返し方次第）
      const answer = data.content ?? data.message?.content ?? "(no content)";

      setMessages((prev) => [...prev, { role: "assistant" as const, content: answer }]);
      queueMicrotask(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: `エラー: ${String(e)}` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {open && (
        <div className="w-[320px] max-w-[90vw] h-[420px] max-h-[70vh] bg-white border rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="font-semibold">ヘルパー</div>
            <button
              className="text-sm px-2 py-1 rounded-lg border"
              onClick={() => setOpen(false)}
              aria-label="close"
            >
              閉じる
            </button>
          </div>

          <div className="flex-1 overflow-auto px-3 py-3 space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl px-3 py-2 bg-black text-white"
                      : "max-w-[85%] rounded-2xl px-3 py-2 bg-gray-100 text-gray-900"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={busy ? "応答中…" : "質問を入力"}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              disabled={busy}
            />
            <button
              className="px-3 py-2 rounded-xl bg-black text-white text-sm disabled:opacity-50"
              onClick={send}
              disabled={!canSend}
            >
              送信
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button
          className="w-14 h-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center"
          onClick={() => setOpen(true)}
          aria-label="open chat"
          title="ヘルプ"
        >
          ?
        </button>
      )}
    </div>
  );
}