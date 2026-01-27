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
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header)] backdrop-blur">
      <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
        <Link href="/" className="font-semibold text-lg">Hotel3D</Link>
        <nav className="text-sm text-[var(--muted-foreground)] flex gap-3">
          <Link href="/">ホーム</Link>
          <Link href="/about">このサイトについて</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
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
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground-strong)]">
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
        {/* <form onSubmit={onSubmit} className="ml-auto flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ホテル名/地域で検索"
            className="border rounded px-3 py-1"
          />
          <button className="px-3 py-1 bg-blue-600 text-white rounded">検索</button>
        </form> */}
      </div>
    </header>
  );
}
