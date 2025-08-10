// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react";
import Link from "next/link";

type Region =
  | "東京"
  | "大阪"
  | "京都"
  | "札幌"
  | "福岡"
  | "那覇"
  | "その他";

export default function HomePage() {
  const [region, setRegion] = useState<Region>("東京");
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const router = useRouter();
  
  // マウント時に localStorage から復元
  useEffect(() => {
    const savedCheckIn = localStorage.getItem("checkIn");
    const savedCheckOut = localStorage.getItem("checkOut");
    if (savedCheckIn) setCheckIn(savedCheckIn);
    if (savedCheckOut) setCheckOut(savedCheckOut);
  }, []);

  // 値が変わったら localStorage に保存
  useEffect(() => {
    if (checkIn) localStorage.setItem("checkIn", checkIn);
  }, [checkIn]);

  useEffect(() => {
    if (checkOut) localStorage.setItem("checkOut", checkOut);
  }, [checkOut]);

  const handleSearch = () => {
    if (!canSearch) return;
    const params = new URLSearchParams({
      region,
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/pages/home?${params.toString()}`);
  };

  const canSearch =
    region !== undefined &&
    checkIn !== "" &&
    checkOut !== "" &&
    new Date(checkIn) <= new Date(checkOut) &&
    guests > 0;

  return (
    <main className="min-h-screen bg-gray-100">
      {/* ヒーロー（大きめヘッダー） */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ホテルを検索</h1>
          <p className="text-gray-600 mt-1">
            地域・日付・人数を選んで検索できます
          </p>

          {/* 検索フォーム */}
          <div className="mt-6 bg-white border rounded-xl shadow p-4 sm:p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="grid grid-cols-1 md:grid-cols-5 gap-4"
            >
              {/* 地域 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地域
                </label>
                <select
                  className="w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                >
                  {["東京", "大阪", "京都", "札幌", "福岡", "那覇", "その他"].map(
                    (r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* チェックイン */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  チェックイン
                </label>
                <input
                  type="date"
                  className="w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              {/* チェックアウト */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  チェックアウト
                </label>
                <input
                  type="date"
                  className="w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || undefined}
                />
              </div>

              {/* 人数 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  人数
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </div>

              {/* 検索ボタン（右寄せの送信ボタン） */}
              <div className="md:col-span-5 flex justify-end">
                <button
                  type="submit"
                  disabled={!canSearch}
                  className={`px-6 py-3 rounded-lg text-white font-semibold ${
                    canSearch ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
                  }`}
                  aria-disabled={!canSearch}
                >
                  検索
                </button>
              </div>
            </form>

            {/* 3Dで見る（デモ用） */}
            <div className="mt-4 text-right">
              <Link
                href={{
                  pathname: "/unity/hotel1/index.html",
                  query: { id: "1" },
                }}
                target="_blank"
                className="inline-block text-indigo-600 hover:underline"
              >
                3Dで見る（デモ）
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* クーポンなど（ダミー） */}
      <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">お得なクーポン</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border rounded-xl shadow p-4 flex flex-col"
            >
              <div className="text-sm text-gray-500">クーポン {i}</div>
              <div className="text-2xl font-bold mt-1 text-gray-900">¥{(i * 500).toLocaleString()} OFF</div>
              <p className="text-gray-600 mt-2 text-sm">
                宿泊料金から割引されます。適用条件あり（ダミー）。
              </p>
              <button className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                取得する
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 人気エリア（ダミー） */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">人気のエリア</h2>
        <div className="flex flex-wrap gap-2">
          {["新宿", "渋谷", "なんば", "祇園", "大通公園", "天神"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-white border text-gray-700 hover:bg-gray-50"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}