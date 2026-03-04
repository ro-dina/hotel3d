"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReservationDraft } from "@/types/Hotel";

const DRAFT_KEY = "reservation:draft";

function calcNights(inDate: string, outDate: string) {
  if (!inDate || !outDate) return 0;
  const diff = new Date(outDate).getTime() - new Date(inDate).getTime();
  const nights = diff / (1000 * 60 * 60 * 24);
  return nights > 0 ? Math.ceil(nights) : 0;
}

export default function CheckoutClient() {
  const router = useRouter();
  const [draft, setDraft] = useState<ReservationDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setDraft(JSON.parse(raw) as ReservationDraft);
    } catch {
      router.replace("/");
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const nights = useMemo(
    () => (draft ? calcNights(draft.checkIn, draft.checkOut) : 0),
    [draft]
  );
  const total = useMemo(
    () => (draft ? nights * draft.guests * draft.price : 0),
    [draft, nights]
  );

  const confirmReservation = async () => {
    if (!draft) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        nights,
        total,
      }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json?.error ?? "予約確定に失敗しました");
      setSubmitting(false);
      return;
    }

    localStorage.removeItem(DRAFT_KEY);
    router.push(`/confirm?status=ok&reservationId=${json.reservationId}&mail=${json.mailSent ? "sent" : "skip"}`);
  };

  if (loading) return <main className="p-6">Loading...</main>;
  if (!draft) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <h1 className="text-2xl font-bold">予約内容の最終確認</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            内容を確認して「予約を確定する」を押してください。
          </p>
        </section>

        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <Row label="ホテル" value={draft.hotelName} />
            <Row label="宿泊者名" value={draft.name} />
            <Row label="メール" value={draft.email} />
            <Row label="電話番号" value={draft.phone} />
            <Row label="チェックイン" value={draft.checkIn} />
            <Row label="チェックアウト" value={draft.checkOut} />
            <Row label="宿泊人数" value={`${draft.guests}名`} />
            <Row label="泊数" value={`${nights}泊`} />
            <Row label="郵便番号" value={draft.postalCode} />
            <Row label="国" value={draft.country} />
            <Row label="都道府県・市区町村" value={draft.stateCity} />
            <Row label="番地・建物名" value={draft.addressLine1} />
            <Row label="補足住所" value={draft.addressLine2 || "-"} />
            <Row label="カード名義" value={draft.cardHolder} />
            <Row label="カード番号" value={`**** **** **** ${draft.cardNumber.replace(/\\s|-/g, "").slice(-4)}`} />
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--border)] flex justify-between items-end">
            <span className="text-sm text-[var(--muted-foreground)]">合計金額</span>
            <span className="text-3xl font-black">¥{total.toLocaleString()}</span>
          </div>
        </section>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 font-semibold"
          >
            入力画面に戻る
          </button>
          <button
            type="button"
            onClick={confirmReservation}
            disabled={submitting}
            className="flex-1 rounded-lg py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold"
          >
            {submitting ? "確定中..." : "予約を確定する"}
          </button>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-[var(--border)] pb-1">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
