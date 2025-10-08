"use client";

import { useEffect, useMemo, useState } from "react";
import type { FeatureCollection } from "geojson";
import Image from "next/image";
import Link from "next/link";

import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import type { Feature } from "geojson";
import { geoCentroid } from "d3-geo";
import { feature as topojsonFeature } from "topojson-client";

import type { Hotel } from "@/types/Hotel";
import { HOTELS } from "@/data/mockHotels"; // default export
import PriceHistogram from "@/components/PriceHistogram"; // default export

type PrefOption = { value: string; label: string };

const PREFS: PrefOption[] = [
  { value: "東京", label: "東京" },
  { value: "京都", label: "京都" },
  { value: "大阪", label: "大阪" },
  { value: "北海道", label: "北海道" },
  { value: "沖縄", label: "沖縄" },
];

/** 地物名を柔軟に読む（TopoJSON/GeoJSON のプロパティ名の違いを吸収） */
const readAreaName = (geo: Feature): string => {
  const p = geo.properties ?? {};
  return (
    p.name_ja ||
    p.name_jp ||
    p.nam ||
    p.name ||
    p.N03_004 || // 国交省の行政区域データ（市区町村名）
    p.N03_003 || // 郡/政令区 等
    ""
  );
};

/** 都道府県名の正規化（表記ゆれをスラッグに寄せる） */
const prefToSlug = (pref: string): string => {
  const table: Record<string, string> = {
    "北海道": "hokkaido", "青森": "aomori", "岩手": "iwate", "宮城": "miyagi", "秋田": "akita", "山形": "yamagata",
    "福島": "fukushima", "茨城": "ibaraki", "栃木": "tochigi", "群馬": "gunma", "埼玉": "saitama", "千葉": "chiba",
    "東京": "tokyo", "神奈川": "kanagawa", "新潟": "niigata", "富山": "toyama", "石川": "ishikawa", "福井": "fukui",
    "山梨": "yamanashi", "長野": "nagano", "岐阜": "gifu", "静岡": "shizuoka", "愛知": "aichi", "三重": "mie",
    "滋賀": "shiga", "京都": "kyoto", "大阪": "osaka", "兵庫": "hyogo", "奈良": "nara", "和歌山": "wakayama",
    "鳥取": "tottori", "島根": "shimane", "岡山": "okayama", "広島": "hiroshima", "山口": "yamaguchi",
    "徳島": "tokushima", "香川": "kagawa", "愛媛": "ehime", "高知": "kochi",
    "福岡": "fukuoka", "佐賀": "saga", "長崎": "nagasaki", "熊本": "kumamoto", "大分": "oita", "宮崎": "miyazaki",
    "鹿児島": "kagoshima", "沖縄": "okinawa",
  };
  return table[pref] || pref.toLowerCase();
};

