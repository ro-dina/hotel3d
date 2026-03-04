"use client";

import FallbackImage from "./components/FallbackImage";
import dynamic from "next/dynamic";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import type { Hotel } from "@/types/Hotel";

const MapPanel = dynamic(() => import("./components/MapPanel.client"), {
  ssr: false,
});

const PREF_TO_REGION: Record<string, string> = {
  北海道: "北海道",
  青森県: "東北",
  岩手県: "東北",
  宮城県: "東北",
  秋田県: "東北",
  山形県: "東北",
  福島県: "東北",
  茨城県: "関東",
  栃木県: "関東",
  群馬県: "関東",
  埼玉県: "関東",
  千葉県: "関東",
  東京都: "関東",
  神奈川県: "関東",
  新潟県: "中部",
  富山県: "中部",
  石川県: "中部",
  福井県: "中部",
  山梨県: "中部",
  長野県: "中部",
  岐阜県: "中部",
  静岡県: "中部",
  愛知県: "中部",
  三重県: "近畿",
  滋賀県: "近畿",
  京都府: "近畿",
  大阪府: "近畿",
  兵庫県: "近畿",
  奈良県: "近畿",
  和歌山県: "近畿",
  鳥取県: "中国",
  島根県: "中国",
  岡山県: "中国",
  広島県: "中国",
  山口県: "中国",
  徳島県: "四国",
  香川県: "四国",
  愛媛県: "四国",
  高知県: "四国",
  福岡県: "九州",
  佐賀県: "九州",
  長崎県: "九州",
  熊本県: "九州",
  大分県: "九州",
  宮崎県: "九州",
  鹿児島県: "九州",
  沖縄県: "沖縄",
};

const REGION_ALIAS_TO_CANONICAL: Record<string, string> = {
  関西: "近畿",
  "北海道・東北": "東北",
};

const normalizeText = (value: string): string =>
  value.normalize("NFKC").toLowerCase().replace(/\s+/g, "").trim();

const normalizePrefectureName = (value: string): string =>
  value.replace(/(都|道|府|県)$/u, "").trim();

const canonicalizeRegionName = (value: string): string => {
  const trimmed = value.trim();
  return REGION_ALIAS_TO_CANONICAL[trimmed] ?? trimmed;
};

const REGION_NAMES = Array.from(
  new Set(
    Object.values(PREF_TO_REGION).map((region) =>
      canonicalizeRegionName(region),
    ),
  ),
);

const LOCATION_TOKEN_REGEX =
  /([一-龯々ぁ-んァ-ヶA-Za-z0-9]{1,16})(駅|市|区|町|村|空港|港)/gu;
const PLACE_SUFFIX_PATTERN = /(都|道|府|県|市|区|町|村|駅|空港|港)$/u;

const extractLocationTokensFromText = (text: string): string[] => {
  const tokens: string[] = [];
  for (const match of text.matchAll(LOCATION_TOKEN_REGEX)) {
    const base = (match[1] ?? "").trim();
    const suffix = (match[2] ?? "").trim();
    if (!base || !suffix) continue;
    tokens.push(base);
    tokens.push(`${base}${suffix}`);
  }
  return tokens;
};

type RemoteGeocodeItem = {
  lat?: string;
  lon?: string;
  class?: string;
  type?: string;
  display_name?: string;
  boundingbox?: string[];
};

type RemotePlaceFocus = {
  lat: number;
  lng: number;
  zoom: number;
  label: string;
};

const REMOTE_PLACE_TYPES = new Set([
  "city",
  "town",
  "village",
  "municipality",
  "suburb",
  "neighbourhood",
  "administrative",
  "quarter",
  "borough",
]);

const REMOTE_PLACE_CLASSES = new Set(["place", "boundary"]);

const zoomFromBoundingBox = (boundingbox?: string[]): number => {
  if (!boundingbox || boundingbox.length !== 4) return 10.8;
  const south = Number(boundingbox[0]);
  const north = Number(boundingbox[1]);
  const west = Number(boundingbox[2]);
  const east = Number(boundingbox[3]);
  if ([south, north, west, east].some((value) => Number.isNaN(value))) {
    return 10.8;
  }

  const latSpread = Math.abs(north - south);
  const lngSpread = Math.abs(east - west);
  const spread = Math.max(latSpread, lngSpread);

  if (spread > 4) return 7.2;
  if (spread > 2) return 8.2;
  if (spread > 1) return 9.0;
  if (spread > 0.5) return 10.0;
  if (spread > 0.2) return 10.8;
  return 11.6;
};

const keywordMatchesHotel = (hotel: Hotel, query: string): boolean => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return false;

  const haystack = normalizeText(
    [
      hotel.name,
      hotel.description,
      hotel.pref ?? "",
      hotel.region ?? "",
      hotel.type ?? "",
      hotel.city ?? "",
      hotel.admin1 ?? "",
      hotel.district ?? "",
      hotel.country ?? "",
      hotel.countryCode ?? "",
      ...(hotel.searchAliases ?? []),
    ].join(" "),
  );
  return haystack.includes(normalizedQuery);
};

const isLikelyLocalPlaceQuery = (
  query: string,
  locationHintTokens: string[],
): boolean => {
  const trimmed = query.trim();
  if (!trimmed) return false;
  if (PLACE_SUFFIX_PATTERN.test(trimmed)) return true;

  const normalizedQuery = normalizeText(trimmed);
  return locationHintTokens.some(
    (token) => normalizeText(token) === normalizedQuery,
  );
};

