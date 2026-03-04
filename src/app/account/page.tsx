"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  bookingEmail?: string | null;
  phone?: string | null;
  postalCode?: string | null;
  country?: string | null;
  stateCity?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  heightCm?: number | null;
  bodyWidthPercent?: number | null;
  cardLast4?: string | null;
  cardHolder?: string | null;
  cardExpMonth?: number | null;
  cardExpYear?: number | null;
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Japan");
  const [stateCity, setStateCity] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");

  const [heightCm, setHeightCm] = useState(170);
  const [bodyWidthPercent, setBodyWidthPercent] = useState(100);

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.user) {
          router.replace("/login");
          return;
        }

        setUser(json.user);
        setName(json.user.name ?? "");
        setBookingEmail(json.user.bookingEmail ?? "");
        setPhone(json.user.phone ?? "");

        setPostalCode(json.user.postalCode ?? "");
        setCountry(json.user.country ?? "Japan");
        setStateCity(json.user.stateCity ?? "");
        setAddressLine1(json.user.addressLine1 ?? "");
        setAddressLine2(json.user.addressLine2 ?? "");

        setHeightCm(json.user.heightCm ?? 170);
        setBodyWidthPercent(json.user.bodyWidthPercent ?? 100);

        setCardHolder(json.user.cardHolder ?? "");
        setCardExpMonth(json.user.cardExpMonth ? String(json.user.cardExpMonth) : "");
        setCardExpYear(json.user.cardExpYear ? String(json.user.cardExpYear) : "");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  const updateAccount = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      name,
      password,
      bookingEmail,
      phone,
      postalCode,
      country,
      stateCity,
      addressLine1,
      addressLine2,
      heightCm,
      bodyWidthPercent,
      cardNumber,
      cardHolder,
      cardExpMonth: cardExpMonth ? Number(cardExpMonth) : undefined,
      cardExpYear: cardExpYear ? Number(cardExpYear) : undefined,
      cardCvc,
    };

    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json?.error ?? "更新に失敗しました");
      return;
    }

    setUser(json.user);
    setPassword("");
    setCardNumber("");
    setCardCvc("");
    setMessage("アカウント情報を更新しました");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">アカウント管理</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">ログインメール: {user.email}</p>
      </section>

      <form className="space-y-6" onSubmit={updateAccount}>
        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold mb-4">基本情報・3Dプロフィール</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="表示名">
              <input value={name} onChange={(e) => setName(e.target.value)} className="field" />
            </Field>
            <Field label="予約用メールアドレス（任意）">
              <input type="email" value={bookingEmail} onChange={(e) => setBookingEmail(e.target.value)} className="field" />
            </Field>
            <Field label="電話番号（任意）">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field" />
            </Field>
            <Field label={`身長: ${heightCm} cm`}>
              <input type="range" min={120} max={220} step={1} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className="w-full" />
            </Field>
            <Field label={`体型(腹囲): ${bodyWidthPercent}%`}>
              <input type="range" min={70} max={140} step={1} value={bodyWidthPercent} onChange={(e) => setBodyWidthPercent(Number(e.target.value))} className="w-full" />
            </Field>
            <Field label="新しいパスワード（任意）">
              <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold mb-4">住所（予約用 / 任意）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="郵便番号">
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="100-0001" className="field" />
            </Field>
            <Field label="国">
              <input value={country} onChange={(e) => setCountry(e.target.value)} className="field" />
            </Field>
            <Field label="都道府県・市区町村">
              <input value={stateCity} onChange={(e) => setStateCity(e.target.value)} className="field" />
            </Field>
            <Field label="番地・建物名">
              <input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="field" />
            </Field>
            <div className="md:col-span-2">
              <Field label="部屋番号・補足">
                <input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="field" />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold mb-1">カード情報（任意）</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            カード番号・CVCは暗号化保存します。保存済みカード: {user.cardLast4 ? `**** **** **** ${user.cardLast4}` : "なし"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="カード名義">
              <input value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} className="field" placeholder="TARO YAMADA" />
            </Field>
            <Field label="カード番号">
              <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="field" placeholder="4111 1111 1111 1111" />
            </Field>
            <Field label="有効期限(月)">
              <input value={cardExpMonth} onChange={(e) => setCardExpMonth(e.target.value)} className="field" placeholder="12" />
            </Field>
            <Field label="有効期限(年)">
              <input value={cardExpYear} onChange={(e) => setCardExpYear(e.target.value)} className="field" placeholder="2028" />
            </Field>
            <Field label="セキュリティコード">
              <input value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="field" placeholder="123" />
            </Field>
          </div>
        </section>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-700 dark:text-green-400">{message}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold">更新する</button>
          <button type="button" onClick={logout} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg py-3 font-semibold">ログアウト</button>
        </div>
      </form>

      <style jsx>{`
        .field {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.6rem;
          padding: 0.6rem 0.75rem;
          background: #fff;
        }
        :global(.dark) .field {
          border-color: #4b5563;
          background: #111827;
          color: #f9fafb;
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">{label}</span>
      {children}
    </label>
  );
}
