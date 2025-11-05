"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoCentroid } from "d3-geo";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import type { Feature, Geometry, GeoJsonProperties } from "geojson";

/** react-simple-maps が返す地物（rsmKey を持つことがある） */
type RsmGeo = Feature<Geometry, GeoJsonProperties> & { rsmKey?: string };

/** ZoomableGroup onMoveEnd の受け取り型（実装差を吸収） */
type ViewportLike = {
  coordinates: [number, number];
  k?: number;        // 古い表記（d3-zoom）
  zoom?: number;     // 新しい表記（react-simple-maps v3）
};

type Props = {
  /** 地方フィルタ（現行と互換） */
  value: string | null;
  /** 地方がクリックされたとき（現行と互換） */
  onPick: (region: string | null) => void;
  /** 任意: 都道府県クリック時（指定がなければ onPick にフォールバック） */
  onPickPref?: (pref: string | null) => void;
  /** 拡大上限（未指定ならデフォルト） */
  maxZoom?: number;
  /** レベル切替のしきい値（ヒステリシス用） */
  thresholds?: {
    regionsToPrefUp: number;     // regions → prefecture へ上がる閾値
    regionsToPrefDown: number;   // prefecture → regions へ下がる閾値
    prefToJapanUp: number;       // prefecture → japan へ上がる閾値
    prefToJapanDown: number;     // japan → prefecture へ下がる閾値
  };
};

const DEFAULT_THRESHOLDS = {
  regionsToPrefUp: 1.5,
  regionsToPrefDown: 1.2,
  prefToJapanUp: 10,
  prefToJapanDown: 8,
};

