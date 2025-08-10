"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Hotel } from "@/types/Hotel";
import { mockHotels } from "@/data/mockHotels";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const regionParam = searchParams.get("region") || "";
  const checkInParam = searchParams.get("checkIn") || "";
  const checkOutParam = searchParams.get("checkOut") || "";
  const guestsParam = searchParams.get("guests") || "";

  // ==== Filters (左サイドバー) ====
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  // optional fields: type（"hotel" | "minpaku" など） / breakfast（true/false）
  const [typeFilter, setTypeFilter] = useState<"" | "hotel" | "minpaku">("");
  const [breakfast, setBreakfast] = useState<"" | "yes" | "no">("");

  const hasFilters =
    regionParam.trim() !== "" ||
    checkInParam.trim() !== "" ||
    checkOutParam.trim() !== "" ||
    guestsParam.trim() !== "" ||
    priceMin !== "" ||
    priceMax !== "" ||
    onlyAvailable ||
    typeFilter !== "" ||
    breakfast !== "";

  const filteredHotels: Hotel[] = useMemo(() => {
    let list = mockHotels;

    // 地域フィルタ
    if (regionParam.trim() !== "") {
      const regionLower = regionParam.toLowerCase();
      list = list.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(regionLower) ||
          (hotel.region && hotel.region.toLowerCase().includes(regionLower))
      );
    }

    // 価格
    list = list.filter((h) => {
      const okMin = priceMin === "" ? true : h.price >= Number(priceMin);
      const okMax = priceMax === "" ? true : h.price <= Number(priceMax);
      return okMin && okMax;
    });

    // 空室のみ
    if (onlyAvailable) {
      list = list.filter((h) => h.available);
    }

    // 種別（mockに type がある場合のみ適用）
    if (typeFilter !== "") {
      list = list.filter((h) => (h.type ? h.type === typeFilter : true));
    }

    // 朝食有無（mockに breakfast がある場合のみ適用）
    if (breakfast === "yes") {
      list = list.filter((h) => h.breakfast === true);
    } else if (breakfast === "no") {
      list = list.filter((h) => h.breakfast === false);
    }

    return list;
  }, [regionParam, priceMin, priceMax, onlyAvailable, typeFilter, breakfast]);

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          {hasFilters ? "検索結果" : "ホテル一覧"}
        </h1>

        {/* フィルタの概要 */}
        {hasFilters && (
          <p className="mb-4 text-sm text-gray-700">
            {regionParam && <>地域: {regionParam} </>}
            {checkInParam && <>チェックイン: {checkInParam} </>}
            {checkOutParam && <>チェックアウト: {checkOutParam} </>}
            {guestsParam && <>ゲスト数: {guestsParam} </>}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* ===== 左：フィルタ ===== */}
          <aside className="md:col-span-3">
            <div className="bg-white rounded-xl shadow border p-4 space-y-4">
              <h2 className="text-lg font-semibold">絞り込み</h2>

              {/* 価格 */}
              <div>
                <div className="text-sm text-gray-700 font-medium mb-1">価格（円）</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="最小"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded border-gray-300"
                    min={0}
                  />
                  <span className="text-gray-500">~</span>
                  <input
                    type="number"
                    placeholder="最大"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded border-gray-300"
                    min={0}
                  />
                </div>
              </div>

              {/* 空室のみ */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                />
                <span className="text-sm text-gray-700">空室のみ</span>
              </label>

              {/* 種別（mockに type があれば適用） */}
              <div>
                <div className="text-sm text-gray-700 font-medium mb-1">種別</div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as "" | "hotel" | "minpaku")}
                  className="w-full rounded border-gray-300"
                >
                  <option value="">指定なし</option>
                  <option value="hotel">ホテル</option>
                  <option value="minpaku">民泊</option>
                </select>
              </div>

              {/* 朝食 */}
              <div>
                <div className="text-sm text-gray-700 font-medium mb-1">朝食</div>
                <select
                  value={breakfast}
                  onChange={(e) => setBreakfast(e.target.value as "" | "yes" | "no")}
                  className="w-full rounded border-gray-300"
                >
                  <option value="">指定なし</option>
                  <option value="yes">あり</option>
                  <option value="no">なし</option>
                </select>
              </div>

              {/* クリア */}
              <button
                type="button"
                onClick={() => {
                  setPriceMin("");
                  setPriceMax("");
                  setOnlyAvailable(false);
                  setTypeFilter("");
                  setBreakfast("");
                }}
                className="w-full mt-2 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                フィルタをクリア
              </button>
            </div>
          </aside>

          {/* ===== 右：検索結果 ===== */}
          <section className="md:col-span-9">
            {filteredHotels.length === 0 ? (
              <p className="text-gray-700">該当するホテルがありません。</p>
            ) : (
              <ul className="space-y-4">
                {filteredHotels.map((hotel) => (
                  <li
                    key={hotel.id}
                    className="bg-white border rounded-xl shadow p-4 cursor-pointer"
                    onClick={() => router.push(`/hotel/${hotel.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") router.push(`/hotel/${hotel.id}`);
                    }}
                  >
                    {/* 3列グリッド：画像 / 情報 / 価格＋アクション */}
                    <div className="grid grid-cols-12 gap-4 items-stretch">
                      {/* 画像（左） */}
                      <div className="col-span-12 sm:col-span-4">
                        <Image
                          src={hotel.imageUrl}
                          alt={hotel.name}
                          width={640}
                          height={480}
                          className="w-full h-full max-h-48 object-cover rounded"
                        />
                      </div>

                      {/* 情報（中央） */}
                      <div className="col-span-12 sm:col-span-5 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                        <p className="text-sm text-gray-700 mt-1 flex-1">{hotel.description}</p>

                        <div className="mt-2 text-xs text-gray-600 space-x-2">
                          <span className="inline-block px-2 py-1 rounded bg-gray-100 border">
                            地域: {hotel.region}
                          </span>
                          {hotel.type && (
                            <span className="inline-block px-2 py-1 rounded bg-gray-100 border">
                              種別: {hotel.type === "hotel" ? "ホテル" : "民泊"}
                            </span>
                          )}
                          {typeof hotel.breakfast === "boolean" && (
                            <span className="inline-block px-2 py-1 rounded bg-gray-100 border">
                              朝食: {hotel.breakfast ? "あり" : "なし"}
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

                      {/* 価格＋アクション（右） */}
                      <div className="col-span-12 sm:col-span-3 flex flex-col justify-between items-end">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">料金（税込）</div>
                          <div className="text-2xl font-bold text-gray-900">
                            ¥{hotel.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Link
                            href={`/reserve/${hotel.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            予約する
                          </Link>
                          <Link
                            href={`/unity/hotel1/index.html?id=${hotel.id}`}
                            target="_blank"
                            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            3Dで見る
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}