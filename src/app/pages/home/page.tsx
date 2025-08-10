"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Hotel } from "@/types/Hotel";
import { mockHotels } from "@/data/mockHotels";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function HomePage() {
  const searchParams = useSearchParams();
  const regionParam = searchParams.get("region") || "";
  const checkInParam = searchParams.get("checkIn") || "";
  const checkOutParam = searchParams.get("checkOut") || "";
  const guestsParam = searchParams.get("guests") || "";

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let filteredHotels = mockHotels;

    if (regionParam.trim() !== "") {
      const regionLower = regionParam.toLowerCase();
      filteredHotels = filteredHotels.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(regionLower) ||
          (hotel.region && hotel.region.toLowerCase().includes(regionLower))
      );
    }

    setHotels(filteredHotels);
    setLoading(false);
  }, [regionParam]);

  const hasFilters =
    regionParam.trim() !== "" ||
    checkInParam.trim() !== "" ||
    checkOutParam.trim() !== "" ||
    guestsParam.trim() !== "";

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">{hasFilters ? "検索結果" : "ホテル一覧"}</h1>
      {hasFilters && (
        <p className="mb-4 text-sm text-gray-700">
          {regionParam && <>地域: {regionParam} </>}
          {checkInParam && <>チェックイン: {checkInParam} </>}
          {checkOutParam && <>チェックアウト: {checkOutParam} </>}
          {guestsParam && <>ゲスト数: {guestsParam} </>}
        </p>
      )}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <ul className="space-y-4">
          {hotels.map((hotel) => (
            <li key={hotel.id} className="bg-white border p-4 rounded shadow flex gap-4 items-stretch">
              <Link href={`/unity/hotel1/index.html?id=${hotel.id}`} target="_blank">
                <Image
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  width={256}
                  height={192}
                  className="rounded object-cover h-full cursor-pointer"
                />
              </Link>
              <div className="flex-1 text-right">
                <h2 className="text-xl font-semibold text-gray-900">{hotel.name}</h2>
                <p className="text-gray-900">{hotel.description}</p>
                <p className="text-gray-900">料金: {hotel.price.toLocaleString()}円</p>
                <p className={hotel.available ? "text-green-600" : "text-red-600"}>
                  {hotel.available ? "空室あり" : "満室"}
                </p>
                <div className="mt-2 flex gap-4 justify-end">
                  <Link href={`/reserve/${hotel.id}`} className="text-blue-500 underline">
                    予約する
                  </Link>
                  <Link href={`/unity/hotel1/index.html?id=${hotel.id}`} className = "text-blue-500" target="_blank">
                    3Dで見る
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}