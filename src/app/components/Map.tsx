"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { feature as topojsonFeature } from "topojson-client";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { Topology, Objects } from "topojson-specification";
import { geoCentroid } from "d3-geo";

export type MapProps = {
  pref?: string;
  setPref?: (v: string) => void;
  position: { coordinates: [number, number]; zoom: number };
  setPosition: (pos: { coordinates: [number, number]; zoom: number }) => void;
  level: "regions" | "prefecture" | "japan";
  readAreaName?: (geo: Feature<Geometry, JPProps>) => string;
  height?: number;
  center?: [number, number];
};

// Map feature properties interface (do not extend GeoJsonProperties because it can be null)
interface JPProps {
  [key: string]: unknown;
  region?: string;
  region_name?: string;
  N03_001?: string; // prefecture
  N03_004?: string; // city
  N03_005?: string; // ward
}

// Separate memoized geographies renderer (strictly typed)
const MemoGeographies: React.FC<{
  geography: FeatureCollection<Geometry, JPProps>;
  level: "regions" | "prefecture" | "japan";
  setPosition: (pos: { coordinates: [number, number]; zoom: number }) => void;
  onPick?: (name: string) => void;
}> = React.memo(({ geography, level, setPosition, onPick }) => (
  <Geographies geography={geography}>
    {({ geographies }: { geographies: Feature<Geometry, JPProps>[] }) =>
      geographies.map((geo, idx) => {
        const p: JPProps = (geo.properties || {}) as JPProps;
        const name = p.region ?? p.region_name ?? p.N03_001 ?? p.N03_005 ?? p.N03_004 ?? "";
        return (
          <Geography
            key={`g-${idx}`}
            geography={geo}
            fillRule="evenodd"
            onClick={() => {
              if (name) onPick?.(name);
              try {
                const c = geoCentroid(geo) as [number, number];
                const nextZoom = level === "regions" ? 2.2 : level === "prefecture" ? 3.3 : 4.2;
                setPosition({ coordinates: c, zoom: nextZoom });
              } catch {
                // fail-safe: ignore centroid errors
              }
            }}
            style={{
              default: { fill: level === "regions" ? "#C7D2FE" : "#E0E7FF", stroke: "#6366F1", strokeWidth: 0.4, cursor: "pointer" },
              hover: { fill: "#818CF8", stroke: "#4338CA", strokeWidth: 0.8 },
              pressed: { fill: "#4F46E5", stroke: "#312E81", strokeWidth: 1.0 },
            }}
          />
        );
      })
    }
  </Geographies>
));
MemoGeographies.displayName = "MemoGeographies";

