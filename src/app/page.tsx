"use client";

import Image from "next/image";
import FallbackImage from "./components/FallbackImage";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useState } from "react";
import { HOTELS } from "@/app/data/mockHotels";

const MapPanel = dynamic(() => import("./components/MapPanel.client"), {
  ssr: false,
});

const PREF_TO_REGION: Record<string, string> = {
  北海道: "北海道",
  青森県: "東北",
  岩手県: "東北",
  宮城県: "東北",
  秋田県: "東北",
  山形県: "東北",
  福島県: "東北",
  茨城県: "関東",
  栃木県: "関東",
  群馬県: "関東",
  埼玉県: "関東",
  千葉県: "関東",
  東京都: "関東",
  神奈川県: "関東",
  新潟県: "中部",
  富山県: "中部",
  石川県: "中部",
  福井県: "中部",
  山梨県: "中部",
  長野県: "中部",
  岐阜県: "中部",
  静岡県: "中部",
  愛知県: "中部",
  三重県: "近畿",
  滋賀県: "近畿",
  京都府: "近畿",
  大阪府: "近畿",
  兵庫県: "近畿",
  奈良県: "近畿",
  和歌山県: "近畿",
  鳥取県: "中国",
  島根県: "中国",
  岡山県: "中国",
  広島県: "中国",
  山口県: "中国",
  徳島県: "四国",
  香川県: "四国",
  愛媛県: "四国",
  高知県: "四国",
  福岡県: "九州",
  佐賀県: "九州",
  長崎県: "九州",
  熊本県: "九州",
  大分県: "九州",
  宮崎県: "九州",
  鹿児島県: "九州",
  沖縄県: "沖縄",
};

