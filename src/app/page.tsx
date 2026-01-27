"use client";

import Image from "next/image";
import FallbackImage from "./components/FallbackImage";
import dynamic from "next/dynamic";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
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
  const [focusedHotelId, setFocusedHotelId] = useState<number | null>(null);
  const [focusLocation, setFocusLocation] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  const [useMapBounds, setUseMapBounds] = useState(false);

  // リサイズ制御
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startLeftRef = useRef(0);
  const [leftWidth, setLeftWidth] = useState<number | null>(null);
  const [isLarge, setIsLarge] = useState(false);

  // 一覧の幅に応じたカラム数制御
  const listRef = useRef<HTMLUListElement | null>(null);
  const [listWidth, setListWidth] = useState<number>(0);
  const cardMinWidth = 160; // 1枚あたりの理想的な最小幅
  const columns = Math.max(1, Math.floor(listWidth / cardMinWidth));

  useEffect(() => {
    const check = () => setIsLarge(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isLarge) return;
    // 初期幅を設定（ビュー幅の60%）
    if (leftWidth === null) {
      setLeftWidth(Math.round(window.innerWidth * 0.6));
    }
  }, [isLarge, leftWidth]);

  // ResizeObserver で一覧コンテナの幅を監視
  useEffect(() => {
    if (!listRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setListWidth(w);
      }
    });
    ro.observe(listRef.current as Element);
    return () => ro.disconnect();
  }, [isLarge, leftWidth]);

  const onMove = useCallback((clientX: number) => {
    if (!draggingRef.current || !containerRef.current) return;
    const dx = clientX - startXRef.current;
    const newLeft = startLeftRef.current + dx;
    const min = 320; // 最小幅
    const max = Math.max(480, window.innerWidth - 320);
    const clamped = Math.max(min, Math.min(max, newLeft));
    setLeftWidth(clamped);
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => onMove(e.clientX),
    [onMove]
  );
  const onTouchMove = useCallback(
    (e: TouchEvent) => onMove(e.touches[0].clientX),
    [onMove]
  );

  useEffect(() => {
    const onUp = () => {
      if (draggingRef.current) draggingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
    return () => onUp();
  }, [onMouseMove, onTouchMove]);

  const startDrag = (clientX: number) => {
    draggingRef.current = true;
    startXRef.current = clientX;
    startLeftRef.current = leftWidth ?? Math.round(window.innerWidth * 0.6);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener(
      "mouseup",
      () => {
        draggingRef.current = false;
        window.removeEventListener("mousemove", onMouseMove);
      },
      { once: true }
    );
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener(
      "touchend",
      () => {
        draggingRef.current = false;
        window.removeEventListener("touchmove", onTouchMove);
      },
      { once: true }
    );
  };

  const onHandleMouseDown = (e: React.MouseEvent) => startDrag(e.clientX);
  const onHandleTouchStart = (e: React.TouchEvent) =>
    startDrag(e.touches[0].clientX);

  // ホテルデータ処理
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
  const [onlyBreakfast, setOnlyBreakfast] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("");
  useEffect(() => {
    if (priceMin === null) setPriceMin(minPrice);
    if (priceMax === null) setPriceMax(maxPrice);
  }, [minPrice, maxPrice]);

  const hotels = useMemo(() => {
    const normalize = (s: string | null | undefined) => {
      if (!s) return null;
      const v = String(s).trim();
      return v.replace(/(都|府|県)$/, "");
    };

    const selPrefNorm = normalize(prefecture);
    let base = selPrefNorm
      ? HOTELS.filter((hotel) => {
          const hNorm = normalize(hotel.pref);
          return hNorm === selPrefNorm;
        })
      : region
      ? HOTELS.filter((hotel) => hotel.region === region)
      : HOTELS;

    if (priceMin != null && priceMax != null) {
      base = base.filter((h) => h.price >= priceMin && h.price <= priceMax);
    }

    if (onlyBreakfast) {
      base = base.filter((h) => h.breakfast);
    }

    if (typeFilter) {
      base = base.filter((h) => h.type === typeFilter);
    }

    if (useMapBounds && mapBounds) {
      base = base.filter(
        (h) =>
          h.lat <= mapBounds.north &&
          h.lat >= mapBounds.south &&
          h.lng <= mapBounds.east &&
          h.lng >= mapBounds.west
      );
    }

    return base;
  }, [
    region,
    prefecture,
    priceMin,
    priceMax,
    onlyBreakfast,
    typeFilter,
    useMapBounds,
    mapBounds,
  ]);

  const markers = useMemo(
    () =>
      hotels.map((hotel) => ({
        id: hotel.id,
        lat: hotel.lat,
        lng: hotel.lng,
        label: hotel.name,
      })),
    [hotels]
  );

  const handleHotelFocus = useCallback((hotel: (typeof hotels)[number]) => {
    setFocusedHotelId(hotel.id);
    setFocusLocation({ lat: hotel.lat, lng: hotel.lng, zoom: 9.5 });
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const counts = new Map<number, number>();
    for (const h of hotels) counts.set(h.id, (counts.get(h.id) ?? 0) + 1);
    const dups = Array.from(counts.entries())
      .filter(([, c]) => c > 1)
      .map(([id]) => id);
    if (dups.length)
      console.warn("[HomePage] Duplicate hotel ids detected:", dups);
  }, [hotels]);

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <div
        ref={containerRef}
        className="h-screen w-full grid grid-cols-1 lg:grid-cols-1"
        style={
          isLarge && leftWidth
            ? { gridTemplateColumns: `${leftWidth}px 1fr` }
            : undefined
        }
      >
        <div className="relative h-[40vh] w-full lg:h-screen lg:sticky lg:top-0">
          {/* リサイズハンドル（ラージ画面時のみ表示） */}
          <div
            onMouseDown={onHandleMouseDown}
            onTouchStart={onHandleTouchStart}
            className="hidden lg:block absolute -right-1 top-0 h-full w-2 cursor-col-resize z-50"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panel"
          />

          <Suspense
            fallback={
              <div
                className="h-full w-full bg-gradient-to-b from-slate-100 via-sky-100 to-slate-200 dark:from-slate-950 dark:via-sky-900 dark:to-slate-900"
                aria-hidden="true"
              />
            }
          >
            <MapPanel
              key="static-map"
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
              markers={markers}
              selectedMarkerId={focusedHotelId}
              focusLocation={focusLocation}
              showMarkersAtZoom={8.5}
              onViewportChange={(bounds) => setMapBounds(bounds)}
              maxZoom={20}
              panelClassName="absolute inset-0"
              mapWrapperClassName="absolute inset-0"
              mapStyle={{ width: "100%", height: "100%" }}
              showControls
            />
          </Suspense>
        </div>

        <div className="flex w-full flex-col overflow-y-auto bg-[var(--surface-soft)] px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-1 flex-col gap-6">
            <section className="pointer-events-auto rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 shadow-2xl backdrop-blur">
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-[var(--muted-foreground)]">
                {(region || prefecture) && (
                  <button
                    type="button"
                    className="rounded-full border border-indigo-300 bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:border-indigo-400/80 dark:bg-indigo-500/20 dark:text-indigo-200"
                    onClick={() => {
                      setPrefecture(null);
                      setRegion(null);
                      setPriceMin(minPrice);
                      setPriceMax(maxPrice);
                      setOnlyBreakfast(false);
                      setTypeFilter("");
                      setUseMapBounds(false);
                      setMapBounds(null);
                    }}
                  >
                    フィルタ解除
                  </button>
                )}
              </div>
            </section>

            <section className="pointer-events-auto rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 shadow-[0_15px_45px_rgba(2,6,23,0.25)] dark:shadow-[0_15px_45px_rgba(2,6,23,0.7)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground-strong)]">
                    {prefecture
                      ? `${prefecture}のホテル`
                      : region
                      ? `${region}のホテル`
                      : "全国の宿泊施設"}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
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
                    className="text-sm font-medium text-indigo-600 underline dark:text-indigo-300"
                    onClick={() => {
                      setPrefecture(null);
                      setRegion(null);
                      setPriceMin(minPrice);
                      setPriceMax(maxPrice);
                      setOnlyBreakfast(false);
                      setTypeFilter("");
                    }}
                  >
                    クリア
                  </button>
                )}
              </div>

              {/* 価格範囲フィルタ（下限・上限の2つのつまみ） */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <div>価格下限: ¥{priceMin?.toLocaleString()}</div>
                  <div>価格上限: ¥{priceMax?.toLocaleString()}</div>
                </div>
                <div className="mt-2 space-y-2">
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
                    <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
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
                    <div
                      className="absolute top-1/2 w-3 h-3 bg-slate-900 dark:bg-white rounded-full shadow -translate-y-1/2"
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
                      className="absolute top-1/2 w-3 h-3 bg-slate-900 dark:bg-white rounded-full shadow -translate-y-1/2"
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

              {/* 朝食・宿泊スタイルの絞り込み */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
                <button
                  type="button"
                  onClick={() => setOnlyBreakfast((prev) => !prev)}
                  className={`rounded-full border px-3 py-1 font-medium transition ${
                    onlyBreakfast
                      ? "border-amber-300 bg-amber-400/20 text-amber-50"
                      : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:border-amber-200 hover:text-amber-700 dark:hover:text-amber-100"
                  }`}
                >
                  朝食付きのみ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!mapBounds) return;
                    setUseMapBounds(true);
                  }}
                  disabled={!mapBounds}
                  className={`rounded-full border px-3 py-1 font-medium transition ${
                    useMapBounds
                      ? "border-sky-300 bg-sky-400/20 text-sky-50"
                      : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:border-sky-200 hover:text-sky-700 dark:hover:text-sky-100"
                  }`}
                >
                  この範囲で検索
                </button>
                {useMapBounds && (
                  <button
                    type="button"
                    onClick={() => setUseMapBounds(false)}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 font-medium text-[var(--muted-foreground)] transition hover:border-slate-300 hover:text-[var(--foreground)]"
                  >
                    範囲解除
                  </button>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[var(--muted-foreground-strong)]">宿泊スタイル:</span>
                  {[
                    { value: "", label: "すべて" },
                    { value: "hotel", label: "ホテル" },
                    { value: "ryokan", label: "旅館" },
                    { value: "minpaku", label: "民泊" },
                  ].map((opt) => (
                    <button
                      key={opt.value || "all"}
                      type="button"
                      onClick={() => setTypeFilter(opt.value)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                        typeFilter === opt.value
                          ? "border-indigo-300 bg-indigo-500/30 text-indigo-50"
                          : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:border-indigo-200 hover:text-indigo-700 dark:hover:text-indigo-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <ul
                ref={listRef}
                className="mt-6 grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {hotels.map((hotel) => (
                  <li
                    key={`${hotel.id}-${hotel.name}`}
                    className="cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-black/10 dark:shadow-black/60 transition dark:hover:shadow-white/30"
                    onClick={(event) => {
                      const target = event.target as HTMLElement | null;
                      if (target?.closest("a")) return;
                      handleHotelFocus(hotel);
                    }}
                  >
                    <FallbackImage
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      width={600}
                      height={400}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-4">
                      <div className="text-sm font-semibold text-[var(--foreground)]">
                        {hotel.name}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-[var(--muted-foreground-strong)]">
                        {hotel.region}・{hotel.pref ?? "所在地不明"}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                        ¥{hotel.price.toLocaleString()}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
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
