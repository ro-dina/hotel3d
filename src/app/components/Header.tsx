// src/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 左側：トップページボタン */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-lg font-bold text-blue-600 hover:text-blue-800">
            トップページ
          </Link>
        </div>

        {/* 中央：検索フォーム */}
        <form className="flex flex-1 mx-4 max-w-lg" action="/search" method="GET">
          <input
            type="text"
            name="query"
            placeholder="ホテルを検索"
            className="flex-grow border border-gray-300 rounded-l px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded-r hover:bg-blue-700"
          >
            検索
          </button>
        </form>

        {/* 右側：リンク群 + ユーザーアイコン */}
        <nav className="flex items-center space-x-4 text-sm text-gray-700">
          <Link href="/support" className="hover:underline">
            カスタマーサービス
          </Link>
          <span>|</span>
          <Link href="/account" className="hover:underline">
            アカウント
          </Link>
          <Link href="/account" className="ml-4">
        
            <Image
            src="/images/user-icon.png"
            alt="User Icon"
            className="w-8 h-8 rounded-full object-cover"
            width={32}
            height={32}
            />
          </Link>
        </nav>
      </div>
    </header>
  );
}