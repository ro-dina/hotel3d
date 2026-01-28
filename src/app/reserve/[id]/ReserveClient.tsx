"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Hotel, ReservationDraft } from "@/types/Hotel";

// -----------------------------------------------------------------------------
// TYPES & CONSTANTS
// -----------------------------------------------------------------------------

const DRAFT_KEY = "reservation:draft";

type SearchParams = { [key: string]: string | string[] | undefined };

// 泊数計算ヘルパー
const calculateNights = (inDate: string, outDate: string) => {
  if (!inDate || !outDate) return 0;
  const start = new Date(inDate);
  const end = new Date(outDate);
  const diff = end.getTime() - start.getTime();
  const nights = diff / (1000 * 60 * 60 * 24);
  return nights > 0 ? Math.ceil(nights) : 0;
};

// 日付フォーマットヘルパー (例: 2025年12月24日)
const formatDateJP = (dateStr: string) => {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

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

  // 初期値の計算
  const initial = useMemo(
    () => ({
      checkIn: (searchParams?.checkIn as string) || "",
      checkOut: (searchParams?.checkOut as string) || "",
      guests: Number((searchParams?.guests as string) || 2),
    }),
    [searchParams]
  );

  // フォームステート
  const [form, setForm] = useState<ReservationDraft>({
    hotelId: Number(id),
    hotelName: hotel.name,
    name: "",
    email: "",
    phone: "",
    checkIn: initial.checkIn,
    checkOut: initial.checkOut,
    guests: initial.guests,
    price: hotel.price,
  });

  // 見積もりステート
  const [estimation, setEstimation] = useState({ nights: 0, total: 0 });

  // パラメータ変更監視
  useEffect(() => {
    if (!searchParams) return;
    setForm((prev) => ({
      ...prev,
      checkIn: (searchParams.checkIn as string) ?? prev.checkIn,
      checkOut: (searchParams.checkOut as string) ?? prev.checkOut,
      guests: Number((searchParams.guests as string) ?? prev.guests),
    }));
  }, [searchParams]);

  // ドラフト復元 (ブラウザに保存された入力途中データがあれば)
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ReservationDraft;
        if (parsed.hotelId === Number(id)) setForm(parsed);
      } catch {
        // エラー無視
      }
    }
  }, [id]);

  // 価格再計算
  useEffect(() => {
    const nights = calculateNights(form.checkIn, form.checkOut);
    const total = nights * form.guests * hotel.price;
    setEstimation({ nights, total });
  }, [form.checkIn, form.checkOut, form.guests, hotel.price]);

  // バリデーション (入力チェック)
  const canProceed =
    form.name.trim() !== "" &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.checkIn !== "" &&
    form.checkOut !== "" &&
    new Date(form.checkIn) < new Date(form.checkOut) &&
    form.guests > 0;

  // 画面遷移処理
  const goCheckout = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    const query = new URLSearchParams({
      hotel: hotel.id.toString(),
      name: form.name,
      email: form.email,
      guests: form.guests.toString(),
      checkIn: form.checkIn,
      checkOut: form.checkOut,
    }).toString();
    router.push(`/checkout?${query}`);
  };

  return (
    <main className="min-h-screen pb-20 bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      
      {/* ----------------------------------------------------------------------
          1. HERO SECTION (FADE OUT EFFECT)
         ---------------------------------------------------------------------- */}
      <div className="relative h-[45vh] w-full">
        {/* 背景画像 */}
        <Image
          src={hotel.imageUrl}
          alt={hotel.name}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        
        {/* ダーク/ライト対応のフェードアウトグラデーション */}
        {/* 下に向かって、各モードの背景色に溶け込むように設定 */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-slate-950 via-transparent to-black/30" />

        {/* ヒーローテキスト */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold text-white bg-blue-600 rounded-full shadow-lg">
              予約手続き
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">
              {hotel.name}
            </h1>
            <p className="mt-2 text-lg text-white/90 font-medium drop-shadow-sm">
              {hotel.region}・{hotel.pref}
            </p>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          2. MAIN CONTENT AREA (OVERLAPPING)
         ---------------------------------------------------------------------- */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          
          {/* === LEFT: 入力フォーム === */}
          <div className="space-y-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canProceed) goCheckout();
              }}
              className="space-y-8"
            >
              
              {/* カード1: お客様情報 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-slate-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
                  <span className="text-blue-600">01.</span> お客様情報
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="お名前 (氏名)" required>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="例: 山田 太郎"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </InputGroup>
                  <InputGroup label="メールアドレス" required>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="例: name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </InputGroup>
                  <InputGroup label="電話番号">
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="例: 090-0000-0000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </InputGroup>
                </div>
              </div>

              {/* カード2: ご宿泊内容 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-slate-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
                  <span className="text-blue-600">02.</span> ご宿泊内容
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="チェックイン" required>
                    <input
                      type="date"
                      className="form-input"
                      value={form.checkIn}
                      onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                      required
                    />
                  </InputGroup>
                  <InputGroup label="チェックアウト" required>
                    <input
                      type="date"
                      className="form-input"
                      value={form.checkOut}
                      min={form.checkIn}
                      onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                      required
                    />
                  </InputGroup>
                  <InputGroup label="ご利用人数" required>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        className="form-input pr-12"
                        value={form.guests}
                        onChange={(e) => setForm({ ...form, guests: Number(e.target.value || 1) })}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-bold text-sm">
                        名様
                      </span>
                    </div>
                  </InputGroup>
                </div>
              </div>

              {/* スマホ用: 送信ボタン (PCでは右カラムに表示) */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={!canProceed}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                    canProceed
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  予約内容の確認へ
                </button>
              </div>

            </form>
          </div>

          {/* === RIGHT: 料金シミュレーション (Sticky) === */}
          <div className="hidden lg:block relative">
            <div className="sticky top-24 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-200">
                  ご請求予定額
                </h3>

                {/* 計算詳細 */}
                <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-slate-400 border-b border-gray-100 dark:border-slate-800 pb-6">
                  <div className="flex justify-between">
                    <span>宿泊プラン (1名様)</span>
                    <span>¥{hotel.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>人数</span>
                    <span>x {form.guests} 名</span>
                  </div>
                  <div className="flex justify-between">
                    <span>泊数</span>
                    <span>x {estimation.nights > 0 ? estimation.nights : "-"} 泊</span>
                  </div>
                  {/* 日程表示 */}
                  {estimation.nights > 0 && (
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-slate-700 text-xs">
                       <div className="flex justify-between">
                          <span>IN</span>
                          <span>{formatDateJP(form.checkIn)}</span>
                       </div>
                       <div className="flex justify-between mt-1">
                          <span>OUT</span>
                          <span>{formatDateJP(form.checkOut)}</span>
                       </div>
                    </div>
                  )}
                </div>

                {/* 合計金額 */}
                <div className="flex justify-between items-end mb-6">
                   <span className="font-bold text-sm text-gray-500 dark:text-slate-400">合計 (税込)</span>
                   <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ¥{estimation.total.toLocaleString()}
                   </span>
                </div>

                {/* 予約ボタン */}
                <button
                  onClick={() => {
                    if (canProceed) goCheckout();
                  }}
                  disabled={!canProceed}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 ${
                    canProceed
                      ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30"
                      : "bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  予約内容の確認へ
                </button>
                
                {!canProceed && (
                  <p className="text-center text-xs text-red-500 mt-3 font-medium">
                    ※ 必須項目をすべて入力してください
                  </p>
                )}
              </div>

              {/* 安心サポート */}
              <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                 <strong>安心の予約保証：</strong><br/>
                 予約完了後、確認メールが自動送信されます。現地での追加料金は発生しません（入湯税等を除く）。
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Tailwind Custom Styles for Inputs (Just for this component) */}
      <style jsx>{`
        .form-input {
          width: 100%;
          border-radius: 0.75rem; /* rounded-xl */
          padding: 0.75rem 1rem;
          transition: all 0.2s;
          outline: none;
        }
        /* Light Mode Styles */
        .form-input {
          background-color: #f8fafc; /* bg-slate-50 */
          border: 1px solid #e2e8f0; /* border-slate-200 */
          color: #0f172a; /* text-slate-900 */
        }
        .form-input:focus {
          border-color: #2563eb; /* blue-600 */
          background-color: #ffffff;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
        }
        
        /* Dark Mode Styles (using :global for pure CSS in module or simple styling) */
        :global(.dark) .form-input {
          background-color: #1e293b; /* bg-slate-800 */
          border: 1px solid #334155; /* border-slate-700 */
          color: #f8fafc; /* text-slate-50 */
        }
        :global(.dark) .form-input:focus {
          border-color: #3b82f6; /* blue-500 */
          background-color: #0f172a; /* bg-slate-900 */
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        /* Calendar Icon Color Fix for Dark Mode */
        :global(.dark) ::-webkit-calendar-picker-indicator {
            filter: invert(1);
        }
      `}</style>
    </main>
  );
}

// -----------------------------------------------------------------------------
// UI SUB COMPONENTS
// -----------------------------------------------------------------------------

function InputGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 text-xs ml-1">必須</span>}
      </label>
      {children}
    </div>
  );
}