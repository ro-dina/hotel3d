"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReservationDraft } from "@/types/Hotel";

const DRAFT_KEY = "reservation:draft";
const HISTORY_KEY = "reservation:history";

export default function CheckoutPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<ReservationDraft | null>(null);
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) setDraft(JSON.parse(saved));
  }, []);

  const canPay = draft && card.number.length >= 12 && card.name && card.exp && card.cvc.length >= 3;

  const pay = () => {
    if (!draft) return;
    // ダミー予約番号（yyyymmddHHMM + 乱数）
    const stamp = new Date();
    const id =
      `${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, "0")}${String(stamp.getDate()).padStart(2, "0")}` +
      `${String(stamp.getHours()).padStart(2, "0")}${String(stamp.getMinutes()).padStart(2, "0")}` +
      `-${Math.floor(Math.random() * 10000)}`;

    // 履歴へ保存
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    history.push({ ...draft, reservationId: id, createdAt: new Date().toISOString() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    // 下準備としてドラフトは残してもいいが、ここではクリア
    localStorage.removeItem(DRAFT_KEY);

    router.push(`/confirm?rid=${encodeURIComponent(id)}`);
  };

  if (!draft) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <p>予約情報が見つかりませんでした。最初からやり直してください。</p>
        <button onClick={() => router.push("/")} className="underline text-blue-600 mt-2">トップへ</button>
      </main>
    );
  }

  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">お支払い（ダミー）</h1>

        <div className="bg-white border rounded-xl p-4 shadow">
          <div className="text-gray-700 text-sm">お支払い合計</div>
          <div className="text-3xl font-bold">¥{draft.price.toLocaleString()}</div>
          <div className="mt-2 text-sm text-gray-600">
            {draft.hotelName} / {draft.checkIn} → {draft.checkOut} / {draft.guests}名
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow space-y-3">
          <div>
            <label className="block text-sm font-medium">カード番号</label>
            <input
              className="mt-1 w-full rounded border-gray-300"
              placeholder="4242 4242 4242 4242"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">名義</label>
            <input
              className="mt-1 w-full rounded border-gray-300"
              placeholder="TARO YAMADA"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">有効期限</label>
              <input
                className="mt-1 w-full rounded border-gray-300"
                placeholder="12/29"
                value={card.exp}
                onChange={(e) => setCard({ ...card, exp: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">CVC</label>
              <input
                className="mt-1 w-full rounded border-gray-300"
                placeholder="123"
                value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={pay}
            disabled={!canPay}
            className={`w-full mt-2 px-4 py-3 rounded-lg text-white font-semibold ${
              canPay ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            支払う（ダミー）
          </button>
        </div>
      </div>
    </main>
  );
}