"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { MapPanelProps } from "./MapPanel"; // すでにあるならそのままでOK

export default function MapPanelClient(props: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // すでに初期化済みなら何もしない（Fast Refresh対策も兼ねる）
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [35.681236, 139.767125], // 東京駅あたり、適宜書き換え
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // 必要ならここで props.value / onPick を使ってマーカーやクリックハンドラを設定
    // 例:
    // if (props.value) { ... }

    mapRef.current = map;

    // クリーンアップ。開発モードでの Fast Refresh 時に既存 map を破棄する。
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // ★ 依存配列は「空」。初回マウント時だけ実行

  return (
    <div
      ref={containerRef}
      style={props.mapStyle ?? { width: "100%", height: "100%" }}
      className={props.mapWrapperClassName}
    />
  );
}