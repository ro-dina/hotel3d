import Image from "next/image";
import { HOTELS } from "@/app/data/mockHotels";
import type { Hotel } from "@/types/Hotel";

export async function generateStaticParams() {
  return HOTELS.map(h => ({ id: String(h.id) }));
}

type RouteParams = { id: string };

export default async function HotelDetailPage(props: unknown) {
  const { params } = props as { params: RouteParams };
  const { id } = params;
  const hotel: Hotel | undefined = HOTELS.find(h => String(h.id) === id);

  if (!hotel) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="max-w-5xl mx-auto p-6">ホテルが見つかりませんでした。</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[2fr_3fr] gap-6 p-6">
        <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
        <Image
          src={hotel.imageUrl}
          alt={hotel.name}
          width={800}
          height={600}
          className="w-full h-[320px] object-cover"
          unoptimized
        />
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow">
        <h1 className="text-2xl font-bold">{hotel.name}</h1>
        <p className="text-[var(--muted-foreground)]">{hotel.region}・{hotel.pref ?? ""}</p>
        <div className="mt-3 text-xl font-bold">¥{hotel.price.toLocaleString()}</div>
        <div className="mt-3 whitespace-pre-wrap">{hotel.description}</div>
        <ul className="mt-4 text-sm grid grid-cols-2 gap-2">
          <li>種類: {hotel.type ?? "hotel"}</li>
          <li>朝食: {hotel.breakfast ? "あり" : "なし"}</li>
          <li>空き: {hotel.available ? "○" : "×"}</li>
        </ul>
        <div className="mt-4 flex gap-3">
          <a className="px-4 py-2 bg-blue-600 text-white rounded" href={`/reserve/${hotel.id}`}>予約へ</a>
          <a className="px-4 py-2 bg-[var(--surface-alt)] border border-[var(--border)] rounded" href={`/view3d/${hotel.id}`}>3Dで見る</a>
        </div>
      </div>
      </div>
    </main>
  );
}
