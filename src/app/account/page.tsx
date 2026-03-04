"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  bookingEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  heightCm?: number | null;
  bodyWidthPercent?: number | null;
  cardLast4?: string | null;
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [heightCm, setHeightCm] = useState(170);
  const [bodyWidthPercent, setBodyWidthPercent] = useState(100);
  const [cardNumber, setCardNumber] = useState("");
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
        setName(json.user.name);
        setBookingEmail(json.user.bookingEmail ?? "");
        setPhone(json.user.phone ?? "");
        setAddress(json.user.address ?? "");
        setHeightCm(json.user.heightCm ?? 170);
        setBodyWidthPercent(json.user.bodyWidthPercent ?? 100);
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

    const payload: { name?: string; password?: string } = {};
    const extPayload: {
      bookingEmail?: string;
      phone?: string;
      address?: string;
      heightCm?: number;
      bodyWidthPercent?: number;
      cardNumber?: string;
    } = {};
    if (name.trim() && name.trim() !== user?.name) payload.name = name.trim();
    if (password) payload.password = password;
    extPayload.bookingEmail = bookingEmail;
    extPayload.phone = phone;
    extPayload.address = address;
    extPayload.heightCm = heightCm;
    extPayload.bodyWidthPercent = bodyWidthPercent;
    if (cardNumber.trim()) extPayload.cardNumber = cardNumber.trim();

    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, ...extPayload }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json?.error ?? "更新に失敗しました");
      return;
    }

    setUser(json.user);
    setName(json.user.name);
    setBookingEmail(json.user.bookingEmail ?? "");
    setPhone(json.user.phone ?? "");
    setAddress(json.user.address ?? "");
    setHeightCm(json.user.heightCm ?? 170);
    setBodyWidthPercent(json.user.bodyWidthPercent ?? 100);
    setPassword("");
    setCardNumber("");
    setMessage("更新しました");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

  return (
    <div className="max-w-md mx-auto p-6 mt-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">アカウント管理</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">メール: {user.email}</p>

      <form className="space-y-4" onSubmit={updateAccount}>
        <div>
          <label className="block text-sm mb-1">表示名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">予約用メールアドレス（任意）</label>
          <input
            type="email"
            value={bookingEmail}
            onChange={(e) => setBookingEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">電話番号（任意）</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">住所（任意）</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">身長: {heightCm} cm</label>
          <input
            type="range"
            min={120}
            max={220}
            step={1}
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">体型(腹囲): {bodyWidthPercent}%</label>
          <input
            type="range"
            min={70}
            max={140}
            step={1}
            value={bodyWidthPercent}
            onChange={(e) => setBodyWidthPercent(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">クレジットカード番号（任意）</label>
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder={user.cardLast4 ? `保存済み: **** **** **** ${user.cardLast4}` : "4111 1111 1111 1111"}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            入力時は暗号化して保存します。空欄のままなら既存値を維持します。
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">新しいパスワード（任意）</label>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-700 dark:text-green-400">{message}</p>}

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2">
          更新する
        </button>
      </form>

      <button
        type="button"
        onClick={logout}
        className="w-full mt-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded py-2"
      >
        ログアウト
      </button>
    </div>
  );
}
