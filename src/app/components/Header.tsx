"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial =
      stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  return (
    // h-16で高さを固定
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[var(--border)] bg-[var(--header)] backdrop-blur flex items-center">
      <div className="w-full max-w-6xl mx-auto px-4 flex items-center justify-between">
        
        {/* 左側：ロゴとナビゲーション */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden shrink-0">
          {/* ロゴ: スマホでは非表示 (hidden), PCで表示 (sm:block) */}
          <Link href="/" className="font-semibold text-lg whitespace-nowrap shrink-0 hidden sm:block">
            Hotel3D
          </Link>
          {/* ナビ: 常時表示 */}
          <nav className="text-sm text-[var(--muted-foreground)] flex gap-3 whitespace-nowrap">
            <Link href="/">ホーム</Link>
            <Link href="/about">このサイトについて</Link>
            <Link href="/login">ログイン</Link>
            <Link href="/account">アカウント</Link>
          </nav>
        </div>

        <div className="flex-1 flex items-center justify-center mx-2 min-w-0">
          <div className="hidden sm:block text-[10px] sm:text-xs text-[var(--muted-foreground)] whitespace-nowrap">
            <a href="https://github.com/ro-dina/hotel3d" target="_blank" rel="noopener noreferrer" className="hover:underline">
              GitHub開発リポジトリ
            </a>
          </div>
        </div>

        {/* 右側：テーマ切り替え */}
        <div className="flex items-center gap-3 shrink-0">
          {mounted ? (
            <>
              <button
                type="button"
                onClick={toggleTheme}
                role="switch"
                aria-checked={theme === "dark"}
                aria-label="Toggle theme"
                className="relative h-7 w-14 rounded-full border border-[var(--border)] bg-[var(--surface-alt)] p-1 transition-colors hover:border-slate-300"
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-[var(--foreground)] transition-transform ${
                    theme === "dark" ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
              {/* テキストラベルはスマホでは隠す */}
              <span className="hidden sm:block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground-strong)]">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            </>
          ) : (
            <div
              className="h-7 w-14 rounded-full border border-[var(--border)] bg-[var(--surface-alt)]"
              aria-hidden
            />
          )}
        </div>
      </div>
    </header>
  );
}
