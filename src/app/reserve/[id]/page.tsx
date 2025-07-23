"use client";

// /src/app/reserve/[id]/page.tsx
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Hotel } from "@/types/Hotel"; 

export default function ReservePage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    fetch(`/api/hotels/${id}`)
      .then((res) => res.json())
      .then(setHotel);
  }, [id]);

  const handleReserve = async () => {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelId: id, name, email }),
    });
    if (res.ok) setReserved(true);
  };

  if (!hotel) return <div>読み込み中...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{hotel.name} の予約</h1>
      {reserved ? (
        <p className="text-green-600">予約が完了しました！</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleReserve();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block">お名前</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            予約する
          </button>
        </form>
      )}
    </div>
  );
}