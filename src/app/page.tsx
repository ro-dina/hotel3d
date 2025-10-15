"use client";
import Image from "next/image";
import { Suspense, useMemo, useState } from "react";
import { HOTELS } from "@/data/mockHotels";
import MapPanel from "./components/MapPanel";

export default function HomePage() {
  const [region, setRegion] = useState<string | null>(null);
  const hotels = useMemo(
    () => HOTELS.filter(h => !region || h.region === region),
    [region]
  );

  return (
    <div className="grid lg:grid-cols-[2fr_3fr] gap-4">
      <Suspense fallback={<div className="bg-white border rounded-lg p-4">地図を読み込み中...</div>}>
        <MapPanel value={region} onPick={setRegion} />
      </Suspense>

      <section className="bg-white border rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-3">
          {region ? `${region}のホテル` : "すべてのホテル"}
        </h2>
        <ul className="grid md:grid-cols-2 gap-4">
          {hotels.map(h => (
            <li key={h.id} className="border rounded-lg overflow-hidden bg-white">
              <Image
                src={h.imageUrl}
                alt={h.name}
                width={600}
                height={400}
                className="w-full h-40 object-cover"
                unoptimized
              />
              <div className="p-3">
                <div className="font-semibold">{h.name}</div>
                <div className="text-sm text-gray-600">{h.region}・{h.pref ?? ""}</div>
                <div className="mt-1 text-lg font-bold">¥{h.price.toLocaleString()}</div>
                <div className="mt-2 flex gap-2 text-sm">
                  <a href={`/hotel/${h.id}`} className="underline">詳細</a>
                  <a href={`/view3d/${h.id}`} className="underline">3Dを見る</a>
                  <a href={`/reserve/${h.id}`} className="underline">予約へ</a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}