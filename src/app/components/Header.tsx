"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";

export default function Header() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const u = new URL(window.location.href);
    if (q) u.searchParams.set("q", q);
    else u.searchParams.delete("q");
    router.push(u.pathname + "?" + u.searchParams.toString());
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  return (
    // h-16で高さを固定
    <header className="sticky top-0 z-50 h-16 border-b border-[var(--border)] bg-[var(--header)] backdrop-blur flex items-center">
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
            <Link href="/about">About</Link>
          </nav>
        </div>

        {/* 中央エリア：注釈テキスト ＋ GitHubリンク */}
        {/* flexで横並びにする。親要素で余白を調整 */}
        <div className="flex-1 flex items-center justify-center gap-4 mx-2 min-w-0">
          
          {/* 1. 注釈テキスト (div) */}
          <div className="text-[10px] sm:text-xs text-[var(--muted-foreground)] truncate text-center">
            {/* スマホ用テキスト */}
            <span className="block sm:hidden">※全て架空です</span>
            {/* PC用テキスト */}
            <span className="hidden sm:block">全てのホテルや値、情報は完全に架空のものであり、現存する何かと一切の関係がありません</span>
          </div>

          {/* 2. GitHubリンク (div) - PCのみ表示 */}
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