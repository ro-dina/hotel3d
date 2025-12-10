"use client";

import "leaflet/dist/leaflet.css";
import type { CSSProperties, ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { geoCentroid } from "d3-geo";
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

type MapDimensions = {
  width?: number;
  height?: number;
};

type MapPanelThresholds = Partial<ZoomThresholds>;

export type MapPanelProps = {
  value: string | null;
  onPick: (region: string | null) => void;
  onPickPref?: (pref: string | null) => void;
  maxZoom?: number;
  thresholds?: MapPanelThresholds;
  mapDimensions?: MapDimensions;
  panelClassName?: string;
  mapWrapperClassName?: string;
  mapStyle?: CSSProperties;
  showControls?: boolean;
};

type ZoomThresholds = {
  regionsToPrefUp: number;
  regionsToPrefDown: number;
  prefToJapanUp: number;
  prefToJapanDown: number;
  prefToDetailUp: number;
  prefToDetailDown: number;
  detailToJapanDown: number;
};

type JPProps = GeoJsonProperties & {
  region?: string;
  region_name?: string;
  N03_001?: string;
  N03_004?: string;
  N03_005?: string;
};

type RsmGeo = Feature<Geometry, JPProps>;

const DEFAULT_THRESHOLDS: ZoomThresholds = {
  regionsToPrefUp: 5.5,
  regionsToPrefDown: 4.0,
  prefToJapanUp: 12,
  prefToJapanDown: 10,
  prefToDetailUp: 8,
  prefToDetailDown: 7,
  detailToJapanDown: 11,
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

const REGION_KEYS = ["region", "region_name", "地方名"] as const;
const PREF_KEYS = ["N03_004", "N03_001", "N03_005", "name", "NAME"] as const;

function getName(props: Record<string, unknown>): string | null {
  for (const key of TARGET_KEYS) {
    const value = props[key as keyof typeof props];
    if (typeof value === "string" && value.length) return value;
  }
  return null;
}

function getFirstStringValue<K extends readonly string[]>(
  props: Record<string, unknown>,
  keys: K
): string | null {
  for (const key of keys) {
    const value = props[key as keyof typeof props];
    if (typeof value === "string" && value.length) return value;
  }
  return null;
}

function getRegionName(props: Record<string, unknown>): string | null {
  return getFirstStringValue(props, REGION_KEYS);
}

function getPrefName(props: Record<string, unknown>): string | null {
  return getFirstStringValue(props, PREF_KEYS) ?? getRegionName(props);
}

type Point = [number, number];

function ringContainsPoint(point: Point, ring: number[][]): boolean {
  if (ring.length < 3) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects =
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygonContainsPoint(
  point: Point,
  coordinates: number[][][]
): boolean {
  if (!coordinates.length) return false;
  if (!ringContainsPoint(point, coordinates[0])) return false;
  for (let i = 1; i < coordinates.length; i += 1) {
    if (ringContainsPoint(point, coordinates[i])) {
      return false;
    }
  }
  return true;
}

function containsPointInFeature(
  feature: Feature<Geometry, JPProps>,
  point: Point
): boolean {
  if (!feature?.geometry) return false;
  if (feature.geometry.type === "Polygon") {
    return polygonContainsPoint(point, feature.geometry.coordinates);
  }
  if (feature.geometry.type === "MultiPolygon") {
    return feature.geometry.coordinates.some((coordinates) =>
      polygonContainsPoint(point, coordinates)
    );
  }
  return false;
}

function findPrefectureNameAtPoint(
  featureCollection: FeatureCollection<Geometry, JPProps>,
  point: Point
): string | null {
  if (!featureCollection?.features?.length) return null;
  for (const feature of featureCollection.features) {
    if (containsPointInFeature(feature, point)) {
      const name = getName(feature.properties ?? {});
      if (name) return name;
    }
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

type Level = "regions" | "prefecture" | "prefectureDetail" | "japan";

function determineLevel(
  zoom: number,
  thresholds: ZoomThresholds,
  hasPrefecture: boolean
): Level {
  if (zoom >= thresholds.prefToJapanUp) return "japan";
  if (hasPrefecture && zoom >= thresholds.prefToDetailUp)
    return "prefectureDetail";
  if (zoom >= thresholds.regionsToPrefUp) return "prefecture";
  if (zoom < thresholds.regionsToPrefDown) return "regions";
  if (hasPrefecture && zoom >= thresholds.prefToDetailDown)
    return "prefectureDetail";
  if (zoom >= thresholds.prefToJapanDown) return "japan";
  return "prefecture";
}

function parseMapData(data: unknown): FeatureCollection<Geometry, JPProps> {
  if (
    typeof data === "object" &&
    data !== null &&
    (data as { type?: string }).type === "FeatureCollection"
  ) {
    return data as FeatureCollection<Geometry, JPProps>;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    (data as { type?: string }).type === "Topology"
  ) {
    const topo = data as JapanTopology;
    const keys = Object.keys(topo.objects);
    if (!keys.length) throw new Error("Topology contains no objects");
    const objectName = keys.includes("N03-20240101") ? "N03-20240101" : keys[0];
    const converted = topojsonFeature(topo, topo.objects[objectName]);
    if (converted.type === "FeatureCollection") {
      return converted as FeatureCollection<Geometry, JPProps>;
    }
    if (converted.type === "Feature") {
      return {
        type: "FeatureCollection",
        features: [converted as Feature<Geometry, JPProps>],
      };
    }
    throw new Error("unsupported topology feature");
  }

  throw new Error("Unsupported map format");
}

export default function MapPanel({
  value,
  onPick,
  onPickPref,
  maxZoom = 12,
  thresholds: thresholdsOverride,
  mapDimensions,
  panelClassName,
  mapWrapperClassName,
  mapStyle,
  showControls = true,
}: MapPanelProps): ReactElement {
  const [center, setCenter] = useState<[number, number]>([37.5, 139.0]);
  const [zoom, setZoom] = useState(4.5);
  const [geo, setGeo] = useState<FeatureCollection<Geometry, JPProps> | null>(
    null
  );
  const [prefectureGeo, setPrefectureGeo] = useState<FeatureCollection<
    Geometry,
    JPProps
  > | null>(null);
  const detailCacheRef = useRef<
    Record<string, FeatureCollection<Geometry, JPProps>>
  >({});
  const thresholds = useMemo(
    () => ({ ...DEFAULT_THRESHOLDS, ...(thresholdsOverride ?? {}) }),
    [thresholdsOverride]
  );

  const centerPrefectureName = useMemo(() => {
    if (!prefectureGeo) return null;
    return findPrefectureNameAtPoint(prefectureGeo, [
      center[1],
      center[0],
    ] as Point);
  }, [prefectureGeo, center]);

  const level = useMemo<Level>(() => {
    const z = zoom;
    const t = thresholds;
    const hasPrefecture = Boolean(centerPrefectureName);

    if (z >= t.prefToJapanUp) return "japan";
    if (hasPrefecture && z >= t.prefToDetailUp) return "prefectureDetail";
    if (z >= t.regionsToPrefUp) return "prefecture";
    if (z < t.regionsToPrefDown) return "regions";
    if (hasPrefecture && z >= t.prefToDetailDown) return "prefectureDetail";
    if (z >= t.prefToJapanDown) return "japan";
    if (hasPrefecture && z >= t.prefToDetailDown) return "prefectureDetail";
    return "prefecture";
  }, [zoom, centerPrefectureName, thresholds]);

  const versionedUrl = useMemo(() => {
    const stamp = Date.now();
    const suffix = `?v=${stamp}`;
    return {
      regions: `/maps/regions.json${suffix}`,
      prefecture: `/maps/prefecture.json${suffix}`,
      japan: `/maps/japan.json${suffix}`,
      prefectureDetail: (pref: string) =>
        `/maps/prefectures/${encodeURIComponent(pref)}.json${suffix}`,
    };
  }, []);

  const geographyUrl = useMemo(() => {
    if (level === "regions") return versionedUrl.regions;
    if (level === "prefecture") return versionedUrl.prefecture;
    if (level === "prefectureDetail" && centerPrefectureName)
      return versionedUrl.prefectureDetail(centerPrefectureName);
    if (level === "japan") return versionedUrl.japan;
    return null;
  }, [level, centerPrefectureName, versionedUrl]);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    if (!geographyUrl) {
      if (isActive) setGeo(null);
      return () => {
        isActive = false;
        controller.abort();
      };
    }

    if (
      level === "prefecture" &&
      prefectureGeo &&
      geographyUrl === versionedUrl.prefecture
    ) {
      setGeo(prefectureGeo);
      return () => {
        isActive = false;
        controller.abort();
      };
    }

    if (level === "prefectureDetail" && centerPrefectureName) {
      const cached = detailCacheRef.current[centerPrefectureName];
      if (cached) {
        setGeo(cached);
        return () => {
          isActive = false;
          controller.abort();
        };
      }
    }

    fetch(geographyUrl, { cache: "no-store", signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (!isActive) return;
        const collection = parseMapData(data);
        if (level === "prefecture") {
          setPrefectureGeo(collection);
        }
        if (level === "prefectureDetail" && centerPrefectureName) {
          detailCacheRef.current[centerPrefectureName] = collection;
        }
        setGeo(collection);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        console.error(err);
        if (isActive) setGeo(null);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    geographyUrl,
    level,
    prefectureGeo,
    centerPrefectureName,
    versionedUrl.prefecture,
    versionedUrl.regions,
    versionedUrl.japan,
  ]);

  const handleClick = (props: Record<string, unknown>, feature?: RsmGeo) => {
    if (level === "regions") {
      const region = getRegionName(props);
      onPick(region ?? null);
    } else if (level === "prefecture") {
      const pref = getPrefName(props);
      if (onPickPref) onPickPref(pref ?? null);
      else onPick(pref ?? null);
    } else {
      const pref = getPrefName(props) ?? getRegionName(props);
      if (onPickPref) onPickPref(pref ?? null);
      else onPick(pref ?? null);
    }

    if (feature) {
      try {
        const [lon, lat] = geoCentroid(feature);
        setCenter([lat, lon]);

        setZoom((z) => {
          if (level === "regions") {
            const target = Math.max(z, thresholds.regionsToPrefUp + 0.2);
            return Math.min(target, maxZoom);
          }
          if (level === "prefecture") {
            const target = Math.max(z, thresholds.prefToDetailUp + 0.5);
            return Math.min(target, maxZoom);
          }
          if (level === "prefectureDetail") {
            const target = Math.max(z, thresholds.prefToJapanUp + 0.5);
            return Math.min(target, maxZoom);
          }
          return Math.min(z * 1.2, maxZoom);
        });
      } catch {
        // ignore centroid failures
      }
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
                layer.on("click", () =>
                  handleClick(feature.properties ?? {}, feature)
                );
              }}
            />
          )}
        </MapContainer>
      </div>
    </section>
  );
}
