"use client";

import "leaflet/dist/leaflet.css";
import type { CSSProperties, ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { geoCentroid } from "d3-geo";
import { feature as topojsonFeature } from "topojson-client";
import type {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import type { Objects, Topology } from "topojson-specification";

type MapDimensions = {
  width?: number;
  height?: number;
};

type MapPanelThresholds = Partial<ZoomThresholds>;

export type MapPanelProps = {
  value?: string | null;
  onPick?: (region: string | null) => void;
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
  detailToSubUp: number;
  detailToSubDown: number;
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
  regionsToPrefUp: 7.0,
  regionsToPrefDown: 6.0,
  prefToJapanUp: 30,
  prefToJapanDown: 15,
  prefToDetailUp: 9.5,
  prefToDetailDown: 8.5,
  detailToSubUp: 13,
  detailToSubDown: 12,
  detailToJapanDown: 14,
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
  "pref_name",
  "NAMELIST",
] as const;

const REGION_KEYS = ["region", "region_name", "地方名"] as const;
const PREF_KEYS = [
  "N03_001",
  "N03_004",
  "N03_005",
  "name",
  "NAME",
  "pref_name",
] as const;

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

type Level =
  | "regions"
  | "prefecture"
  | "prefectureDetail"
  | "subDetail"
  | "japan";

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);

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

  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(
    null
  );

  const thresholds = useMemo(
    () => ({ ...DEFAULT_THRESHOLDS, ...(thresholdsOverride ?? {}) }),
    [thresholdsOverride]
  );

  // --- Initialize Map ---
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      maxZoom,
      zoomControl: false, // We'll add it manually if needed, or default
    });

    if (showControls) {
      L.control.zoom({ position: "topleft" }).addTo(map);
    }

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    map.on("moveend", () => {
      const c = map.getCenter();
      const z = map.getZoom();
      setCenter([c.lat, c.lng]);
      setZoom(z);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // --- Update View (Imperative) ---
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    // Check distance to avoid infinite loops or jitter
    const dist = Math.sqrt(
      Math.pow(currentCenter.lat - center[0], 2) +
      Math.pow(currentCenter.lng - center[1], 2)
    );

    // Only update if significantly changed or zoom changed
    if (dist > 0.0001 || currentZoom !== zoom) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);


  // --- Logic for Levels and Data Fetching ---

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
    if (z >= t.prefToJapanUp) return "japan";
    if (z >= t.detailToSubUp) return "subDetail";
    if (z >= t.prefToDetailUp) return "prefectureDetail";
    if (z >= t.regionsToPrefUp) return "prefecture";
    return "regions";
  }, [zoom, thresholds]);

  useEffect(() => {
    if (level !== "prefectureDetail" && level !== "subDetail") {
      if (selectedPrefecture) setSelectedPrefecture(null);
      detailCacheRef.current = {};
    }
  }, [level, selectedPrefecture]);

  useEffect(() => {
    if (
      level !== "prefecture" &&
      level !== "prefectureDetail" &&
      level !== "subDetail" &&
      prefectureGeo
    ) {
      setPrefectureGeo(null);
    }
  }, [level, prefectureGeo]);

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
    if (level === "prefectureDetail" || level === "subDetail") {
      const prefToLoad = selectedPrefecture ?? centerPrefectureName;
      if (prefToLoad) return versionedUrl.prefectureDetail(prefToLoad);
      return null;
    }
    if (level === "japan") return versionedUrl.japan;
    return null;
  }, [level, centerPrefectureName, selectedPrefecture, versionedUrl]);

  function getVisiblePrefectures(
    map: L.Map,
    prefectureGeo: FeatureCollection<Geometry, JPProps>
  ): string[] {
    if (!map || !prefectureGeo) return [];
    const bounds = map.getBounds();
    const sw = [bounds.getSouthWest().lng, bounds.getSouthWest().lat];
    const ne = [bounds.getNorthEast().lng, bounds.getNorthEast().lat];
    const center = map.getCenter();
    const centerPoint: Point = [center.lng, center.lat];

    const features = prefectureGeo.features;
    const result: string[] = [];

    for (const feature of features) {
      // Check if feature contains the center point (handles large polygons covering the view)
      if (containsPointInFeature(feature, centerPoint)) {
        const name = getName(feature.properties ?? {});
        if (name) {
          result.push(name);
          continue; // Already added
        }
      }

      // Existing check: is any vertex inside the bounds?
      if (feature.geometry.type === "Polygon") {
        for (const ring of feature.geometry.coordinates as number[][][]) {
          for (const pt of ring) {
            if (
              pt[0] >= sw[0] &&
              pt[0] <= ne[0] &&
              pt[1] >= sw[1] &&
              pt[1] <= ne[1]
            ) {
              const name = getName(feature.properties ?? {});
              if (name) result.push(name);
              break;
            }
          }
        }
      } else if (feature.geometry.type === "MultiPolygon") {
        for (const poly of feature.geometry.coordinates as number[][][][]) {
          for (const ring of poly) {
            for (const pt of ring) {
              if (
                pt[0] >= sw[0] &&
                pt[0] <= ne[0] &&
                pt[1] >= sw[1] &&
                pt[1] <= ne[1]
              ) {
                const name = getName(feature.properties ?? {});
                if (name) result.push(name);
                break;
              }
            }
          }
        }
      }
    }
    return Array.from(new Set(result.filter((v): v is string => !!v)));
  }

  useEffect(() => {
    setGeo(null);
    const controller = new AbortController();
    let isActive = true;

    if (!geographyUrl) {
      isActive = false;
      controller.abort();
      return;
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

    if (
      (level === "prefectureDetail" || level === "subDetail") &&
      prefectureGeo &&
      mapRef.current
    ) {
      const visiblePrefs = getVisiblePrefectures(mapRef.current, prefectureGeo);
      const uncachedPrefs = visiblePrefs.filter(
        (pref): pref is string =>
          !!pref && detailCacheRef.current[pref] === undefined
      );
      Promise.all(
        uncachedPrefs.map((pref) =>
          typeof pref === "string"
            ? fetch(versionedUrl.prefectureDetail(pref), {
              cache: "no-store",
              signal: controller.signal,
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => {
                if (!isActive || !data) return null;
                const collection = parseMapData(data);
                detailCacheRef.current[pref] = collection;
                return collection;
              })
              .catch(() => null)
            : Promise.resolve(null)
        )
      ).then(() => {
        if (!isActive) return;
        const allCollections = visiblePrefs
          .map((pref) => (pref ? detailCacheRef.current[pref] : null))
          .filter((c): c is FeatureCollection<Geometry, JPProps> => !!c);
        const merged: FeatureCollection<Geometry, JPProps> = {
          type: "FeatureCollection",
          features: allCollections.flatMap((c) => c.features),
        };
        setGeo(merged);
      });
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
        if (level === "prefectureDetail") {
          const key = selectedPrefecture ?? centerPrefectureName;
          if (key) {
            detailCacheRef.current[key] = collection;
          }
        }
        setGeo(collection);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
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
    versionedUrl,
    selectedPrefecture
  ]);

  // --- Handlers ---

  const handleClick = (
    props: Record<string, unknown>,
    feature: RsmGeo,
    layer: L.Layer
  ) => {
    if (!onPick && !onPickPref) return;
    const region = getRegionName(props);
    const pref = getPrefName(props) ?? region;

    if (level === "regions") {
      onPick?.(region ?? null);
    } else if (level === "prefecture") {
      if (onPickPref) onPickPref(pref ?? null);
      else onPick?.(pref ?? null);
    } else {
      if (onPickPref) onPickPref(pref ?? null);
      else onPick?.(pref ?? null);
    }

    if (pref && level !== "regions") {
      setSelectedPrefecture(pref);
    }

    if (feature) {
      try {
        const [lon, lat] = geoCentroid(feature);
        const targetLatLng: [number, number] = [lat, lon];

        // Determine effective max zoom
        const effectiveMaxZoom = maxZoom;

        let targetZoom: number;
        if (level === "regions") {
          targetZoom = Math.min(
            Math.max(zoom, thresholds.regionsToPrefUp + 1.0),
            effectiveMaxZoom
          );
        } else if (level === "prefecture") {
          targetZoom = Math.min(
            Math.max(zoom, thresholds.prefToDetailUp + 0.5),
            effectiveMaxZoom
          );
        } else if (level === "prefectureDetail") {
          targetZoom = Math.min(
            Math.max(zoom, 10.5),
            effectiveMaxZoom
          );
        } else {
          // Gentler zoom increment for deep levels
          targetZoom = Math.min(zoom + 0.5, effectiveMaxZoom);
        }

        setCenter(targetLatLng);
        setZoom(targetZoom);
      } catch {
        // ignore
      }
    }
  };

  const styleFeature = (feature: Feature<Geometry, JPProps> | undefined) => {
    const props = (feature?.properties ?? {}) as Record<string, unknown>;
    const name = getName(props);
    const selected = !!(value && name && value === name);
    return {
      fillColor: selected ? "#dbeafe" : "#f1f5f9",
      color: "#4f46e5",
      weight: selected ? 2 : 0.8,
      opacity: 1,
      fillOpacity: selected ? 0.5 : 0.3,
    };
  };

  // --- Render GeoJSON Manually ---
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing layer if any
    if (geoLayerRef.current) {
      geoLayerRef.current.remove();
      geoLayerRef.current = null;
    }

    if (geo) {
      const layer = L.geoJSON(geo, {
        style: (feature) => styleFeature(feature as RsmGeo),
        onEachFeature: (feature, layer) => {
          layer.on("click", (e) => {
            handleClick(feature.properties ?? {}, feature as RsmGeo, layer);
            // Stop propagation to avoid map generic click events if needed
            // L.DomEvent.stopPropagation(e);
          });
        }
      }).addTo(mapRef.current);
      geoLayerRef.current = layer;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, value]);


  const { width = 520, height = 420 } = mapDimensions ?? {};
  const wrapperClass = mapWrapperClassName ?? "relative w-full h-full";
  const sectionClass = panelClassName ?? "relative w-full h-full";
  const targetLevelName =
    level === "regions"
      ? "地方"
      : level === "prefecture"
        ? "都道府県"
        : "市区町村";

  return (
    <section className={sectionClass}>
      {showControls && (
        <div className="absolute right-4 top-4 z-20 rounded-2xl bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 shadow backdrop-blur">
          {targetLevelName}
        </div>
      )}
      <div
        ref={containerRef}
        className={wrapperClass}
        style={{
          width: width || "100%",
          height: height || "100%",
          minHeight: 300,
          ...mapStyle,
        }}
      />
    </section>
  );
}
