"use client";

import { useMemo, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM_HELP = `
あなたはホテル予約Webアプリのヘルパーです。
このアプリは「ホテル一覧 → 予約(ダミー) → 3D(Unity WebGL)でホテルを閲覧」ができます。
ユーザーの質問に対して、操作手順を短く具体的に案内してください。
`;

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