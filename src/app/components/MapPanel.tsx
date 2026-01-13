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
  useMap,
} from "react-leaflet";
import { feature as topojsonFeature } from "topojson-client";
import type {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import type { LatLngExpression, LeafletEvent, Map } from "leaflet";
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
  // より高いズーム倍率でのみレベルが切り替わるように調整
  regionsToPrefUp: 8.5, // 地方→都道府県
  regionsToPrefDown: 7.0, // 都道府県→地方
  prefToJapanUp: 16, // 都道府県→日本全体
  prefToJapanDown: 15, // 日本全体→都道府県
  prefToDetailUp: 12, // 都道府県→市区町村
  prefToDetailDown: 12, // 市区町村→都道府県
  detailToJapanDown: 14, // 市区町村→日本全体
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

/**
 * SyncView
 * - MapContainer に対して外部から center/zoom を制御するための小コンポーネント。
 * - center/zoom が変化したら map.setView を呼んで地図を移動させる。
 */
function SyncView({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}): ReactElement | null {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    try {
      map.setView(center, zoom, { animate: true });
    } catch {
      // ignore
    }
  }, [map, center, zoom]);
  return null;
}

/**
 * MapController
 * - MapContainer 内で useMap() を使い、親コンポーネントの mapRef をセットする小コンポーネント
 * - クリック時などに即時 setView を行うために map インスタンスへアクセスできるようにする
 */
function MapController({
  onMapReady,
}: {
  onMapReady: (map: Map | null) => void;
}): ReactElement | null {
  const map = useMap();
  useEffect(() => {
    onMapReady(map ?? null);
    return () => {
      onMapReady(null);
    };
  }, [map, onMapReady]);
  return null;
}

type Level = "regions" | "prefecture" | "prefectureDetail" | "japan";

