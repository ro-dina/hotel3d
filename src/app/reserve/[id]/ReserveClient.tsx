"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Hotel, ReservationDraft } from "@/types/Hotel";

const DRAFT_KEY = "reservation:draft";

type SearchParams = { [key: string]: string | string[] | undefined };

const calculateNights = (inDate: string, outDate: string) => {
  if (!inDate || !outDate) return 0;
  const start = new Date(inDate);
  const end = new Date(outDate);
  const diff = end.getTime() - start.getTime();
  const nights = diff / (1000 * 60 * 60 * 24);
  return nights > 0 ? Math.ceil(nights) : 0;
};

const formatDateJP = (dateStr: string) => {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export default function ReserveClient({
  id,
  hotel,
  searchParams,
}: {
  id: string;
  hotel: Hotel;
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
    hotelName: hotel.name,
    name: "",
    email: "",
    phone: "",
    postalCode: "",
    country: "Japan",
    stateCity: "",
    addressLine1: "",
    addressLine2: "",
    cardHolder: "",
    cardNumber: "",
    cardExpMonth: "",
    cardExpYear: "",
    cardCvc: "",
    checkIn: initial.checkIn,
    checkOut: initial.checkOut,
    guests: initial.guests,
    price: hotel.price,
  });

  const [estimation, setEstimation] = useState({ nights: 0, total: 0 });

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
        if (parsed.hotelId === Number(id)) {
          setForm((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // ignore
      }
    }
  }, [id]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const u = json?.user;
        if (!u) return;

        setForm((prev) => ({
          ...prev,
          name: prev.name || u.name || "",
          email: prev.email || u.bookingEmail || u.email || "",
          phone: prev.phone || u.phone || "",
          postalCode: prev.postalCode || u.postalCode || "",
          country: prev.country || u.country || "Japan",
          stateCity: prev.stateCity || u.stateCity || "",
          addressLine1: prev.addressLine1 || u.addressLine1 || "",
          addressLine2: prev.addressLine2 || u.addressLine2 || "",
          cardHolder: prev.cardHolder || u.cardHolder || "",
          cardNumber: prev.cardNumber || u.cardNumber || "",
          cardExpMonth: prev.cardExpMonth || (u.cardExpMonth ? String(u.cardExpMonth) : ""),
          cardExpYear: prev.cardExpYear || (u.cardExpYear ? String(u.cardExpYear) : ""),
        }));
      } catch {
        // ignore
      }
    };

    void loadProfile();
  }, []);

  useEffect(() => {
    const nights = calculateNights(form.checkIn, form.checkOut);
    const total = nights * form.guests * hotel.price;
    setEstimation({ nights, total });
  }, [form.checkIn, form.checkOut, form.guests, hotel.price]);

  const canProceed =
    form.name.trim() !== "" &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.checkIn !== "" &&
    form.checkOut !== "" &&
    new Date(form.checkIn) < new Date(form.checkOut) &&
    form.guests > 0 &&
    form.postalCode.trim() !== "" &&
    form.country.trim() !== "" &&
    form.stateCity.trim() !== "" &&
    form.addressLine1.trim() !== "" &&
    form.cardHolder.trim() !== "" &&
    /^\d{12,19}$/.test(form.cardNumber.replace(/\s|-/g, "")) &&
    /^\d{1,2}$/.test(form.cardExpMonth) &&
    /^\d{4}$/.test(form.cardExpYear) &&
    /^\d{3,4}$/.test(form.cardCvc);

  const goCheckout = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    router.push("/checkout");
  };

  return (
    <main className="min-h-screen pb-20 bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      <div className="relative h-[38vh] w-full">
        <Image src={hotel.imageUrl} alt={hotel.name} fill className="object-cover" priority unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-slate-950 via-transparent to-black/30" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-10">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold text-white bg-blue-600 rounded-full shadow-lg">予約手続き</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">{hotel.name}</h1>
            <p className="mt-2 text-white/90">{hotel.region}・{hotel.pref}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canProceed) goCheckout();
            }}
            className="space-y-6"
          >
            <Card title="01. お客様情報">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="お名前" required>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </InputGroup>
                <InputGroup label="メールアドレス" required>
                  <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </InputGroup>
                <InputGroup label="電話番号" required>
                  <input type="tel" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </InputGroup>
              </div>
            </Card>

            <Card title="02. 宿泊日程">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="チェックイン" required>
                  <input type="date" className="form-input" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
                </InputGroup>
                <InputGroup label="チェックアウト" required>
                  <input type="date" className="form-input" min={form.checkIn} value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
                </InputGroup>
                <InputGroup label="ご利用人数" required>
                  <input type="number" min={1} max={10} className="form-input" value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value || 1) })} />
                </InputGroup>
              </div>
            </Card>

            <Card title="03. 住所情報">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="郵便番号" required>
                  <input className="form-input" placeholder="100-0001" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                </InputGroup>
                <InputGroup label="国" required>
                  <input className="form-input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </InputGroup>
                <InputGroup label="都道府県・市区町村" required>
                  <input className="form-input" value={form.stateCity} onChange={(e) => setForm({ ...form, stateCity: e.target.value })} />
                </InputGroup>
                <InputGroup label="番地・建物名" required>
                  <input className="form-input" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
                </InputGroup>
                <div className="md:col-span-2">
                  <InputGroup label="部屋番号・補足">
                    <input className="form-input" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
                  </InputGroup>
                </div>
              </div>
            </Card>

            <Card title="04. カード情報">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="カード名義" required>
                  <input className="form-input" placeholder="TARO YAMADA" value={form.cardHolder} onChange={(e) => setForm({ ...form, cardHolder: e.target.value })} />
                </InputGroup>
                <InputGroup label="カード番号" required>
                  <input className="form-input" placeholder="4111 1111 1111 1111" value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} />
                </InputGroup>
                <InputGroup label="有効期限(月)" required>
                  <input className="form-input" placeholder="12" value={form.cardExpMonth} onChange={(e) => setForm({ ...form, cardExpMonth: e.target.value })} />
                </InputGroup>
                <InputGroup label="有効期限(年)" required>
                  <input className="form-input" placeholder="2028" value={form.cardExpYear} onChange={(e) => setForm({ ...form, cardExpYear: e.target.value })} />
                </InputGroup>
                <InputGroup label="セキュリティコード" required>
                  <input className="form-input" placeholder="123" value={form.cardCvc} onChange={(e) => setForm({ ...form, cardCvc: e.target.value })} />
                </InputGroup>
              </div>
            </Card>

            <div className="lg:hidden">
              <button type="submit" disabled={!canProceed} className={`w-full py-4 rounded-xl font-bold ${canProceed ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500"}`}>
                お支払い確認へ進む
              </button>
            </div>
          </form>

          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-lg">ご請求予定額</h3>
              <div className="text-sm space-y-2 text-gray-600 dark:text-slate-400">
                <div className="flex justify-between"><span>単価</span><span>¥{hotel.price.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>人数</span><span>{form.guests}名</span></div>
                <div className="flex justify-between"><span>泊数</span><span>{estimation.nights || "-"}泊</span></div>
                {estimation.nights > 0 && (
                  <div className="text-xs pt-2 border-t border-dashed border-gray-200 dark:border-slate-700">
                    <div className="flex justify-between"><span>IN</span><span>{formatDateJP(form.checkIn)}</span></div>
                    <div className="flex justify-between"><span>OUT</span><span>{formatDateJP(form.checkOut)}</span></div>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-gray-100 dark:border-slate-800">
                <span className="text-sm text-gray-500">合計</span>
                <span className="text-3xl font-black">¥{estimation.total.toLocaleString()}</span>
              </div>
              <button onClick={goCheckout} disabled={!canProceed} className={`w-full py-3 rounded-xl font-bold ${canProceed ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500"}`}>
                お支払い確認へ進む
              </button>
              {!canProceed && <p className="text-xs text-red-500">※ 必須項目を入力してください</p>}
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          border-radius: 0.75rem;
          padding: 0.7rem 0.9rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
        }
        .form-input:focus {
          outline: none;
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
        }
        :global(.dark) .form-input {
          border-color: #334155;
          background: #1e293b;
          color: #f8fafc;
        }
        :global(.dark) .form-input:focus {
          border-color: #3b82f6;
          background: #0f172a;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-slate-800">
      <h2 className="text-xl font-bold mb-5 border-b border-gray-100 dark:border-slate-800 pb-3">{title}</h2>
      {children}
    </section>
  );
}

function InputGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 text-xs">必須</span>}
      </label>
      {children}
    </div>
  );
}
