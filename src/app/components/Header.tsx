"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";

export default function Header() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState("");

  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const u = new URL(window.location.href);
    if (q) u.searchParams.set("q", q);
    else u.searchParams.delete("q");
    router.push(u.pathname + "?" + u.searchParams.toString());
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
        <Link href="/" className="font-semibold text-lg">Hotel3D</Link>
        <nav className="text-sm text-gray-600 flex gap-3">
          <Link href="/">ホーム</Link>
          <Link href="/about">このサイトについて</Link>
        </nav>
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