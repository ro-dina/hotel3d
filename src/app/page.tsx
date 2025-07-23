"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Hotel } from "@/types/Hotel";
import { mockHotels } from "@/data/mockHotels";
import Image from "next/image";


export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHotels(mockHotels);
    setLoading(false);
  }, []);

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">ホテル一覧</h1>
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <ul className="space-y-4">
          {hotels.map((hotel) => (
            <li key={hotel.id} className="bg-white border p-4 rounded shadow flex gap-4 items-stretch">
              <Link href={`/view3d/${hotel.id}`}>
                <Image
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  width={256}
                  height={192}
                  className="rounded object-cover h-full cursor-pointer"
                />
              </Link>
              <div className="flex-1 text-right">
                <h2 className="text-xl font-semibold">{hotel.name}</h2>
                <p>{hotel.description}</p>
                <p>料金: {hotel.price.toLocaleString()}円</p>
                <p className={hotel.available ? "text-green-600" : "text-red-600"}>
                  {hotel.available ? "空室あり" : "満室"}
                </p>
                <div className="mt-2 flex gap-4 justify-end">
                  <Link href={`/reserve/${hotel.id}`} className="text-blue-500 underline">
                    予約する
                  </Link>
                  <Link href={`/view3d/${hotel.id}`} className="text-purple-500 underline">
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