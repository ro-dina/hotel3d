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
        <main className="min-h-screen w-full">{children}</main>
        <ChatWidget />
      </body>
    </html>
  );
}
