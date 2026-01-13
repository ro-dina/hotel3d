"use client";

import React from "react";
import dynamic from "next/dynamic";

// MapPanel（react-leafletベース）を動的import
const MapPanel = dynamic(() => import("./MapPanel"), { ssr: false });

export type MapProps = {
  pref?: string;
  setPref?: (v: string) => void;
  position: { coordinates: [number, number]; zoom: number };
  setPosition: (pos: { coordinates: [number, number]; zoom: number }) => void;
  level: "regions" | "prefecture" | "japan";
  readAreaName?: (geo: any) => string;
  height?: number;
  center?: [number, number];
};

export default function JapanMap(props: Partial<MapProps>) {
  // MapPanelにpropsをそのまま渡す
  return <MapPanel {...props} />;
}