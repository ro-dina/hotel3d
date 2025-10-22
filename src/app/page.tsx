"use client";
import Image from "next/image";
import { Suspense, useMemo, useState } from "react";
import { HOTELS } from "@/data/mockHotels";
import MapPanel from "./components/MapPanel";
import { useEffect } from "react";



const PREF_TO_REGION: Record<string, string> = {
  "北海道": "北海道",
  "青森県": "東北", "岩手県": "東北", "宮城県": "東北", "秋田県": "東北", "山形県": "東北", "福島県": "東北",
  "茨城県": "関東", "栃木県": "関東", "群馬県": "関東", "埼玉県": "関東", "千葉県": "関東", "東京都": "関東", "神奈川県": "関東",
  "新潟県": "中部", "富山県": "中部", "石川県": "中部", "福井県": "中部", "山梨県": "中部", "長野県": "中部", "岐阜県": "中部",
  "静岡県": "中部", "愛知県": "中部",
  "三重県": "近畿", "滋賀県": "近畿", "京都府": "近畿", "大阪府": "近畿", "兵庫県": "近畿", "奈良県": "近畿", "和歌山県": "近畿",
  "鳥取県": "中国", "島根県": "中国", "岡山県": "中国", "広島県": "中国", "山口県": "中国",
  "徳島県": "四国", "香川県": "四国", "愛媛県": "四国", "高知県": "四国",
  "福岡県": "九州", "佐賀県": "九州", "長崎県": "九州", "熊本県": "九州", "大分県": "九州", "宮崎県": "九州", "鹿児島県": "九州",
  "沖縄県": "沖縄" // データ側の地域名に合わせて
};

export default function HomePage() {
  const [region, setRegion] = useState<string | null>(null);
  const [lockScroll, setLockScroll] = useState(false);

  useEffect(() => {
    if (!lockScroll) return;

    const prevent = (e: WheelEvent | TouchEvent) => {
      e.preventDefault();
    };
    const preventKeys = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || el?.isContentEditable) return;
      const keys = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);
      if (keys.has(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", prevent, { passive: false, capture: true });
    window.addEventListener("touchmove", prevent, { passive: false, capture: true });
    window.addEventListener("keydown", preventKeys, { capture: true });

    return () => {
      window.removeEventListener("wheel", prevent, { capture: true });
      window.removeEventListener("touchmove", prevent, { capture: true });
      window.removeEventListener("keydown", preventKeys, { capture: true });
    };
  }, [lockScroll]);
  const hotels = useMemo(
    () => HOTELS.filter(h => !region || h.region === region),
    [region]
  );

  return (
    <div className="grid lg:grid-cols-[2fr_3fr] gap-4">
      <aside className = "order-first lg:order-none lg:sticky lg:top-4 h-[60vh] lg:h-[calc(100vh-2rem)]">
        <Suspense fallback={<div className="bg-white border rounded-lg p-4">地図を読み込み中...</div>}>
          <div
            className="h-full bg-white border rounded-lg shadow overflow-hidden
                      touch-none overscroll-contain select-none"
            onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onPointerEnter={() => setLockScroll(true)}
            onPointerLeave={() => setLockScroll(false)}
            >
            <MapPanel
              value={region}
              onPick={setRegion}
              onPickPref={(pref) => setRegion(pref ? (PREF_TO_REGION[pref] ?? pref) : null)}
              maxZoom={500}
              thresholds={{
                regionsToPrefUp: 10.0,
                regionsToPrefDown: 10.3,
                prefToJapanUp: 60,
                prefToJapanDown: 40,
              }}
            />
          </div>
        </Suspense>
      </aside>


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