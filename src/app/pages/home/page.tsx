"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// ホテル型定義
interface Hotel {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch("/api/hotels");
        const data = await res.json();
        setHotels(data);
      } catch (error) {
        console.error("ホテルの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">ホテル一覧</h1>
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <ul className="space-y-4">
          {hotels.map((hotel) => (
            <li key={hotel.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{hotel.name}</h2>
              <p>{hotel.description}</p>
              <p>料金: {hotel.price.toLocaleString()}円</p>
              <p className={hotel.available ? "text-green-600" : "text-red-600"}>
                {hotel.available ? "空室あり" : "満室"}
              </p>
              <div className="mt-2 flex gap-4">
                <Link href={`/reserve/${hotel.id}`} className="text-blue-500 underline">
                  予約する
                </Link>
                <Link href={`/view3d/${hotel.id}`} className="text-purple-500 underline">
                  3Dで見る
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}