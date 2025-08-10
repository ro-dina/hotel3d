"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { mockHotels } from "@/data/mockHotels";
import type { Hotel } from "@/types/Hotel";
import Image from "next/image";
import { ReservationDraft } from "@/types/Hotel";

const DRAFT_KEY = "reservation:draft";

export default function ReservePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const params = useSearchParams();

  // 検索画面からのクエリ（あれば初期値に使う）
  const checkInQ = params.get("checkIn") || "";
  const checkOutQ = params.get("checkOut") || "";
  const guestsQ = Number(params.get("guests") || 2);

  const hotel: Hotel | undefined = mockHotels.find(h => String(h.id) === String(id));

  const [form, setForm] = useState<ReservationDraft>({
    hotelId: Number(id),
    hotelName: hotel?.name ?? "",
    name: "",
    email: "",
    phone: "",
    checkIn: checkInQ,
    checkOut: checkOutQ,
    guests: guestsQ,
    price: hotel?.price ?? 0,
  });

  useEffect(() => {
    // ホテル切替時の安全策＆ドラフト復元（同じホテルなら復元）
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ReservationDraft;
        if (parsed.hotelId === Number(id)) setForm(parsed);
      } catch {}
    }
  }, [id]);

  if (!hotel) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p>ホテルが見つかりませんでした。</p>
        <button onClick={() => router.back()} className="underline text-blue-600 mt-2">戻る</button>
      </main>
    );
  }

  const canProceed =
    form.name.trim() &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.checkIn &&
    form.checkOut &&
    new Date(form.checkIn) <= new Date(form.checkOut) &&
    form.guests > 0;

  const saveDraftAndGoCheckout = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    router.push("/checkout");
  };

  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">予約情報の入力</h1>

        {/* ホテル要約 */}
        <div className="bg-white border rounded-xl p-4 shadow flex gap-4">
          <Image
            src={hotel.imageUrl}
            alt={hotel.name}
            width={200}
            height={140}
            className="rounded object-cover w-[200px] h-[140px]"
          />
          <div className="flex-1">
            <div className="text-lg font-semibold">{hotel.name}</div>
            <div className="text-sm text-gray-600 mt-1">{hotel.region}</div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">料金（税込）</span>
              <div className="text-2xl font-bold">¥{hotel.price.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* 入力フォーム */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canProceed) saveDraftAndGoCheckout();
          }}
          className="bg-white border rounded-xl p-4 shadow space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">氏名</label>
              <input
                className="mt-1 w-full rounded border-gray-300"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">メールアドレス</label>
              <input
                type="email"
                className="mt-1 w-full rounded border-gray-300"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">電話番号</label>
              <input
                className="mt-1 w-full rounded border-gray-300"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">人数</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded border-gray-300"
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: Number(e.target.value || 1) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">チェックイン</label>
              <input
                type="date"
                className="mt-1 w-full rounded border-gray-300 text-gray-900"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">チェックアウト</label>
              <input
                type="date"
                className="mt-1 w-full rounded border-gray-300 text-gray-900"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                min={form.checkIn || undefined}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canProceed}
              className={`px-6 py-3 rounded-lg text-white font-semibold ${
                canProceed ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              お支払いへ
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}