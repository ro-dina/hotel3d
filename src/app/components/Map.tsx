"use client";

import React from "react";
import dynamic from "next/dynamic";

// MapPanel（react-leafletベース）を動的import
const MapPanel = dynamic(() => import("./MapPanel"), { ssr: false });
import type { MapPanelProps } from "./MapPanel";

export type MapProps = Partial<MapPanelProps>;

export default function JapanMap(props: MapProps) {
  // MapPanelにpropsをそのまま渡す
  return <MapPanel {...props} />;
}