export default function HomePage() {
  const [pref, setPref] = useState<string>("東京");
  const [guests, setGuests] = useState<number>(2);

  // --- 地図の位置（ズーム/中心） ---
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [137, 37],
    zoom: 1.2,
  });

  // --- public/maps/japan.json (TopoJSON) を読み込み、都道府県GeoJSONへ変換 ---
  const [prefGeo, setPrefGeo] = useState<FeatureCollection | null>(null);
  useEffect(() => {
    fetch("/maps/japan.json")
      .then((res) => res.json())
      .then((topology) => {
        // NOTE: あなたの TopoJSON 内のオブジェクト名に合わせて `objects.pref` を調整してください
        const geo = topojsonFeature(topology, topology.objects.pref) as unknown as FeatureCollection;
setPrefGeo(geo);
        setPrefGeo(geo);
      })
      .catch((e) => {
        console.error("Failed to load /maps/japan.json", e);
      });
  }, []);

  // 現在描画する地図ソース（都道府県レベル）
  const currentGeography = prefGeo;

  // 条件に合うホテル（都道府県名の表記ゆれを考慮してフィルタ）
  const hotels: Hotel[] = useMemo(() => {
    if (!pref) return HOTELS;
    const selected = prefToSlug(pref);
    return HOTELS.filter((h) => {
      const hp = (h.pref || "").trim();
      return hp === pref || prefToSlug(hp) === selected;
    });
  }, [pref]);

  const prices = useMemo<number[]>(() => hotels.map((h) => h.price), [hotels]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">ホテルを検索</h1>
      <p className="text-sm text-gray-600 mb-6">地域・日付・人数を選んで検索できます</p>

      {/* 検索フォーム */}
      <section className="bg-white rounded-xl shadow p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">地域</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={pref}
              onChange={(e) => setPref(e.target.value)}
            >
              {PREFS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">人数</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded px-3 py-2"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value) || 1)}
            />
          </div>

          <div className="md:col-span-2 flex items-end justify-end">
            <Link
              href="/pages/home"
              className="inline-flex items-center justify-center bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
            >
              検索
            </Link>
          </div>
        </div>

        {/* 地図セクション */}
        <section className="mt-6">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: [137, 37],
              scale: 1400,
            }}
            width={640}
            height={420}
            style={{ width: "100%", height: "auto" }}
          >
            <ZoomableGroup
              center={position.coordinates}
              zoom={position.zoom}
              onMoveEnd={(pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos)}
            >
              {currentGeography ? (
                <Geographies geography={currentGeography}>
                  {({ geographies }: { geographies: Feature[] }) =>
                    geographies.map((geo, idx) => {
                      const name = readAreaName(geo);
                      const isSelected = name === pref;
                      return (
                        <Geography
                          key={idx}
                          geography={geo}
                          onClick={() => {
                            if (name) {
                              setPref(name);
                              const c = (geoCentroid(geo) as [number, number]) ?? [137, 37];
                              setPosition({ coordinates: c, zoom: 3.2 });
                            }
                          }}
                          style={{
                            default: {
                              fill: isSelected ? "#4f46e5" : "#E0E7FF",
                              stroke: "#6366F1",
                              strokeWidth: 0.5,
                              outline: "none",
                              cursor: "pointer",
                            },
                            hover: {
                              fill: "#A5B4FC",
                              stroke: "#4338CA",
                              strokeWidth: 0.8,
                              outline: "none",
                              cursor: "pointer",
                            },
                            pressed: {
                              fill: "#818CF8",
                              stroke: "#3730A3",
                              strokeWidth: 1,
                              outline: "none",
                              cursor: "pointer",
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              ) : (
                <g>
                  <text x="10" y="20" fontSize="12">Loading map…</text>
                </g>
              )}
            </ZoomableGroup>
          </ComposableMap>
        </section>

        {/* 価格ヒストグラム */}
        <div className="mt-6">
          <PriceHistogram prices={prices} />
        </div>
      </section>

      {/* ホテル一覧 */}
      <section className="space-y-4">
        {hotels.map((hotel) => (
          <article
            key={hotel.id}
            className="bg-white rounded-xl shadow p-4 flex gap-4 items-stretch"
          >
            {/* 画像 */}
            <div className="relative w-40 h-28 shrink-0 rounded overflow-hidden bg-gray-100">
              {hotel.imageUrl ? (
                <Image
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* テキスト */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{hotel.name}</h3>
              <p className="text-sm text-gray-600">
                {hotel.pref}
                {hotel.region ? `・${hotel.region}` : ""} / {hotel.type} /
                朝食{hotel.breakfast ? "あり" : "なし"}
              </p>
              {hotel.description && (
                <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                  {hotel.description}
                </p>
              )}
            </div>

            {/* 料金・ボタン */}
            <div className="w-48 flex flex-col items-end justify-between">
              <div className="text-right">
                <div className="text-xs text-gray-500">1泊料金</div>
                <div className="text-xl font-bold">
                  ¥{hotel.price.toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/detail/${hotel.id}`}
                  className="px-3 py-2 rounded border text-sm hover:bg-gray-50"
                >
                  詳細
                </Link>
                <Link
                  href={`/unity/hotel/index.html?id=${hotel.id}`}
                  target="_blank"
                  className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >
                  3Dで見る
                </Link>
              </div>
            </div>
          </article>
        ))}

        {hotels.length === 0 && (
          <p className="text-center text-gray-500 py-12">該当のホテルがありません</p>
        )}
      </section>
    </main>
  );
}