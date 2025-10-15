"use client";

import { useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import type { Feature, Geometry, GeoJsonProperties } from "geojson";

type RsmGeo = Feature<Geometry, GeoJsonProperties> & { rsmKey?: string };

export default function MapPanel({
  value,
  onPick,
}: {
  value: string | null;
  onPick: (region: string | null) => void;
}) {
  // キャッシュ破棄のためクエリを付ける（置き換え時に即反映）
  const mapUrl = useMemo(
    () => `/maps/regions.json?v=${Date.now()}`,
    []
  );

  // 地域名の抽出（ファイルによってプロパティ名が異なるため冗長に見る）
  const getRegionName = (props: Record<string, unknown>): string | null => {
    const keys = ["region", "name", "N03_001", "pref", "県名", "地方名"];
    for (const k of keys) {
      const v = props[k];
      if (typeof v === "string" && v.length) return v;
    }
    return null;
  };

  return (
    <section className="bg-white border rounded-lg p-4 shadow">
      <h2 className="font-semibold mb-2">エリアから探す</h2>

      <div className="rounded overflow-hidden border">
        <ComposableMap
          projection="geoMercator"
          width={520}
          height={420}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup center={[137.0, 37.0]} zoom={1.2}>
            <Geographies geography={mapUrl}>
              {({ geographies }: { geographies: RsmGeo[] }) =>
                geographies.map((geo) => {
                  const props = (geo.properties ?? {}) as Record<string, unknown>;
                  const name = getRegionName(props);
                  const selected = value && name && value === name;

                  return (
                    <Geography
                      key={geo.rsmKey ?? name ?? Math.random().toString(36)}
                      geography={geo}
                      onMouseEnter={() => {
                        if (name) {
                          // hover でハイライトのみ。クリックで選択
                          // console.debug("[hover]", name);
                        }
                      }}
                      onClick={() => onPick(selected ? null : name)}
                      tabIndex={0}
                      role="button"
                      aria-label={name ?? "地域"}
                      style={{
                        default: {
                          fill: selected ? "#dbeafe" : "#eef2ff",
                          stroke: "#4f46e5",
                          strokeWidth: 0.7,
                          outline: "none",
                          fillRule: "evenodd",
                        },
                        hover: {
                          fill: "#c7d2fe",
                          stroke: "#4338ca",
                          strokeWidth: 0.9,
                          outline: "none",
                          fillRule: "evenodd",
                          cursor: name ? "pointer" as const : "default" as const,
                        },
                        pressed: {
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
          <button
            className="underline"
            onClick={() => onPick(null)}
          >
            「{value}」の絞り込みを解除
          </button>
        ) : (
          <span>地域をクリックすると絞り込めます。</span>
        )}
      </div>
    </section>
  );
}