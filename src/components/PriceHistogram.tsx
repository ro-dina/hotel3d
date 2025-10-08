"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

type Props = { prices: number[] };

export default function PriceHistogram({ prices }: Props) {
  const data = prices.map((p) => ({ price: p }));

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="price" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="price" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}