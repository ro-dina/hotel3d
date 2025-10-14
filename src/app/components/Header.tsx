// src/components/Header.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [q, setQ] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: 検索ページに遷移させる場合は /search?q=... などに置き換え
    // 現状はコンソールに出すだけ
    console.info("search:", q);
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* 左: ロゴ / ホーム */}
        <Link href="/" className="text-lg font-semibold text-indigo-600">Hotel3D</Link>

        {/* 中央: 検索フォーム */}
        <form onSubmit={onSubmit} className="flex-1 flex items-center gap-2">
          <label htmlFor="site-search" className="sr-only">ホテルを検索</label>
          <input
            id="site-search"
            type="search"
            inputMode="search"
            placeholder="ホテルを検索"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="検索"
          >検索</button>
        </form>

        {/* 右: ナビ + アカウント */}
        <nav className="flex items-center gap-4 text-sm text-gray-700">
          <Link href="/support" className="hover:text-gray-900">カスタマーサービス</Link>
          <Link href="/account" className="hover:text-gray-900 flex items-center gap-2" aria-label="アカウント">
            <Image
              src="/images/user-icon.png"
              alt="User Icon"
              className="rounded-full object-cover"
              width={32}
              height={32}
              priority
            />
          </Link>
        </nav>
      </div>
    </header>
  );
}