'use client';

import { useSearchParams } from 'next/navigation';

export default function ConfirmClient() {
  const params = useSearchParams();
  const status = params.get('status'); // 例: /confirm?status=ok

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold">Confirm</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">Status: {status ?? 'none'}</p>
        </div>
      </div>
    </main>
  );
}
