// src/app/hotel/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { mockHotels } from "@/data/mockHotels";
import { Hotel } from "@/types/Hotel";

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const hotel: Hotel | undefined = mockHotels.find(h => String(h.id) === String(id));
  if (!hotel) {
    return (
      <main className="max-w-5xl mx-auto p-4">
        <p className="text-gray-700">ホテルが見つかりませんでした。</p>
        <button onClick={() => router.back()} className="mt-2 underline text-blue-600">戻る</button>
      </main>
    );
  }

  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto p-4">
        {/* パンくず / 戻る */}
        <div className="text-sm text-gray-600 mb-3">
          <button onClick={() => router.back()} className="hover:underline">← 検索結果に戻る</button>
        </div>

        {/* ヘッダー */}
        <div className="bg-white border rounded-xl shadow p-4">
          <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
          <div className="mt-1 text-gray-700">地域：{hotel.region}</div>

          {/* 画像 */}
          <div className="mt-4">
            <Image
              src={hotel.imageUrl}
              alt={hotel.name}
              width={1200}
              height={700}
              className="w-full max-h-[420px] object-cover rounded-lg"
              priority
            />
          </div>

          {/* 概要 & 価格・アクション */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900">概要</h2>
              <p className="mt-2 text-gray-800 leading-relaxed">{hotel.description}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {hotel.type && (
                  <span className="inline-block px-2 py-1 rounded bg-gray-100 border">
                    種別：{hotel.type === "hotel" ? "ホテル" : "民泊"}
                  </span>
                )}
                {typeof hotel.breakfast === "boolean" && (
                  <span className="inline-block px-2 py-1 rounded bg-gray-100 border">
                    朝食：{hotel.breakfast ? "あり" : "なし"}
                  </span>
                )}
                <span
                  className={`inline-block px-2 py-1 rounded border ${
                    hotel.available
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {hotel.available ? "空室あり" : "満室"}
                </span>
              </div>
            </div>

            <aside className="md:col-span-1">
              <div className="border rounded-xl p-4 bg-gray-50">
                <div className="text-sm text-gray-600">料金（税込）</div>
                <div className="text-3xl font-bold text-gray-900">
                  ¥{hotel.price.toLocaleString()}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href={`/reserve/${hotel.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    予約に進む
                  </Link>
                  <Link
                    href={`/unity/hotel1/index.html?id=${hotel.id}`}
                    target="_blank"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    3Dで見る
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* 追加情報（ダミー） */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-900">設備・サービス</h3>
            <ul className="mt-2 text-gray-800 list-disc pl-5 space-y-1 text-sm">
              <li>無料Wi-Fi</li>
              <li>バリアフリー対応（車椅子可動域チェックに対応予定）</li>
              <li>24時間フロント</li>
            </ul>
          </div>
          <div className="bg-white border rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-900">アクセス</h3>
            <p className="mt-2 text-gray-800 text-sm">最寄り駅から徒歩◯分（ダミー）</p>
          </div>
        </div>
      </div>
    </main>
  );
}