// src/app/view3d/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import React from "react";

export default function View3DPage() {
  const params = useParams();
  const hotelId = params?.id;

  return (
    <main className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">ホテル {hotelId} を3Dで表示</h1>

      {/* iframe 埋め込み */}
      <div className="w-full aspect-video border-2 border-white rounded overflow-hidden">
        <iframe
          src={`/unity/hotel${hotelId}/index.html`}
          className="w-full h-full"
          allowFullScreen
        />
      </div>

      
    </main>
  );
}