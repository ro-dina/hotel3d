"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Hotel, ReservationDraft } from "@/types/Hotel";

const DRAFT_KEY = "reservation:draft";
type SearchParams = { [key: string]: string | string[] | undefined };

export default function ReserveClient({
  id,
  hotel,
  searchParams,
}: {
  id: string;
  hotel?: Hotel;
  searchParams?: SearchParams;
}) {
  const router = useRouter();

  const initial = useMemo(
    () => ({
      checkIn: (searchParams?.checkIn as string) || "",
      checkOut: (searchParams?.checkOut as string) || "",
      guests: Number((searchParams?.guests as string) || 2),
    }),
    [searchParams]
  );

  const [form, setForm] = useState<ReservationDraft>({
    hotelId: Number(id),
    hotelName: hotel?.name ?? "",
    name: "",
    email: "",
    phone: "",
    checkIn: initial.checkIn,
    checkOut: initial.checkOut,
    guests: initial.guests,
    price: hotel?.price ?? 0,
  });

  useEffect(() => {
    if (!searchParams) return;
    setForm((prev) => ({
      ...prev,
      checkIn: (searchParams.checkIn as string) ?? prev.checkIn,
      checkOut: (searchParams.checkOut as string) ?? prev.checkOut,
      guests: Number((searchParams.guests as string) ?? prev.guests),
    }));
    
  }, [searchParams]);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ReservationDraft;
        if (parsed.hotelId === Number(id)) setForm(parsed);
      } catch {}
    }
  }, [id]);

  if (!hotel) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p>ホテルが見つかりませんでした。</p>
        <button onClick={() => router.back()} className="underline text-blue-600 mt-2">戻る</button>
      </main>
    );
  }

  const canProceed =
    form.name.trim() &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.checkIn &&
    form.checkOut &&
    new Date(form.checkIn) <= new Date(form.checkOut) &&
    form.guests > 0;

  const goCheckout = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    router.push(
      `/checkout?hotel=${hotel.id}&name=${encodeURIComponent(form.name)}&email=${encodeURIComponent(
        form.email
      )}&guests=${form.guests}&checkIn=${form.checkIn}&checkOut=${form.checkOut}`
    );
  };

  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">予約情報の入力</h1>

        <div className="bg-white border rounded-xl p-4 shadow flex gap-4">
          <Image
            src={hotel.imageUrl}
            alt={hotel.name}
            width={200}
            height={140}
            className="rounded object-cover w-[200px] h-[140px]"
            unoptimized
          />
          <div className="flex-1">
            <div className="text-lg font-semibold">{hotel.name}</div>
            <div className="text-sm text-gray-600 mt-1">{hotel.region}・{hotel.pref ?? ""}</div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">料金（税込）</span>
              <div className="text-2xl font-bold">¥{hotel.price.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); if (canProceed) goCheckout(); }}
          className="bg-white border rounded-xl p-4 shadow space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Labeled label="氏名">
              <input className="mt-1 w-full rounded border-gray-300" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Labeled>
            <Labeled label="メールアドレス">
              <input type="email" className="mt-1 w-full rounded border-gray-300" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Labeled>
            <Labeled label="電話番号">
              <input className="mt-1 w-full rounded border-gray-300" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Labeled>
            <Labeled label="人数">
              <input type="number" min={1} className="mt-1 w-full rounded border-gray-300" value={form.guests}
                onChange={(e) => setForm({ ...form, guests: Number(e.target.value || 1) })} />
            </Labeled>
            <Labeled label="チェックイン">
              <input type="date" className="mt-1 w-full rounded border-gray-300 text-gray-900" value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
            </Labeled>
            <Labeled label="チェックアウト">
              <input type="date" className="mt-1 w-full rounded border-gray-300 text-gray-900" value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })} min={form.checkIn || undefined} />
            </Labeled>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={!canProceed}
              className={`px-6 py-3 rounded-lg text-white font-semibold ${canProceed ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}>
              予約を確認
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}