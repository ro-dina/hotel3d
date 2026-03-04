import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";
import ChatWidget from "@/app/components/ChatWidget";
import { Suspense } from "react";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Hotel3D",
  description: "3Dでホテルを見て、予約できるアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored === "dark" || (!stored && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();`}
        </Script>
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {/* ← Header は useSearchParams を使うので Suspense で包む */}
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main className="min-h-screen w-full pt-16">
          <div className="w-full border-b border-[var(--border)] bg-[var(--surface-alt)]">
            <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-[var(--muted-foreground)]">
              全てのホテルや値、情報は完全に架空のものであり、現存する何かと一切の関係がありません。
            </div>
          </div>
          {children}
        </main>
        <ChatWidget />
      </body>
    </html>
  );
}