const resolvePlaceMatches = (query: string) => {
  const normalizedQuery = normalizeText(query);
  const normalizedKyoto = normalizeText("京都");

  if (normalizedQuery === normalizedKyoto) {
    return {
      prefectures: ["京都"],
      regions: ["近畿"],
    };
  }

  const prefMatches = Object.keys(PREF_TO_REGION)
    .filter((prefectureWithSuffix) => {
      const prefWithoutSuffix = normalizePrefectureName(prefectureWithSuffix);
      const normalizedWithSuffix = normalizeText(prefectureWithSuffix);
      const normalizedWithoutSuffix = normalizeText(prefWithoutSuffix);
      return (
        normalizedQuery.includes(normalizedWithSuffix) ||
        normalizedQuery.includes(normalizedWithoutSuffix)
      );
    })
    .map((prefectureWithSuffix) =>
      normalizePrefectureName(prefectureWithSuffix),
    );

  const regionMatches = REGION_NAMES.filter((regionName) => {
    const aliases = Object.entries(REGION_ALIAS_TO_CANONICAL)
      .filter(([, canonical]) => canonical === regionName)
      .map(([alias]) => alias);
    return [regionName, ...aliases].some((candidate) =>
      normalizedQuery.includes(normalizeText(candidate)),
    );
  });

  return {
    prefectures: Array.from(new Set(prefMatches)),
    regions: Array.from(new Set(regionMatches)),
  };
};

const hotelMatchesPlace = (
  hotel: Hotel,
  prefectures: string[],
  regions: string[],
) => {
  const hotelPref = normalizePrefectureName(hotel.pref ?? "");
  const hotelRegion = canonicalizeRegionName(hotel.region ?? "");
  return prefectures.includes(hotelPref) || regions.includes(hotelRegion);
};

const globalPlaceTokensFromHotel = (hotel: Hotel): string[] =>
  [
    hotel.country,
    hotel.countryCode,
    hotel.city,
    hotel.admin1,
    hotel.district,
    hotel.pref,
    hotel.region,
    ...(hotel.searchAliases ?? []),
  ]
    .map((value) => (value ? String(value).trim() : ""))
    .filter((value): value is string => value.length > 0);

const editDistance = (left: string, right: string): number => {
  const leftLen = left.length;
  const rightLen = right.length;
  if (leftLen === 0) return rightLen;
  if (rightLen === 0) return leftLen;

  const dp = Array.from({ length: leftLen + 1 }, () =>
    new Array<number>(rightLen + 1).fill(0),
  );

  for (let i = 0; i <= leftLen; i += 1) dp[i][0] = i;
  for (let j = 0; j <= rightLen; j += 1) dp[0][j] = j;

  for (let i = 1; i <= leftLen; i += 1) {
    for (let j = 1; j <= rightLen; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[leftLen][rightLen];
};

const tokensLikelySamePlace = (
  normalizedQuery: string,
  normalizedToken: string,
): boolean => {
  if (!normalizedQuery || !normalizedToken) return false;
  if (normalizedQuery === normalizedToken) return true;

  const queryLen = normalizedQuery.length;
  const tokenLen = normalizedToken.length;

  if (queryLen <= 2 || tokenLen <= 2) {
    return false;
  }

  if (
    queryLen >= 4 &&
    tokenLen >= 4 &&
    Math.abs(queryLen - tokenLen) <= 4 &&
    (normalizedToken.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedToken))
  ) {
    return true;
  }

  const maxLen = Math.max(queryLen, tokenLen);
  if (maxLen < 5) return false;

  const distance = editDistance(normalizedQuery, normalizedToken);
  if (maxLen <= 7) return distance <= 1;
  if (maxLen <= 11) return distance <= 2;
  return distance <= 3;
};

const hotelMatchesGlobalPlaceQuery = (hotel: Hotel, query: string): boolean => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return false;

  const tokens = globalPlaceTokensFromHotel(hotel);
  return tokens.some((token) => {
    const normalizedToken = normalizeText(token);
    return tokensLikelySamePlace(normalizedQuery, normalizedToken);
  });
};

const buildFocusLocationFromHotels = (
  targetHotels: Hotel[],
): { lat: number; lng: number; zoom: number } | null => {
  if (!targetHotels.length) return null;
  const validHotels = targetHotels.filter(
    (hotel) => Number.isFinite(hotel.lat) && Number.isFinite(hotel.lng),
  );
  if (!validHotels.length) return null;

  const latValues = validHotels.map((hotel) => hotel.lat).sort((a, b) => a - b);
  const lngValues = validHotels.map((hotel) => hotel.lng).sort((a, b) => a - b);

  const quantile = (values: number[], ratio: number): number => {
    if (!values.length) return 0;
    const index = Math.min(
      values.length - 1,
      Math.max(0, Math.floor((values.length - 1) * ratio)),
    );
    return values[index];
  };

  const centerLat = quantile(latValues, 0.5);
  const centerLng = quantile(lngValues, 0.5);
  const latSpread = Math.abs(
    quantile(latValues, 0.9) - quantile(latValues, 0.1),
  );
  const lngSpread = Math.abs(
    quantile(lngValues, 0.9) - quantile(lngValues, 0.1),
  );
  const spread = Math.max(latSpread, lngSpread);

  let zoom = 11.2;
  if (spread > 60) zoom = 2.2;
  else if (spread > 30) zoom = 3.2;
  else if (spread > 15) zoom = 4.2;
  else if (spread > 8) zoom = 5.2;
  else if (spread > 4) zoom = 6.2;
  else if (spread > 2) zoom = 7.2;
  else if (spread > 1) zoom = 8.2;
  else if (spread > 0.5) zoom = 9.2;
  else if (spread > 0.2) zoom = 10.2;

  return {
    lat: clampNumber(centerLat, -85, 85),
    lng: clampNumber(centerLng, -180, 180),
    zoom,
  };
};

