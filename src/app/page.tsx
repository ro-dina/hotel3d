"use client";

import React, { useEffect, useMemo, useState } from "react";
import Map from "@/app/components/Map";
import PriceHistogram from "@/app/components/PriceHistogram";
import type { Feature, Geometry } from "geojson";

export default function HomePage() {
  // Map state
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>(
    { coordinates: [139, 37.5], zoom: 1 }
  );
  const [pref, setPref] = useState<string>("");

  // hysteresis to avoid rapid layer switching
  const [lastLevel, setLastLevel] = useState<"regions" | "prefecture" | "japan">("regions");
  const level: "regions" | "prefecture" | "japan" = useMemo(() => {
    const z = position.zoom;
    if (lastLevel === "regions") {
      if (z > 1.9) return "prefecture";
      return "regions";
    }
    if (lastLevel === "prefecture") {
      if (z >= 3.4) return "japan";
      if (z < 1.6) return "regions";
      return "prefecture";
    }
    // lastLevel === "japan"
    if (z < 3.0) return "prefecture";
    return "japan";
  }, [position.zoom, lastLevel]);
  useEffect(() => { setLastLevel(level); }, [level]);

  // demo prices for the histogram (replace with your actual data source)
  const prices = useMemo(() => [8000, 9000, 12000, 15000, 11000, 9500, 13000, 7000, 20000, 16000, 14000, 10000], []);

  const readAreaName = (geo: Feature<Geometry, Record<string, unknown>>): string => {
    const p = (geo.properties ?? {}) as Record<string, unknown>;
    const keys = ["N03_005", "N03_004", "N03_001", "region", "region_name"];
    for (const key of keys) {
      const val = p[key];
      if (typeof val === "string") return val;
    }
    return "";
  };

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-8">
      <h1 className="sr-only">トップページ</h1>
      <div className="text-sm text-gray-600">{pref ? `選択: ${pref}` : ""}</div>

      {/* Map section */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-gray-700">日本地図</h2>
        <Map
          pref={pref}
          setPref={setPref}
          position={position}
          setPosition={setPosition}
          level={level}
          readAreaName={readAreaName}
          height={480}
          center={[139, 37.5]}
        />
      </section>

      {/* Histogram section */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-gray-700">価格ヒストグラム</h2>
        <div className="w-full">
          <PriceHistogram prices={prices} width={960} height={220} />
        </div>
      </section>
    </main>
  );
}