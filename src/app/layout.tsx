import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";
import { Suspense } from "react";

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
    <html lang="ja">
      <head />
      <body className="min-h-screen bg-slate-950 text-gray-900">
        {/* ← Header は useSearchParams を使うので Suspense で包む */}
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main className="min-h-screen w-full">{children}</main>
      </body>
    </html>
  );
}
