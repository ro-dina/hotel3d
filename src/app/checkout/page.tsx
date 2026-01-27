export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold">お支払い（ダミー）</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">実装予定: クレジットカード決済 or 現地支払い選択。</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">URLのクエリから予約内容を再現できます（ReserveClientから遷移）。</p>
        </div>
      </div>
    </main>
  );
}