export default function JapanMap(props: Partial<MapProps>) {
  const pref = props.pref;
  const setPref = props.setPref ?? (() => {});
  const position = props.position ?? { coordinates: [139, 37.5] as [number, number], zoom: 1 };
  const setPosition = props.setPosition ?? (() => {});
  const level: "regions" | "prefecture" | "japan" = props.level ?? "regions";
  const height = props.height ?? 420;
  const center = (props.center ?? [139, 37.5]) as [number, number];

  const [geo, setGeo] = useState<FeatureCollection<Geometry, JPProps> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // choose file by level
  const file = useMemo(() => {
    return level === "japan"
      ? "/maps/japan.json"
      : level === "prefecture"
      ? "/maps/prefecture.json"
      : "/maps/regions.json";
  }, [level]);

  // cache-busting version (changes on first mount)
  const [ver] = useState<string>(() => String(Date.now()));
  const url = useMemo(() => `${file}?v=${ver}` as const, [file, ver]);

  // load data
  useEffect(() => {
    const ac = new AbortController();
    fetch(url, { cache: "no-store", signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
        return res.json();
      })
      .then((data: unknown) => {
        let fc: FeatureCollection<Geometry, JPProps> | null = null;
        if (typeof data === "object" && data !== null && (data as { type?: string }).type === "FeatureCollection") {
          fc = data as FeatureCollection<Geometry, JPProps>;
        } else if (
          typeof data === "object" && data !== null &&
          (data as { type?: string }).type === "Topology" &&
          "objects" in (data as Record<string, unknown>)
        ) {
          const topo = data as Topology & { objects: Objects };
          const objName = ("N03-20240101" in topo.objects)
            ? "N03-20240101"
            : (Object.keys(topo.objects)[0] as keyof Objects);
          const convertedUnknown = topojsonFeature(topo, topo.objects[objName]);

          const isFC = (x: unknown): x is FeatureCollection<Geometry, JPProps> =>
            !!x && typeof x === "object" && (x as { type?: string }).type === "FeatureCollection" && Array.isArray((x as any).features);

          if (isFC(convertedUnknown)) {
            fc = convertedUnknown as FeatureCollection<Geometry, JPProps>;
          } else {
            const f = convertedUnknown as Feature<Geometry, JPProps>;
            fc = { type: "FeatureCollection", features: [f] } as FeatureCollection<Geometry, JPProps>;
          }
        }
        if (!fc) throw new Error(`Unsupported map format in ${url}`);
        setGeo(fc);
        console.info("Loaded map:", url, "features:", fc.features.length);
      })
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        console.error(`Failed to load ${url}`, e);
        setGeo(null);
      });
    return () => ac.abort();
  }, [url]);

  // prevent page zoom when interacting with map (pinch & gesture)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!el.contains(e.target as Node)) return;
      if (e.ctrlKey) {
        e.preventDefault();
        const dz = -e.deltaY * 0.0015;
        setPosition({ ...position, zoom: Math.max(1, Math.min(5, position.zoom + dz)) });
      }
    };
    const onGesture = (e: Event) => { e.preventDefault(); };
    window.addEventListener("wheel", onWheel, { passive: false });
    const gl: EventListener = (e) => onGesture(e);
    window.addEventListener("gesturestart", gl, { passive: false } as AddEventListenerOptions);
    window.addEventListener("gesturechange", gl, { passive: false } as AddEventListenerOptions);
    window.addEventListener("gestureend", gl, { passive: false } as AddEventListenerOptions);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("gesturestart", gl as EventListener);
      window.removeEventListener("gesturechange", gl as EventListener);
      window.removeEventListener("gestureend", gl as EventListener);
    };
  }, [position.zoom, setPosition]);

  return (
    <div
      ref={containerRef}
      className="w-full border rounded-lg bg-white shadow relative"
      style={{ touchAction: "none" }}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center, scale: 1400 }}
        width={800}
        height={height}
        style={{ width: "100%", height }}
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          onMoveEnd={(pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos)}
        >
          {geo ? (
            <>
              <MemoGeographies
                geography={geo}
                level={level}
                setPosition={setPosition}
                onPick={(name) => { if (props.setPref && name) props.setPref(name); }}
              />
              {/* Regional border overlay */}
              {level === "regions" && (
                <Geographies geography="/maps/region_borders.json">
                  {({ geographies }: { geographies: Feature<Geometry, JPProps>[] }) =>
                    geographies.map((g: Feature<Geometry, JPProps>, i: number) => (
                      <Geography
                        key={`border-${i}`}
                        geography={g}
                        style={{
                          default: {
                            fill: "none",
                            stroke: "#4B5563",
                            strokeWidth: 0.6,
                            outline: "none",
                            pointerEvents: "none",
                          },
                          hover: {
                            fill: "none",
                            stroke: "#4B5563",
                            strokeWidth: 0.6,
                            outline: "none",
                            pointerEvents: "none",
                          },
                          pressed: {
                            fill: "none",
                            stroke: "#4B5563",
                            strokeWidth: 0.6,
                            outline: "none",
                            pointerEvents: "none",
                          },
                        }}
                      />
                    ))
                  }
                </Geographies>
              )}
            </>
          ) : (
            <g>
              <rect x={0} y={0} width={800} height={height} fill="#f8fafc" />
              <text x={10} y={20} fontSize={12}>Loading map…</text>
            </g>
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom buttons */}
      <div className="absolute left-2 top-2 z-50 flex flex-col gap-2">
        <button
          type="button"
          className="rounded-md bg-white/90 px-3 py-1 text-sm shadow ring-1 ring-black/10 hover:bg-white"
          onClick={() => setPosition({ ...position, zoom: Math.min(5, position.zoom + 0.5) })}
        >
          ＋
        </button>
        <button
          type="button"
          className="rounded-md bg-white/90 px-3 py-1 text-sm shadow ring-1 ring-black/10 hover:bg-white"
          onClick={() => setPosition({ ...position, zoom: Math.max(1, position.zoom - 0.5) })}
        >
          －
        </button>
      </div>
    </div>
  );
}