/** ズーム段階に応じて表示レベルを切り替える */
export default function MapPanel({ value, onPick, onPickPref, maxZoom = 12, thresholds = DEFAULT_THRESHOLDS }: Props) {
  /** 表示する地図のレベル */
  type Level = "regions" | "prefecture" | "japan";

  // ---- ズーム状態 ----------------------------------------------------------
  const [zoom, setZoom] = useState(1.2);
  const [center, setCenter] = useState<[number, number]>([137, 37]); // 日本の中心あたり
  const lastLevelRef = useRef<Level>("regions");

  // ヒステリシスを入れてバタつきを防ぐ（境界を少しズラす）
  const level: Level = useMemo(() => {
    const z = zoom;
    const last = lastLevelRef.current;
    const t = thresholds;
    if (last === "regions") {
      if (z > t.regionsToPrefUp) return "prefecture";
      return "regions";
    }
    if (last === "prefecture") {
      if (z >= t.prefToJapanUp) return "japan";
      if (z < t.regionsToPrefDown) return "regions";
      return "prefecture";
    }
    // last === "japan"
    if (z < t.prefToJapanDown) return "prefecture";
    return "japan";
  }, [zoom, thresholds]);

  useEffect(() => {
    lastLevelRef.current = level;
  }, [level]);

  // ---- ファイルURL（キャッシュバスター付き） -------------------------------
  const urls = useMemo(() => {
    const v = Date.now();
    return {
      regions: `/maps/regions.json?v=${v}`,
      prefecture: `/maps/prefecture.json?v=${v}`,
      japan: `/maps/japan.json?v=${v}`, // 市区町村など（無ければ prefecture にフォールバック）
    };
  }, []);

  const geographyUrl = useMemo<string>(() => {
    if (level === "regions") return urls.regions;
    if (level === "prefecture") return urls.prefecture;
    // japan.json が無いケースも想定（prefecture を表示）
    return urls.japan;
  }, [level, urls]);

  // ---- 地物名の取得（ファイル差に強いキー優先順） -------------------------
  const getRegionName = (props: Record<string, unknown>): string | null => {
    const keys = ["region", "地方名", "name", "NAME", "N03_001"] as const;
    for (const k of keys) {
      const v = props[k as keyof typeof props];
      if (typeof v === "string" && v.length) return v;
    }
    return null;
  };
  const getPrefName = (props: Record<string, unknown>): string | null => {
    const keys = ["pref", "都道府県名", "県名", "name", "NAME", "N03_001"] as const;
    for (const k of keys) {
      const v = props[k as keyof typeof props];
      if (typeof v === "string" && v.length) return v;
    }
    return null;
  };

  // ---- クリック時のハンドラ ------------------------------------------------
  const handleClick = (props: Record<string, unknown>, feature?: RsmGeo) => {
    // まずは選択コールバック（従来通り）
    if (level === "regions") {
      const region = getRegionName(props);
      onPick(region ?? null);
    } else if (level === "prefecture") {
      const pref = getPrefName(props);
      if (onPickPref) onPickPref(pref ?? null);
      else onPick(pref ?? null); // フォールバック：今まで通り onPick に流す
    } else {
      // japan（市区町村等）はひとまず都道府県名が取れればそれを返す（選択解除を防ぐ）
      const pref = getPrefName(props) ?? getRegionName(props);
      if (onPickPref) onPickPref(pref ?? null);
      else onPick(pref ?? null);
    }

    // 次に、クリック位置へパン＆適切なズーム段階へ寄せる
    if (feature) {
      try {
        const [lon, lat] = geoCentroid(feature);
        setCenter([lon, lat]);

        setZoom((z) => {
          if (level === "regions") {
            // 地方 → 県 へ入る少し上まで
            const target = Math.max(z, thresholds.regionsToPrefUp + 0.2);
            return Math.min(target, maxZoom);
          }
          if (level === "prefecture") {
            // 県 → 詳細 へ入る少し上まで
            const target = Math.max(z, thresholds.prefToJapanUp + 0.5);
            return Math.min(target, maxZoom);
          }
          // 既に詳細なら、わずかに寄る
          return Math.min(z * 1.2, maxZoom);
        });
      } catch {
        // セントロイド計算失敗時は何もしない（選択は成立済み）
      }
    }
  };

  return (
    <section className="bg-white border rounded-lg p-4 shadow">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">
          エリアから探す <span className="text-xs text-gray-500">({level})</span>
        </h2>
        <div className="text-xs text-gray-500">
          Zoom: {zoom.toFixed(2)} / Center: {center[0].toFixed(2)},{center[1].toFixed(2)}
        </div>
      </div>

      <div className="rounded overflow-hidden border">
        <ComposableMap
          projection="geoMercator"
          width={520}
          height={420}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup
            center={center}
            zoom={zoom}
            minZoom={0.8}
            maxZoom={maxZoom}
            onMoveEnd={(pos: ViewportLike) => {
              const { coordinates } = pos;
              const k = (pos.k ?? pos.zoom ?? 1);
              setCenter(coordinates);
              setZoom(k);
            }}
          >
            <Geographies geography={geographyUrl}>
              {({ geographies }: { geographies: RsmGeo[] }) =>
                geographies.map((geo) => {
                  const props = (geo.properties ?? {}) as Record<string, unknown>;
                  // 表示レベルごとに表示名を変える
                  const name =
                    level === "regions" ? getRegionName(props) : getPrefName(props) ?? getRegionName(props);

                  const selected = !!(value && name && value === name);

                  return (
                    <Geography
                      key={geo.rsmKey ?? name ?? Math.random().toString(36)}
                      geography={geo}
                      onClick={() => handleClick(props, geo)}
                      style={{
                        default: {
                            fill: selected ? "#dbeafe" : "#eef2ff",
                            stroke: "#4f46e5",
                            // ↓ ここから追加・変更
                            vectorEffect: "non-scaling-stroke",
                            strokeWidth: 0.8,                 // 画面上でほぼ一定   
                            strokeLinejoin: "round",
                            strokeLinecap: "round",
                            shapeRendering: "geometricPrecision",
                            // ↑
                            outline: "none",
                            fillRule: "evenodd",
                        },
                        hover: {
                          vectorEffect: "non-scaling-stroke",
                          strokeLinejoin: "round",
                          strokeLinecap: "round",
                          shapeRendering: "geometricPrecision",

                          fill: "#c7d2fe",
                          stroke: "#4338ca",
                          strokeWidth: 0.9,
                          outline: "none",
                          fillRule: "evenodd",
                          cursor: name ? "pointer" : "default",
                        },
                        pressed: {
                          vectorEffect: "non-scaling-stroke",
                          strokeLinejoin: "round",
                          strokeLinecap: "round",
                          shapeRendering: "geometricPrecision",

                          fill: "#bfdbfe",
                          stroke: "#1d4ed8",
                          strokeWidth: 1.0,
                          outline: "none",
                          fillRule: "evenodd",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <div className="mt-2 text-sm text-gray-600">
        {value ? (
          <button className="underline" onClick={() => (onPickPref ? onPickPref(null) : onPick(null))}>
            「{value}」の絞り込みを解除
          </button>
        ) : (
          <span>拡大すると都道府県レベルに自動切替します。</span>
        )}
      </div>
    </section>
  );
}