export default function HomePage() {
  const [region, setRegion] = useState<string | null>(null);
  const [prefecture, setPrefecture] = useState<string | null>(null);

  // ホテル価格の最小・最大を算出
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = HOTELS.map((h) => Number(h.price)).filter(
      (p) => !Number.isNaN(p)
    );
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    return { minPrice: min, maxPrice: max };
  }, []);

  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  // デュアルハンドルの操作中ハンドル管理
  const [activeHandle, setActiveHandle] = useState<"min" | "max" | null>(null);

  useEffect(() => {
    if (priceMin === null) setPriceMin(minPrice);
    if (priceMax === null) setPriceMax(maxPrice);
  }, [minPrice, maxPrice]);

  const hotels = useMemo(() => {
    const normalize = (s: string | null | undefined) => {
      if (!s) return null;
      const v = String(s).trim();
      // 都・府・県の末尾を取り除いて比較（北海道の「道」は残す）
      return v.replace(/(都|府|県)$/, "");
    };

    const selPrefNorm = normalize(prefecture);
    const base = selPrefNorm
      ? HOTELS.filter((hotel) => {
          const hNorm = normalize(hotel.pref);
          return hNorm === selPrefNorm;
        })
      : region
      ? HOTELS.filter((hotel) => hotel.region === region)
      : HOTELS;

    if (priceMin != null && priceMax != null) {
      return base.filter((h) => h.price >= priceMin && h.price <= priceMax);
    }

    return base;
  }, [region, prefecture, priceMin, priceMax]);

  // 開発時のみ: id 重複を警告
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const counts = new Map<number, number>();
    for (const h of hotels) counts.set(h.id, (counts.get(h.id) ?? 0) + 1);
    const dups = Array.from(counts.entries())
      .filter(([, c]) => c > 1)
      .map(([id]) => id);
    if (dups.length) {
      console.warn("[HomePage] Duplicate hotel ids detected:", dups);
    }
  }, [hotels]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      <div className="h-screen w-full grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
        <div className="relative h-[70vh] w-full lg:h-screen lg:sticky lg:top-0">
          <Suspense
            fallback={
              <div
                className="h-full w-full bg-gradient-to-b from-slate-950 via-sky-900 to-slate-900"
                aria-hidden="true"
              />
            }
          >
            <MapPanel
              value={prefecture ?? region}
              onPick={(regionName) => {
                setPrefecture(null);
                setRegion(regionName);
              }}
              onPickPref={(pref: string | null) => {
                setPrefecture(pref);
                if (pref) {
                  setRegion(PREF_TO_REGION[pref] ?? pref);
                } else {
                  setRegion(null);
                }
              }}
              maxZoom={20}
              panelClassName="absolute inset-0"
              mapWrapperClassName="absolute inset-0"
              mapStyle={{ width: "100%", height: "100%" }}
              showControls
            />
          </Suspense>
        </div>

        <div className="flex w-full flex-col overflow-y-auto bg-white/5 px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-1 flex-col gap-6">
            <section className="pointer-events-auto rounded-3xl border border-white/30 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/80">
                {(region || prefecture) && (
                  <button
                    type="button"
                    className="rounded-full border border-indigo-400/80 bg-indigo-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200"
                    onClick={() => {
                      setPrefecture(null);
                      setRegion(null);
                    }}
                  >
                    フィルタ解除
                  </button>
                )}
              </div>
            </section>

            <section className="pointer-events-auto rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[0_15px_45px_rgba(2,6,23,0.7)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                    {prefecture
                      ? `${prefecture}のホテル`
                      : region
                      ? `${region}のホテル`
                      : "全国の宿泊施設"}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">
                    {prefecture
                      ? `${prefecture}の宿泊施設一覧`
                      : region
                      ? `${region}の宿泊施設一覧`
                      : "選りすぐりの宿泊施設をチェック"}
                  </h2>
                </div>
                {(region || prefecture) && (
                  <button
                    type="button"
                    className="text-sm font-medium text-indigo-300 underline"
                    onClick={() => {
                      setPrefecture(null);
                      setRegion(null);
                    }}
                  >
                    クリア
                  </button>
                )}
              </div>

              {/* 価格範囲フィルタ（下限・上限の2つのつまみ） */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <div>価格下限: ¥{priceMin?.toLocaleString()}</div>
                  <div>価格上限: ¥{priceMax?.toLocaleString()}</div>
                </div>
                <div className="mt-2 space-y-2">
                  {/* デュアルハンドルを擬似的に実現：2つの range を重ねる */}
                  <div className="relative h-8">
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      step={1000}
                      value={priceMin ?? minPrice}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        const maxV = priceMax ?? maxPrice;
                        const newMin = Math.min(v, maxV);
                        setPriceMin(newMin);
                      }}
                      // 少し上下ずらして重なりを避け、両方操作可能にする
                      style={{ top: "0px" }}
                      className="absolute left-0 right-0 w-full appearance-none bg-transparent z-20"
                    />
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      step={1000}
                      value={priceMax ?? maxPrice}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        const minV = priceMin ?? minPrice;
                        const newMax = Math.max(v, minV);
                        setPriceMax(newMax);
                      }}
                      style={{ top: "12px" }}
                      className="absolute left-0 right-0 w-full appearance-none bg-transparent z-10"
                    />
                    {/* トラック */}
                    <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-slate-700 rounded" />
                    {/* 選択範囲ハイライト */}
                    <div
                      className="absolute top-1/2 h-1 -translate-y-1/2 bg-indigo-500 rounded"
                      style={{
                        left: `${
                          (((priceMin ?? minPrice) - minPrice) /
                            (maxPrice - minPrice)) *
                          100
                        }%`,
                        right: `${
                          100 -
                          (((priceMax ?? maxPrice) - minPrice) /
                            (maxPrice - minPrice)) *
                            100
                        }%`,
                      }}
                    />
                    {/* サム（見た目のみ） */}
                    <div
                      className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow -translate-y-1/2"
                      style={{
                        left: `${
                          (((priceMin ?? minPrice) - minPrice) /
                            (maxPrice - minPrice)) *
                          100
                        }%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                    <div
                      className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow -translate-y-1/2"
                      style={{
                        left: `${
                          (((priceMax ?? maxPrice) - minPrice) /
                            (maxPrice - minPrice)) *
                          100
                        }%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {hotels.map((hotel) => (
                  <li
                    key={`${hotel.id}-${hotel.name}`}
                    className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900/70 shadow-lg shadow-black/60 transition hover:shadow-white/30"
                  >
                    <FallbackImage
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      width={600}
                      height={400}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-4">
                      <div className="text-sm font-semibold text-white">
                        {hotel.name}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-white/60">
                        {hotel.region}・{hotel.pref ?? "所在地不明"}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        ¥{hotel.price.toLocaleString()}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/70">
                        <a className="underline" href={`/hotel/${hotel.id}`}>
                          詳細
                        </a>
                        <a className="underline" href={`/view3d/${hotel.id}`}>
                          3D
                        </a>
                        <a className="underline" href={`/reserve/${hotel.id}`}>
                          予約
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
