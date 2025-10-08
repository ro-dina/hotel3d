"use client";
import { memo, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import type { Feature } from "geojson";

type Props = {
  selectedPref?: string;
  onSelect: (prefName: string) => void;
  height?: number;
};

const geoUrl = "/maps/japan.json"; // public 配下

export default memo(function MapJapan({ selectedPref, onSelect, height = 540 }: Props) {
  const [position, setPosition] = useState({ coordinates: [138, 38], zoom: 1.1 });

  // クリック時に都道府県名を読み取る関数（TopoJSONの properties 名に合わせて下さい）
  const readPrefName = (geo: Feature) =>
  (geo.properties as { name_ja?: string; nam?: string; name?: string })?.name_ja ||
  geo.properties?.nam ||
  geo.properties?.name ||
  "";

  return (
    <div className="w-full border rounded-lg bg-white shadow">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [138, 37], scale: 1200 }}
        width={640}
        height={height}
        style={{ width: "100%", height }}
      >
        <ZoomableGroup
          center={position.coordinates as [number, number]}
          zoom={position.zoom}
          onMoveEnd={(pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos)}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: Feature[] }) =>
                geographies.map((geo, idx) => {
                    const pref = readPrefName(geo as Feature); // ← 明示キャスト
                    const active = pref === selectedPref;
                    const centroid = (geoCentroid(geo as Feature) as [number, number]) ?? [138, 38];

                    return (
                        <Geography
                        key={idx} // ← rsmKey 型が無いので index でOK（安定した順序なら十分）
                        geography={geo}
                        onClick={() => {
                            onSelect(pref);
                            setPosition({
                                coordinates: centroid,
                                zoom: 2.2,
                            });
                        }}
                        style={{
                            default: { fill: active ? "#3b82f6" : "#e5e7eb", stroke: "#9ca3af", strokeWidth: 0.6 },
                            hover:   { fill: active ? "#2563eb" : "#c7d2fe", cursor: "pointer" },
                            pressed: { fill: "#2563eb" },
                        }}
                        />
                    );
                })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <div className="p-2 text-sm text-gray-600">
        {selectedPref ? `選択中: ${selectedPref}` : "地図をクリックして都道府県を選択"}
        <button
          className="ml-3 text-blue-600 hover:underline"
          onClick={() => setPosition({ coordinates: [138, 38], zoom: 1.1 })}
        >
          全体表示に戻す
        </button>
      </div>
    </div>
  );
});

// rsm には geoCentroid が入っていないので d3-geo を直接
import { geoCentroid } from "d3-geo";