const clampNumber = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const INITIAL_VISIBLE_HOTELS = 60;
const VISIBLE_HOTELS_STEP = 60;
const markerCapForZoom = (zoom: number): number => {
  if (zoom >= 11.5) return 1800;
  if (zoom >= 10) return 1400;
  if (zoom >= 8.5) return 1100;
  if (zoom >= 7) return 800;
  if (zoom >= 5.5) return 550;
  return 320;
};

const formatHotelLocation = (hotel: Hotel): string => {
  const primaryParts = [
    hotel.city,
    hotel.district,
    hotel.admin1 ?? hotel.pref,
    hotel.country,
  ].filter((value): value is string => !!value && value.trim().length > 0);

  if (primaryParts.length > 0) {
    return primaryParts.join("・");
  }

  const fallbackParts = [hotel.region, hotel.pref].filter(
    (value): value is string => !!value && value.trim().length > 0,
  );
  return fallbackParts.length > 0 ? fallbackParts.join("・") : "所在地不明";
};

export default function HomePage() {
  const [hotelsData, setHotelsData] = useState<Hotel[]>([]);
  const [isHotelsLoading, setIsHotelsLoading] = useState(true);
  const [hotelsError, setHotelsError] = useState<string | null>(null);

  const [region, setRegion] = useState<string | null>(null);
  const [prefecture, setPrefecture] = useState<string | null>(null);
  const [focusedHotelId, setFocusedHotelId] = useState<number | null>(null);
  const [focusLocation, setFocusLocation] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  const [useMapBounds, setUseMapBounds] = useState(false);
  const [mapZoom, setMapZoom] = useState<number>(4.5);

  // リサイズ制御
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startLeftRef = useRef(0);
  const [leftWidth, setLeftWidth] = useState<number | null>(null);
  const [isLarge, setIsLarge] = useState(false);

  // 一覧の幅に応じたカラム数制御
  const listRef = useRef<HTMLUListElement | null>(null);
  const [listWidth, setListWidth] = useState<number>(0);
  const cardMinWidth = 160; // 1枚あたりの理想的な最小幅
  const columns =
    Number.isFinite(listWidth) && listWidth > 0
      ? Math.max(1, Math.floor(listWidth / cardMinWidth))
      : 1;

  useEffect(() => {
    const check = () => setIsLarge(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isLarge) return;
    // 初期幅を設定（ビュー幅の60%）
    if (leftWidth === null) {
      setLeftWidth(Math.round(window.innerWidth * 0.6));
    }
  }, [isLarge, leftWidth]);

  // ResizeObserver で一覧コンテナの幅を監視
  useEffect(() => {
    if (!listRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setListWidth(w);
      }
    });
    ro.observe(listRef.current as Element);
    return () => ro.disconnect();
  }, [isLarge, leftWidth]);

  const onMove = useCallback((clientX: number) => {
    if (!draggingRef.current || !containerRef.current) return;
    const dx = clientX - startXRef.current;
    const newLeft = startLeftRef.current + dx;
    const min = 320; // 最小幅
    const max = Math.max(480, window.innerWidth - 320);
    const clamped = Math.max(min, Math.min(max, newLeft));
    setLeftWidth(clamped);
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => onMove(e.clientX),
    [onMove],
  );
  const onTouchMove = useCallback(
    (e: TouchEvent) => onMove(e.touches[0].clientX),
    [onMove],
  );

  useEffect(() => {
    const onUp = () => {
      if (draggingRef.current) draggingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
    return () => onUp();
  }, [onMouseMove, onTouchMove]);

  const startDrag = (clientX: number) => {
    draggingRef.current = true;
    startXRef.current = clientX;
    startLeftRef.current = leftWidth ?? Math.round(window.innerWidth * 0.6);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener(
      "mouseup",
      () => {
        draggingRef.current = false;
        window.removeEventListener("mousemove", onMouseMove);
      },
      { once: true },
    );
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener(
      "touchend",
      () => {
        draggingRef.current = false;
        window.removeEventListener("touchmove", onTouchMove);
      },
      { once: true },
    );
  };

  const onHandleMouseDown = (e: React.MouseEvent) => startDrag(e.clientX);
  const onHandleTouchStart = (e: React.TouchEvent) =>
    startDrag(e.touches[0].clientX);

  // ホテルデータ処理
  const { minPrice, maxPrice } = useMemo(() => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const hotel of hotelsData) {
      const price = Number(hotel.price);
      if (Number.isNaN(price)) continue;
      if (price < min) min = price;
      if (price > max) max = price;
    }

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { minPrice: 0, maxPrice: 0 };
    }

    return { minPrice: min, maxPrice: max };
  }, [hotelsData]);

  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [onlyBreakfast, setOnlyBreakfast] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"none" | "place" | "keyword">(
    "none",
  );
  const [searchPlacePrefs, setSearchPlacePrefs] = useState<string[]>([]);
  const [searchPlaceRegions, setSearchPlaceRegions] = useState<string[]>([]);
  const [searchPlaceHotelIds, setSearchPlaceHotelIds] = useState<number[]>([]);
  const [searchMatchedPlaceLabels, setSearchMatchedPlaceLabels] = useState<
    string[]
  >([]);
  const [visibleHotelCount, setVisibleHotelCount] = useState<number>(
    INITIAL_VISIBLE_HOTELS,
  );
  const syncingFromUrlRef = useRef(false);
  const remotePlaceCacheRef = useRef<Record<string, RemotePlaceFocus | null>>(
    {},
  );
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadHotels = async () => {
      try {
        setIsHotelsLoading(true);
        setHotelsError(null);
        const response = await fetch("/api/hotels", {
          cache: "force-cache",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as Hotel[];
        if (!isActive) return;
        setHotelsData(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isActive) return;
        if ((error as Error).name === "AbortError") return;
        setHotelsData([]);
        setHotelsError("ホテルデータの読み込みに失敗しました。");
      } finally {
        if (isActive) {
          setIsHotelsLoading(false);
        }
      }
    };

    void loadHotels();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  const locationHintTokens = useMemo(
    () =>
      Array.from(
        new Set(
          hotelsData.flatMap((hotel) => {
            const source = `${hotel.name} ${hotel.description}`;
            return extractLocationTokensFromText(source);
          }),
        ),
      ),
    [hotelsData],
  );

  const countryOptions = useMemo(() => {
    const codeToLabel = new Map<string, string>();

    for (const hotel of hotelsData) {
      const code = (hotel.countryCode ?? "JP").toUpperCase();
      const label = (
        hotel.country && hotel.country.trim().length > 0
          ? hotel.country
          : code === "JP"
            ? "Japan"
            : code
      ).trim();
      if (!codeToLabel.has(code)) {
        codeToLabel.set(code, label);
      }
    }

    return Array.from(codeToLabel.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([code, label]) => ({ code, label }));
  }, [hotelsData]);

  const resolveRemotePlaceFocus = useCallback(
    async (query: string): Promise<RemotePlaceFocus | null> => {
      const cacheKey = normalizeText(query);
      if (!cacheKey) return null;
      if (cacheKey in remotePlaceCacheRef.current) {
        return remotePlaceCacheRef.current[cacheKey];
      }

      try {
        const endpoint =
          "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=ja,en&q=" +
          encodeURIComponent(query);
        const response = await fetch(endpoint, {
          headers: {
            Accept: "application/json",
          },
        });
        if (!response.ok) {
          remotePlaceCacheRef.current[cacheKey] = null;
          return null;
        }

        const items = (await response.json()) as RemoteGeocodeItem[];
        const candidate = items.find((item) => {
          const itemType = (item.type ?? "").toLowerCase();
          const itemClass = (item.class ?? "").toLowerCase();
          return (
            REMOTE_PLACE_TYPES.has(itemType) ||
            REMOTE_PLACE_CLASSES.has(itemClass)
          );
        });

        if (!candidate?.lat || !candidate?.lon) {
          remotePlaceCacheRef.current[cacheKey] = null;
          return null;
        }

        const lat = Number(candidate.lat);
        const lng = Number(candidate.lon);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          remotePlaceCacheRef.current[cacheKey] = null;
          return null;
        }

        const placeFocus: RemotePlaceFocus = {
          lat,
          lng,
          zoom: zoomFromBoundingBox(candidate.boundingbox),
          label: candidate.display_name ?? query,
        };
        remotePlaceCacheRef.current[cacheKey] = placeFocus;
        return placeFocus;
      } catch {
        remotePlaceCacheRef.current[cacheKey] = null;
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!hotelsData.length) return;

    const shouldInitializeRange =
      priceMin === null ||
      priceMax === null ||
      (priceMin === 0 && priceMax === 0 && maxPrice > 0);

    if (shouldInitializeRange) {
      setPriceMin(minPrice);
      setPriceMax(maxPrice);
      return;
    }

    const clampedMin = clampNumber(priceMin, minPrice, maxPrice);
    const clampedMax = clampNumber(priceMax, minPrice, maxPrice);
    const nextMin = Math.min(clampedMin, clampedMax);
    const nextMax = Math.max(clampedMin, clampedMax);

    if (nextMin !== priceMin || nextMax !== priceMax) {
      setPriceMin(nextMin);
      setPriceMax(nextMax);
    }
  }, [hotelsData, minPrice, maxPrice, priceMin, priceMax]);

  const clearAllFilters = useCallback(() => {
    setPrefecture(null);
    setRegion(null);
    setPriceMin(minPrice);
    setPriceMax(maxPrice);
    setOnlyBreakfast(false);
    setTypeFilter("");
    setCountryFilter("");
    setUseMapBounds(false);
    setMapBounds(null);
    setSearchInput("");
    setSearchQuery("");
    setSearchMode("none");
    setSearchPlacePrefs([]);
    setSearchPlaceRegions([]);
    setSearchPlaceHotelIds([]);
    setSearchMatchedPlaceLabels([]);
  }, [maxPrice, minPrice]);

  const clearSearchOnly = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setSearchMode("none");
    setSearchPlacePrefs([]);
    setSearchPlaceRegions([]);
    setSearchPlaceHotelIds([]);
    setSearchMatchedPlaceLabels([]);
  }, []);

  const applySearch = useCallback(
    async (inputValue: string) => {
      const requestId = ++searchRequestIdRef.current;
      const trimmed = inputValue.trim();
      setSearchQuery(trimmed);

      if (!hotelsData.length) {
        setSearchMode("none");
        setSearchPlacePrefs([]);
        setSearchPlaceRegions([]);
        setSearchPlaceHotelIds([]);
        setSearchMatchedPlaceLabels([]);
        return;
      }

      if (trimmed) {
        setUseMapBounds(false);
        setPrefecture(null);
        setRegion(null);
        setCountryFilter("");
      }

      if (!trimmed) {
        setSearchMode("none");
        setSearchPlacePrefs([]);
        setSearchPlaceRegions([]);
        setSearchPlaceHotelIds([]);
        setSearchMatchedPlaceLabels([]);
        return;
      }

      const matchedPlaces = resolvePlaceMatches(trimmed);
      const globalPlaceMatchedHotels = hotelsData.filter((hotel) =>
        hotelMatchesGlobalPlaceQuery(hotel, trimmed),
      );
      const globalPlaceMatchedIds = globalPlaceMatchedHotels.map(
        (hotel) => hotel.id,
      );

      const hasPlaceMatch =
        matchedPlaces.prefectures.length > 0 ||
        matchedPlaces.regions.length > 0 ||
        globalPlaceMatchedIds.length > 0;

      if (hasPlaceMatch) {
        setSearchMode("place");
        setSearchPlacePrefs(matchedPlaces.prefectures);
        setSearchPlaceRegions(matchedPlaces.regions);
        setSearchPlaceHotelIds(globalPlaceMatchedIds);
        const globalLabels = Array.from(
          new Set(
            globalPlaceMatchedHotels.flatMap((hotel) => {
              const labels = [hotel.city, hotel.admin1, hotel.country].filter(
                (value): value is string => !!value,
              );
              return labels;
            }),
          ),
        );
        setSearchMatchedPlaceLabels([
          ...matchedPlaces.prefectures,
          ...matchedPlaces.regions,
          ...globalLabels,
        ]);

        const placeMatchedHotels =
          globalPlaceMatchedHotels.length > 0
            ? globalPlaceMatchedHotels
            : hotelsData.filter((hotel) =>
                hotelMatchesPlace(
                  hotel,
                  matchedPlaces.prefectures,
                  matchedPlaces.regions,
                ),
              );
        const nextFocus = buildFocusLocationFromHotels(placeMatchedHotels);
        if (nextFocus) {
          setFocusedHotelId(null);
          setFocusLocation(nextFocus);
        }
        return;
      }

      setSearchMode("keyword");
      setSearchPlacePrefs([]);
      setSearchPlaceRegions([]);
      setSearchPlaceHotelIds([]);
      setSearchMatchedPlaceLabels([]);

      const keywordMatchedHotels = hotelsData.filter((hotel) =>
        keywordMatchesHotel(hotel, trimmed),
      );

      if (
        isLikelyLocalPlaceQuery(trimmed, locationHintTokens) &&
        keywordMatchedHotels.length > 0
      ) {
        const nextFocus = buildFocusLocationFromHotels(keywordMatchedHotels);
        if (nextFocus) {
          setFocusedHotelId(null);
          setFocusLocation(nextFocus);
        }
        return;
      }

      const remotePlace = await resolveRemotePlaceFocus(trimmed);
      if (requestId !== searchRequestIdRef.current) {
        return;
      }
      if (!remotePlace) {
        return;
      }

      if (keywordMatchedHotels.length > 0) {
        const nextFocus = buildFocusLocationFromHotels(keywordMatchedHotels);
        if (nextFocus) {
          setFocusedHotelId(null);
          setFocusLocation(nextFocus);
        }
        setSearchMatchedPlaceLabels([trimmed]);
        return;
      }

      setFocusedHotelId(null);
      setFocusLocation({
        lat: remotePlace.lat,
        lng: remotePlace.lng,
        zoom: remotePlace.zoom,
      });
      setSearchMatchedPlaceLabels([remotePlace.label]);
    },
    [hotelsData, locationHintTokens, resolveRemotePlaceFocus],
  );

  useEffect(() => {
    if (!hotelsData.length || !searchQuery.trim()) return;
    void applySearch(searchQuery);
  }, [hotelsData, searchQuery, applySearch]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);

      syncingFromUrlRef.current = true;

      const nextQuery = (params.get("q") ?? "").trim();
      setSearchInput(nextQuery);
      void applySearch(nextQuery);

      const nextPrefecture = params.get("pref")?.trim() || null;
      const nextRegionRaw = params.get("region")?.trim() || null;
      const nextRegion = nextRegionRaw
        ? canonicalizeRegionName(nextRegionRaw)
        : null;
      setPrefecture(nextPrefecture);
      setRegion(nextRegion);

      const minParam = params.get("min");
      const maxParam = params.get("max");
      const parsedMin = minParam !== null ? Number(minParam) : NaN;
      const parsedMax = maxParam !== null ? Number(maxParam) : NaN;
      const nextMin = Number.isFinite(parsedMin)
        ? clampNumber(parsedMin, minPrice, maxPrice)
        : minPrice;
      const nextMax = Number.isFinite(parsedMax)
        ? clampNumber(parsedMax, minPrice, maxPrice)
        : maxPrice;
      setPriceMin(Math.min(nextMin, nextMax));
      setPriceMax(Math.max(nextMin, nextMax));

      const breakfastParam = params.get("breakfast");
      setOnlyBreakfast(breakfastParam === "1" || breakfastParam === "true");

      const typeParam = params.get("type")?.trim() ?? "";
      setTypeFilter(typeParam);

      const countryParam = params.get("country")?.trim().toUpperCase() ?? "";
      setCountryFilter(countryParam);

      syncingFromUrlRef.current = false;
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [applySearch, minPrice, maxPrice]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (syncingFromUrlRef.current) {
      return;
    }

    const nextParams = new URLSearchParams(window.location.search);
    const nextQuery = searchQuery.trim();

    if (nextQuery) {
      nextParams.set("q", nextQuery);
    } else {
      nextParams.delete("q");
    }

    if (prefecture) {
      nextParams.set("pref", prefecture);
    } else {
      nextParams.delete("pref");
    }

    if (region) {
      nextParams.set("region", canonicalizeRegionName(region));
    } else {
      nextParams.delete("region");
    }

    if (priceMin != null && priceMin !== minPrice) {
      nextParams.set("min", String(priceMin));
    } else {
      nextParams.delete("min");
    }

    if (priceMax != null && priceMax !== maxPrice) {
      nextParams.set("max", String(priceMax));
    } else {
      nextParams.delete("max");
    }

    if (onlyBreakfast) {
      nextParams.set("breakfast", "1");
    } else {
      nextParams.delete("breakfast");
    }

    if (typeFilter) {
      nextParams.set("type", typeFilter);
    } else {
      nextParams.delete("type");
    }

    if (countryFilter) {
      nextParams.set("country", countryFilter);
    } else {
      nextParams.delete("country");
    }

    const nextQueryString = nextParams.toString();
    const currentQueryString = window.location.search.replace(/^\?/, "");
    if (currentQueryString === nextQueryString) {
      return;
    }

    const nextUrl = `${window.location.pathname}${
      nextQueryString ? `?${nextQueryString}` : ""
    }${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [
    searchQuery,
    prefecture,
    region,
    priceMin,
    priceMax,
    minPrice,
    maxPrice,
    onlyBreakfast,
    typeFilter,
    countryFilter,
  ]);

  const hotels = useMemo(() => {
    const normalize = (s: string | null | undefined) => {
      if (!s) return null;
      const v = String(s).trim();
      return v.replace(/(都|府|県)$/, "");
    };

    const selPrefNorm = normalize(prefecture);
    let base = selPrefNorm
      ? hotelsData.filter((hotel) => {
          const hNorm = normalize(hotel.pref);
          return hNorm === selPrefNorm;
        })
      : region
        ? hotelsData.filter((hotel) => hotel.region === region)
        : hotelsData;

    if (priceMin != null && priceMax != null) {
      base = base.filter((h) => h.price >= priceMin && h.price <= priceMax);
    }

    if (onlyBreakfast) {
      base = base.filter((h) => h.breakfast);
    }

    if (typeFilter) {
      base = base.filter((h) => h.type === typeFilter);
    }

    if (countryFilter) {
      base = base.filter(
        (h) => (h.countryCode ?? "JP").toUpperCase() === countryFilter,
      );
    }

    if (useMapBounds && mapBounds) {
      base = base.filter(
        (h) =>
          h.lat <= mapBounds.north &&
          h.lat >= mapBounds.south &&
          h.lng <= mapBounds.east &&
          h.lng >= mapBounds.west,
      );
    }

    if (
      searchMode === "place" &&
      (searchPlaceHotelIds.length ||
        searchPlacePrefs.length ||
        searchPlaceRegions.length)
    ) {
      if (searchPlaceHotelIds.length > 0) {
        const ids = new Set(searchPlaceHotelIds);
        base = base.filter((hotel) => ids.has(hotel.id));
      } else {
        base = base.filter((hotel) =>
          hotelMatchesPlace(hotel, searchPlacePrefs, searchPlaceRegions),
        );
      }
    }

    if (searchMode === "keyword" && searchQuery) {
      base = base.filter((hotel) => keywordMatchesHotel(hotel, searchQuery));
    }

    return base;
  }, [
    region,
    prefecture,
    priceMin,
    priceMax,
    onlyBreakfast,
    typeFilter,
    countryFilter,
    useMapBounds,
    mapBounds,
    searchMode,
    searchPlaceHotelIds,
    searchPlacePrefs,
    searchPlaceRegions,
    searchQuery,
    hotelsData,
  ]);

  useEffect(() => {
    setVisibleHotelCount(INITIAL_VISIBLE_HOTELS);
  }, [
    region,
    prefecture,
    priceMin,
    priceMax,
    onlyBreakfast,
    typeFilter,
    countryFilter,
    useMapBounds,
    mapBounds,
    searchMode,
    searchPlaceHotelIds,
    searchPlacePrefs,
    searchPlaceRegions,
    searchQuery,
  ]);

  const displayHotels = useMemo(() => {
    if (hotels.length > 0) return hotels;
    if (mapBounds) {
      const inViewport = hotelsData.filter(
        (hotel) =>
          hotel.lat <= mapBounds.north &&
          hotel.lat >= mapBounds.south &&
          hotel.lng <= mapBounds.east &&
          hotel.lng >= mapBounds.west,
      );
      if (inViewport.length > 0) return inViewport;
    }
    return hotelsData;
  }, [hotels, hotelsData, mapBounds]);

  const renderedHotels = useMemo(
    () => displayHotels.slice(0, visibleHotelCount),
    [displayHotels, visibleHotelCount],
  );

  const markers = useMemo(() => {
    const baseCap = markerCapForZoom(mapZoom);
    const maxMapMarkers =
      searchMode !== "none" ? Math.max(baseCap, 2000) : baseCap;

    const isInBounds = (hotel: Hotel) => {
      if (!mapBounds) return true;
      return (
        hotel.lat <= mapBounds.north &&
        hotel.lat >= mapBounds.south &&
        hotel.lng <= mapBounds.east &&
        hotel.lng >= mapBounds.west
      );
    };

    const inViewportFiltered = hotels.filter(isInBounds);
    const inViewportAll = hotelsData.filter(isInBounds);
    let source =
      inViewportFiltered.length > 0
        ? inViewportFiltered
        : inViewportAll.length > 0
          ? inViewportAll
          : hotels.length > 0
            ? hotels
            : hotelsData;

    if (searchMode !== "none" && focusLocation) {
      const distance2 = (hotel: Hotel) => {
        const dLat = hotel.lat - focusLocation.lat;
        const dLng = hotel.lng - focusLocation.lng;
        return dLat * dLat + dLng * dLng;
      };
      source = [...source].sort(
        (left, right) => distance2(left) - distance2(right),
      );
    }

    if (!source.length) return [];

    if (source.length <= maxMapMarkers) {
      return source.map((hotel) => ({
        id: hotel.id,
        lat: hotel.lat,
        lng: hotel.lng,
        label: hotel.name,
        subLabel: formatHotelLocation(hotel),
        price: hotel.price,
        href: `/hotel/${hotel.id}`,
      }));
    }

    const sampled: typeof source = [];
    const step = Math.max(1, Math.floor(source.length / maxMapMarkers));
    for (let index = 0; index < source.length; index += step) {
      sampled.push(source[index]);
      if (sampled.length >= maxMapMarkers) break;
    }

    return sampled.map((hotel) => ({
      id: hotel.id,
      lat: hotel.lat,
      lng: hotel.lng,
      label: hotel.name,
      subLabel: formatHotelLocation(hotel),
      price: hotel.price,
      href: `/hotel/${hotel.id}`,
    }));
  }, [hotels, hotelsData, mapBounds, mapZoom, searchMode, focusLocation]);

  const handleHotelFocus = useCallback((hotel: Hotel) => {
    setFocusedHotelId(hotel.id);
    setFocusLocation({ lat: hotel.lat, lng: hotel.lng, zoom: 9.5 });
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const counts = new Map<number, number>();
    for (const h of hotels) counts.set(h.id, (counts.get(h.id) ?? 0) + 1);
    const dups = Array.from(counts.entries())
      .filter(([, c]) => c > 1)
      .map(([id]) => id);
    if (dups.length)
      console.warn("[HomePage] Duplicate hotel ids detected:", dups);
  }, [hotels]);

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <div
        ref={containerRef}
        className="h-screen w-full grid grid-cols-1 lg:grid-cols-1"
        style={
          isLarge && leftWidth
            ? { gridTemplateColumns: `${leftWidth}px 1fr` }
            : undefined
        }
      >
        <div className="relative h-[40vh] w-full lg:h-screen lg:sticky lg:top-0">
          {/* リサイズハンドル（ラージ画面時のみ表示） */}
          <div
            onMouseDown={onHandleMouseDown}
            onTouchStart={onHandleTouchStart}
            className="hidden lg:block absolute -right-1 top-0 h-full w-2 cursor-col-resize z-50"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panel"
          />

          <Suspense
            fallback={
              <div
                className="h-full w-full bg-gradient-to-b from-slate-100 via-sky-100 to-slate-200 dark:from-slate-950 dark:via-sky-900 dark:to-slate-900"
                aria-hidden="true"
              />
            }
          >
            <MapPanel
              key="static-map"
              value={prefecture ?? region}
              onPick={(regionName) => {
                setPrefecture(null);
                setRegion(regionName);
              }}
              onPickPref={(pref: string | null) => {
                setPrefecture(pref);
                if (pref) {
                  setRegion(PREF_TO_REGION[pref] ?? pref);
                } else {
                  setRegion(null);
                }
              }}
              markers={markers}
              selectedMarkerId={focusedHotelId}
              focusLocation={focusLocation}
              showMarkersAtZoom={5.5}
              onViewportChange={(bounds) => setMapBounds(bounds)}
              onZoomChange={(zoom) => setMapZoom(zoom)}
              maxZoom={20}
              panelClassName="absolute inset-0"
              mapWrapperClassName="absolute inset-0"
              mapStyle={{ width: "100%", height: "100%" }}
              emphasizeMarkers={searchMode !== "none" && !!searchQuery}
              showControls
            />
          </Suspense>
        </div>

        <div className="flex w-full flex-col overflow-y-auto bg-[var(--surface-soft)] px-2 py-2 lg:px-3 lg:py-3">
          <div className="flex flex-1 flex-col gap-3">
            <section className="pointer-events-auto bg-transparent p-0">
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  void applySearch(searchInput);
                }}
              >
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="地名やキーワードで検索（例: 京都 / 海）"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted-foreground)] focus:border-indigo-300"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-lg border border-indigo-300 bg-indigo-500/20 px-3 py-1.5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/30"
                  >
                    検索
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearchOnly}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-slate-300 hover:text-[var(--foreground)]"
                    >
                      検索クリア
                    </button>
                  )}
                </div>
              </form>

              {searchQuery && (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {searchMode === "place"
                    ? `地名検索: ${searchMatchedPlaceLabels.join(" / ")} 周辺を表示`
                    : `キーワード検索: 「${searchQuery}」に一致するホテルを表示`}
                </p>
              )}
              {hotelsError && (
                <p className="mt-1 text-xs text-rose-400">{hotelsError}</p>
              )}

              <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
                {(region || prefecture || searchQuery || countryFilter) && (
                  <button
                    type="button"
                    className="rounded-full border border-indigo-300 bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:border-indigo-400/80 dark:bg-indigo-500/20 dark:text-indigo-200"
                    onClick={clearAllFilters}
                  >
                    フィルタ解除
                  </button>
                )}
              </div>
            </section>

            <section className="pointer-events-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 shadow-[0_10px_30px_rgba(2,6,23,0.2)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.55)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground-strong)]">
                    {prefecture
                      ? `${prefecture}のホテル`
                      : region
                        ? `${region}のホテル`
                        : "全国の宿泊施設"}
                  </p>
                  <h2 className="mt-0.5 text-xl font-semibold text-[var(--foreground)]">
                    {prefecture
                      ? `${prefecture}の宿泊施設一覧`
                      : region
                        ? `${region}の宿泊施設一覧`
                        : "選りすぐりの宿泊施設をチェック"}
                  </h2>
                  {isHotelsLoading && (
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      ホテルデータを読み込み中...
                    </p>
                  )}
                </div>
                {(region || prefecture || countryFilter) && (
                  <button
                    type="button"
                    className="text-sm font-medium text-indigo-600 underline dark:text-indigo-300"
                    onClick={clearAllFilters}
                  >
                    クリア
                  </button>
                )}
              </div>

              {/* 価格範囲フィルタ（下限・上限の2つのつまみ） */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <div>価格下限: ¥{priceMin?.toLocaleString()}</div>
                  <div>価格上限: ¥{priceMax?.toLocaleString()}</div>
                </div>
                <div className="mt-1 space-y-1">
                  <div className="relative h-8">
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      step={1000}
                      value={priceMin ?? minPrice}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        const maxV = priceMax ?? maxPrice;
                        const newMin = Math.min(v, maxV);
                        setPriceMin(newMin);
                      }}
                      style={{ top: "0px" }}
                      className="absolute left-0 right-0 w-full appearance-none bg-transparent z-20"
                    />
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      step={1000}
                      value={priceMax ?? maxPrice}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        const minV = priceMin ?? minPrice;
                        const newMax = Math.max(v, minV);
                        setPriceMax(newMax);
                      }}
                      style={{ top: "12px" }}
                      className="absolute left-0 right-0 w-full appearance-none bg-transparent z-10"
                    />
                    <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div
                      className="absolute top-1/2 h-1 -translate-y-1/2 bg-indigo-500 rounded"
                      style={{
                        left: `${
                          (((priceMin ?? minPrice) - minPrice) /
                            (maxPrice - minPrice)) *
                          100
                        }%`,
                        right: `${
                          100 -
                          (((priceMax ?? maxPrice) - minPrice) /
                            (maxPrice - minPrice)) *
                            100
                        }%`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 w-3 h-3 bg-slate-900 dark:bg-white rounded-full shadow -translate-y-1/2"
                      style={{
                        left: `${
                          (((priceMin ?? minPrice) - minPrice) /
                            (maxPrice - minPrice)) *
                          100
                        }%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                    <div
                      className="absolute top-1/2 w-3 h-3 bg-slate-900 dark:bg-white rounded-full shadow -translate-y-1/2"
                      style={{
                        left: `${
                          (((priceMax ?? maxPrice) - minPrice) /
                            (maxPrice - minPrice)) *
                          100
                        }%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 朝食・宿泊スタイルの絞り込み */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <button
                  type="button"
                  onClick={() => setOnlyBreakfast((prev) => !prev)}
                  className={`rounded-full border px-3 py-1 font-medium transition ${
                    onlyBreakfast
                      ? "border-amber-300 bg-amber-400/20 text-amber-50"
                      : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:border-amber-200 hover:text-amber-700 dark:hover:text-amber-100"
                  }`}
                >
                  朝食付きのみ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!mapBounds) return;
                    setUseMapBounds(true);
                  }}
                  disabled={!mapBounds}
                  className={`rounded-full border px-3 py-1 font-medium transition ${
                    useMapBounds
                      ? "border-sky-300 bg-sky-400/20 text-sky-50"
                      : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:border-sky-200 hover:text-sky-700 dark:hover:text-sky-100"
                  }`}
                >
                  この範囲で検索
                </button>
                {useMapBounds && (
                  <button
                    type="button"
                    onClick={() => setUseMapBounds(false)}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 font-medium text-[var(--muted-foreground)] transition hover:border-slate-300 hover:text-[var(--foreground)]"
                  >
                    範囲解除
                  </button>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[var(--muted-foreground-strong)]">
                    国:
                  </span>
                  <select
                    value={countryFilter}
                    onChange={(event) =>
                      setCountryFilter(event.target.value.toUpperCase())
                    }
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-medium text-[var(--foreground)] outline-none"
                  >
                    <option value="">すべて</option>
                    {countryOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[var(--muted-foreground-strong)]">
                    宿泊スタイル:
                  </span>
                  {[
                    { value: "", label: "すべて" },
                    { value: "hotel", label: "ホテル" },
                    { value: "ryokan", label: "旅館" },
                    { value: "minpaku", label: "民泊" },
                  ].map((opt) => (
                    <button
                      key={opt.value || "all"}
                      type="button"
                      onClick={() => setTypeFilter(opt.value)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                        typeFilter === opt.value
                          ? "border-indigo-300 bg-indigo-500/30 text-indigo-50"
                          : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:border-indigo-200 hover:text-indigo-700 dark:hover:text-indigo-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <ul
                ref={listRef}
                className="mt-3 grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {renderedHotels.map((hotel) => (
                  <li
                    key={`${hotel.id}-${hotel.name}`}
                    className="cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-black/10 dark:shadow-black/60 transition dark:hover:shadow-white/30"
                    onClick={(event) => {
                      const target = event.target as HTMLElement | null;
                      if (target?.closest("a")) return;
                      handleHotelFocus(hotel);
                    }}
                  >
                    <FallbackImage
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      width={600}
                      height={400}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-4">
                      <div className="text-sm font-semibold text-[var(--foreground)]">
                        {hotel.name}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-[var(--muted-foreground-strong)]">
                        {formatHotelLocation(hotel)}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                        ¥{hotel.price.toLocaleString()}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
                        <a className="underline" href={`/hotel/${hotel.id}`}>
                          詳細
                        </a>
                        <a className="underline" href={`/view3d/${hotel.id}`}>
                          3D
                        </a>
                        <a className="underline" href={`/reserve/${hotel.id}`}>
                          予約
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {displayHotels.length > renderedHotels.length && (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleHotelCount((prev) => prev + VISIBLE_HOTELS_STEP)
                    }
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-indigo-300"
                  >
                    さらに表示 ({renderedHotels.length}/{displayHotels.length})
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
