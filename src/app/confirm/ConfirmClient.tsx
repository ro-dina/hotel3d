'use client';

import { useSearchParams } from 'next/navigation';

export default function ConfirmClient() {
  const params = useSearchParams();
  const status = params.get("status");
  const reservationId = params.get("reservationId");
  const mail = params.get("mail");

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold">予約完了</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">Status: {status ?? "none"}</p>
          {reservationId && (
            <p className="mt-1 text-[var(--muted-foreground)]">予約ID: {reservationId}</p>
          )}
          <p className="mt-1 text-[var(--muted-foreground)]">
            メール送信: {mail === "sent" ? "送信済み" : "SMTP未設定のためスキップ"}
          </p>
        </div>
      </div>
    </main>
  );
}
