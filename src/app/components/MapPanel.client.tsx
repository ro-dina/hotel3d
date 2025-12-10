"use client";

import type { CSSProperties, ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  GeoJSONProps,
  useMapEvents,
} from "react-leaflet";
import { feature as topojsonFeature } from "topojson-client";
import type {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import type { LatLngExpression, LeafletEvent } from "leaflet";
import type { Objects, Topology } from "topojson-specification";

export type MapPanelProps = {
  value: string | null;
  onPick: (region: string | null) => void;
  onPickPref?: (pref: string | null) => void;
  maxZoom?: number;
  thresholds?: {
    regionsToPrefUp: number;
    regionsToPrefDown: number;
    prefToJapanUp: number;
    prefToJapanDown: number;
  };
  mapDimensions?: {
    width?: number;
    height?: number;
  };
  panelClassName?: string;
  mapWrapperClassName?: string;
  mapStyle?: CSSProperties;
  showControls?: boolean;
};

type JPProps = GeoJsonProperties & {
  region?: string;
  region_name?: string;
  N03_001?: string;
  N03_004?: string;
  N03_005?: string;
};

const DEFAULT_THRESHOLDS = {
  regionsToPrefUp: 1.5,
  regionsToPrefDown: 1.2,
  prefToJapanUp: 10,
  prefToJapanDown: 8,
};

type JapanTopology = Topology & {
  objects: Objects<GeoJsonProperties>;
};

const TARGET_KEYS = [
  "region",
  "region_name",
  "地方名",
  "name",
  "NAME",
  "N03_001",
  "N03_004",
  "N03_005",
] as const;

function getName(props: Record<string, unknown>): string | null {
  for (const key of TARGET_KEYS) {
    const value = props[key as keyof typeof props];
    if (typeof value === "string" && value.length) return value;
  }
  return null;
}

function MapEvents({
  onMove,
}: {
  onMove: (center: [number, number], zoom: number) => void;
}): ReactElement | null {
  useMapEvents({
    moveend(e: LeafletEvent) {
      const map = e.target;
      const center = map.getCenter();
      onMove([center.lat, center.lng], map.getZoom());
    },
    zoomend(e: LeafletEvent) {
      const map = e.target;
      const center = map.getCenter();
      onMove([center.lat, center.lng], map.getZoom());
    },
  });
  return null;
}

export default function MapPanel({
  value,
  onPick,
  onPickPref,
  maxZoom = 12,
  thresholds = DEFAULT_THRESHOLDS,
  mapDimensions,
  panelClassName,
  mapWrapperClassName,
  mapStyle,
  showControls = true,
}: MapPanelProps): ReactElement {
  type Level = "regions" | "prefecture" | "japan";
  const [center, setCenter] = useState<[number, number]>([37.5, 139.0]);
  const [zoom, setZoom] = useState(4.5);
  const lastLevelRef = useRef<Level>("regions");
  const [geo, setGeo] = useState<FeatureCollection<Geometry, JPProps> | null>(
    null
  );

  const level = useMemo<Level>(() => {
    const last = lastLevelRef.current;
    const z = zoom;
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
    if (z < t.prefToJapanDown) return "prefecture";
    return "japan";
  }, [zoom, thresholds]);

  useEffect(() => {
    lastLevelRef.current = level;
  }, [level]);

  const versionedUrl = useMemo(() => {
    const stamp = Date.now();
    return {
      regions: `/maps/regions.json?v=${stamp}`,
      prefecture: `/maps/prefecture.json?v=${stamp}`,
      japan: `/maps/japan.json?v=${stamp}`,
    };
  }, []);

  const geographyUrl = useMemo(() => {
    if (level === "regions") return versionedUrl.regions;
    if (level === "prefecture") return versionedUrl.prefecture;
    return versionedUrl.japan;
  }, [level, versionedUrl]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetch(geographyUrl, { cache: "no-store", signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (!active) return;
        if (
          typeof data === "object" &&
          data !== null &&
          (data as { type?: string }).type === "FeatureCollection"
        ) {
          setGeo(data as FeatureCollection<Geometry, JPProps>);
          return;
        }

        if (
          typeof data === "object" &&
          data !== null &&
          (data as { type?: string }).type === "Topology"
        ) {
          const topo = data as JapanTopology;
          const keys = Object.keys(topo.objects);
          if (!keys.length) throw new Error("Topology contains no objects");
          const objectName = keys.includes("N03-20240101")
            ? "N03-20240101"
            : keys[0];
          const converted = topojsonFeature(topo, topo.objects[objectName]);
          if (converted.type === "FeatureCollection") {
            setGeo(converted as FeatureCollection<Geometry, JPProps>);
          } else if (converted.type === "Feature") {
            setGeo({
              type: "FeatureCollection",
              features: [converted as Feature<Geometry, JPProps>],
            });
          } else {
            throw new Error("unsupported topology feature");
          }
          return;
        }

        throw new Error("Unsupported map format");
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        console.error(err);
        if (active) setGeo(null);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [geographyUrl]);

  const handleClick = (props: Record<string, unknown>) => {
    const name = getName(props);
    if (level === "regions") {
      onPick(name ?? null);
      return;
    }
    if (level === "prefecture") {
      if (onPickPref) onPickPref(name ?? null);
      else onPick(name ?? null);
      return;
    }
    if (level === "japan") {
      if (onPickPref) onPickPref(name ?? null);
      else onPick(name ?? null);
    }
  };

  const styleFeature: GeoJSONProps["style"] = (feature) => {
    const props = (feature?.properties ?? {}) as Record<string, unknown>;
    const name = getName(props);
    const selected = !!(value && name && value === name);
    return {
      fillColor: selected ? "#dbeafe" : "#f1f5f9",
      color: "#4f46e5",
      weight: selected ? 2 : 0.8,
      opacity: 1,
      fillOpacity: selected ? 0.8 : 0.6,
    };
  };

  const { width = 520, height = 420 } = mapDimensions ?? {};
  const wrapperClass = mapWrapperClassName ?? "relative w-full h-full";
  const sectionClass = panelClassName ?? "relative w-full h-full";
  const targetLevelName =
    level === "regions"
      ? "地方"
      : level === "prefecture"
      ? "都道府県"
      : "市区町村";
  const centerLatLng: LatLngExpression = [center[0], center[1]];

  return (
    <section className={sectionClass}>
      {showControls && (
        <div className="absolute right-4 top-4 z-20 rounded-2xl bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 shadow backdrop-blur">
          {targetLevelName}
        </div>
      )}
      <div
        className={wrapperClass}
        style={{
          width: width || "100%",
          height: height || "100%",
          minHeight: 300,
          ...mapStyle,
        }}
      >
        <MapContainer
          center={centerLatLng}
          zoom={zoom}
          scrollWheelZoom
          style={{ width: "100%", height: "100%" }}
          maxZoom={maxZoom}
        >
          <MapEvents
            onMove={(nextCenter, nextZoom) => {
              setCenter(nextCenter);
              setZoom(nextZoom);
            }}
          />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {geo && (
            <GeoJSON
              data={geo}
              style={styleFeature}
              onEachFeature={(feature, layer) => {
                layer.on("click", () => handleClick(feature.properties ?? {}));
              }}
            />
          )}
        </MapContainer>
      </div>
    </section>
  );
}