function determineLevel(zoom: number, thresholds: ZoomThresholds): Level {
  // レベル判定は「ズーム倍率だけ」に基づく（要件どおり）
  if (zoom >= thresholds.prefToJapanUp) return "japan";
  if (zoom >= thresholds.prefToDetailUp) return "prefectureDetail";
  if (zoom >= thresholds.regionsToPrefUp) return "prefecture";
  return "regions";
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
  // 明示的にクリックで選択された都道府県を追跡する。これにより、
  // クリックによって都道府県詳細タイルをロードするトリガーを明確にできる。
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(
    null
  );
  // Leaflet map インスタンスを保持する ref（クリックで即座に setView するため）
  const mapRef = useRef<Map | null>(null);
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
    // レベル判定はズーム倍率のみで決定する
    if (z >= t.prefToJapanUp) return "japan";
    if (z >= t.prefToDetailUp) return "prefectureDetail";
    if (z >= t.regionsToPrefUp) return "prefecture";
    return "regions";
  }, [zoom, thresholds]);
  // prefectureDetail以外のレベルになったら都道府県選択状態とキャッシュを必ず解除
  useEffect(() => {
    if (level !== "prefectureDetail") {
      if (selectedPrefecture) setSelectedPrefecture(null);
      // 詳細キャッシュもクリア（prefectureDetail以外では不要なため）
      detailCacheRef.current = {};
    }
  }, [level, selectedPrefecture]);

  // 都道府県レベル以外になったらprefectureGeoもリセット
  useEffect(() => {
    if (
      level !== "prefecture" &&
      level !== "prefectureDetail" &&
      prefectureGeo
    ) {
      setPrefectureGeo(null);
    }
  }, [level, prefectureGeo]);

  // デバッグ: レベル・ズーム変化をコンソールに出力（開発時のみ有効化すると原因追跡がしやすい）
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug("[MapPanel] level change", {
      level,
      zoom,
      center,
      selectedPrefecture,
    });
  }, [level, zoom, center, selectedPrefecture]);

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
    if (level === "prefectureDetail") {
      // クリックで選択された都道府県を優先して読み込む。なければ中心位置から推定した名前を使用。
      const prefToLoad = selectedPrefecture ?? centerPrefectureName;
      if (prefToLoad) return versionedUrl.prefectureDetail(prefToLoad);
      return null;
    }
    if (level === "japan") return versionedUrl.japan;
    return null;
  }, [level, centerPrefectureName, selectedPrefecture, versionedUrl]);

  // 画面内の都道府県名リスト取得関数
  function getVisiblePrefectures(
    map: Map,
    prefectureGeo: FeatureCollection<Geometry, JPProps>
  ): string[] {
    if (!map || !prefectureGeo) return [];
    const bounds = map.getBounds();
    const sw = [bounds.getSouthWest().lng, bounds.getSouthWest().lat];
    const ne = [bounds.getNorthEast().lng, bounds.getNorthEast().lat];
    const features = prefectureGeo.features;
    const result: string[] = [];
    for (const feature of features) {
      if (feature.geometry.type === "Polygon") {
        for (const ring of feature.geometry.coordinates as number[][][]) {
          for (const pt of ring) {
            if (
              pt[0] >= sw[0] &&
              pt[0] <= ne[0] &&
              pt[1] >= sw[1] &&
              pt[1] <= ne[1]
            ) {
              const name = getName(feature.properties);
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
                const name = getName(feature.properties);
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
    // レベルやデータソースが変わったら必ずgeoをリセット
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

    // 都道府県詳細レベルで画面内全都道府県を取得
    if (level === "prefectureDetail" && prefectureGeo && mapRef.current) {
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
          // cache using explicitly selected prefecture when available,
          // otherwise fall back to the center-inferred prefecture name.
          const key = selectedPrefecture ?? centerPrefectureName;
          if (key) {
            detailCacheRef.current[key] = collection;
          }
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

  const handleClick = (
    props: Record<string, unknown>,
    feature?: RsmGeo,
    layer?: unknown
  ) => {
    // 名前を先に決定
    const region = getRegionName(props);
    const pref = getPrefName(props) ?? region;
    if (level === "regions") {
      onPick(region ?? null);
    } else if (level === "prefecture") {
      if (onPickPref) onPickPref(pref ?? null);
      else onPick(pref ?? null);
    } else {
      if (onPickPref) onPickPref(pref ?? null);
      else onPick(pref ?? null);
    }
    // クリックで都道府県名が得られたら（都道府県表示または詳細表示時のみ）明示的に選択状態にする
    // 地方レベルでのクリックは selectedPrefecture に設定しない（存在しない都道府県ファイルを参照するのを防ぐ）
    if (pref && level !== "regions") {
      setSelectedPrefecture(pref);
    }

    if (feature) {
      try {
        const [lon, lat] = geoCentroid(feature);
        const targetLatLng: [number, number] = [lat, lon];

        // 現在の zoom を元に目標ズームを計算する（状態更新の遅延によらず即時に計算）
        let targetZoom: number;
        if (level === "regions") {
          // 地方クリック時はより大きくズームして都道府県表示に移行させる
          targetZoom = Math.min(
            Math.max(zoom, thresholds.regionsToPrefUp + 1.5),
            maxZoom
          );
        } else if (level === "prefecture") {
          targetZoom = Math.min(
            Math.max(zoom, thresholds.prefToDetailUp + 0.5),
            maxZoom
          );
        } else if (level === "prefectureDetail") {
          targetZoom = Math.min(
            Math.max(zoom, thresholds.prefToJapanUp + 0.5),
            maxZoom
          );
        } else {
          targetZoom = Math.min(zoom * 1.2, maxZoom);
        }

        // 状態を更新して、即座に map.setView を呼ぶ（これで既にズーム済みの別都道府県クリックでも移動する）
        setCenter(targetLatLng);
        setZoom(targetZoom);
        try {
          if (mapRef.current && typeof mapRef.current.setView === "function") {
            mapRef.current.setView(targetLatLng, targetZoom, { animate: true });
          }
        } catch {
          // ignore map errors
        }
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
      fillOpacity: selected ? 0.5 : 0.3,
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
          <MapController
            onMapReady={(m) => {
              mapRef.current = m;
            }}
          />
          <SyncView center={[center[0], center[1]]} zoom={zoom} />
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
              // 修正: keyを追加して、データソースが変わるたびに再描画させる
              key={geographyUrl ?? level}
              data={geo}
              style={styleFeature}
              onEachFeature={(feature, layer) => {
                layer.on("click", (e) =>
                  handleClick(feature.properties ?? {}, feature, layer)
                );
              }}
            />
          )}
        </MapContainer>
      </div>
    </section>
  );
}
