"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function ConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();
  const rid = params.get("rid");

  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">予約が完了しました</h1>
        {rid ? (
          <>
            <p className="text-gray-800">
              予約番号：<span className="font-mono font-semibold">{rid}</span>
            </p>
            <p className="text-sm text-gray-600">
              確認メール（ダミー）は入力されたメールアドレス宛に送信された想定です。
            </p>
          </>
        ) : (
          <p>予約番号が見つかりませんでした。</p>
        )}
        <div className="flex gap-3">
          <button onClick={() => router.push("/")} className="px-4 py-2 rounded border">
            トップへ
          </button>
          <button onClick={() => router.push("/pages/home")} className="px-4 py-2 rounded border">
            ホテル検索に戻る
          </button>
        </div>
      </div>
    </main>
  );
}