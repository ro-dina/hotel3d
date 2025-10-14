"use client";

import React, { useMemo } from "react";

type PriceHistogramProps = {
  prices: number[];
  width?: number;
  height?: number;
  bins?: number;
};

function freedmanDiaconisBinCount(data: number[]): number {
  if (data.length < 2) return 1;
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = sorted[Math.floor((sorted.length / 4))];
  const q3 = sorted[Math.floor((sorted.length * 3) / 4)];
  const iqr = q3 - q1;
  if (iqr === 0) return 20;
  const binWidth = (2 * iqr) / Math.cbrt(data.length);
  if (binWidth === 0) return 20;
  const range = sorted[sorted.length - 1] - sorted[0];
  return Math.min(100, Math.max(1, Math.ceil(range / binWidth)));
}

export default function PriceHistogram(props: PriceHistogramProps) {
  const { prices, width = 400, height = 200, bins } = props;

  const binCount = useMemo(() => {
    if (prices.length === 0) return 0;
    const fdBins = freedmanDiaconisBinCount(prices);
    return bins && bins > 0 ? bins : fdBins;
  }, [prices, bins]);

  const [histBins, maxCount, minPrice, maxPrice] = useMemo(() => {
    if (prices.length === 0) return [[], 0, 0, 0];

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const binNum = binCount;

    if (binNum === 0) return [[], 0, min, max];

    const binWidth = (max - min) / binNum || 1;

    const binsArray = new Array(binNum).fill(0);
    for (const p of prices) {
      let idx = Math.floor((p - min) / binWidth);
      if (idx === binNum) idx = binNum - 1; // include max value in last bin
      binsArray[idx]++;
    }
    const maxCount = Math.max(...binsArray);
    return [binsArray, maxCount, min, max];
  }, [prices, binCount]);

  if (prices.length === 0) {
    return (
      <div style={{ width, height, display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid #ccc", borderRadius: 4, backgroundColor: "#f9f9f9" }}>
        <span style={{ color: "#666" }}>No data available</span>
      </div>
    );
  }

  // margins for axes
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // scales
  const xScale = (i: number) => (i / binCount) * innerWidth;
  const barWidth = innerWidth / binCount;
  const yScale = (count: number) => (count / maxCount) * innerHeight;

  // ticks for x axis - show at most 10 ticks
  const maxTicks = 10;
  const tickStep = Math.max(1, Math.floor(binCount / maxTicks));
  const xTicks = [];
  for (let i = 0; i <= binCount; i += tickStep) {
    const val = minPrice + ((maxPrice - minPrice) * i) / binCount;
    xTicks.push({ value: val, xOffset: xScale(i) });
  }

  // ticks for y axis - 5 ticks
  const yTicks = [];
  for (let i = 0; i <= 5; i++) {
    const val = Math.round((maxCount * i) / 5);
    yTicks.push({ value: val, yOffset: innerHeight - (innerHeight * i) / 5 });
  }

  return (
    <svg width={width} height={height} role="img" aria-label="Price histogram">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Bars */}
        {histBins.map((count, i) => {
          const barHeight = yScale(count);
          return (
            <rect
              key={i}
              x={xScale(i)}
              y={innerHeight - barHeight}
              width={barWidth - 1}
              height={barHeight}
              fill="#4f46e5"
            />
          );
        })}

        {/* X axis */}
        <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#333" />
        {xTicks.map(({ value, xOffset }, i) => (
          <g key={i} transform={`translate(${xOffset},${innerHeight})`}>
            <line y2={6} stroke="#333" />
            <text
              y={20}
              textAnchor="middle"
              fontSize={10}
              fill="#333"
              style={{ userSelect: "none" }}
            >
              {value.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Y axis */}
        <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#333" />
        {yTicks.map(({ value, yOffset }, i) => (
          <g key={i} transform={`translate(0,${yOffset})`}>
            <line x2={-6} stroke="#333" />
            <text
              x={-10}
              y={5}
              textAnchor="end"
              fontSize={10}
              fill="#333"
              style={{ userSelect: "none" }}
            >
              {value}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}