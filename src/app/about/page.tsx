import React from "react";
import Link from "next/link";

export const metadata = {
    title: "このサイトについて",
    description: "このサイトについての簡単な説明ページです。",
};

export default function AboutPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">このサイトについて</h1>

            <p className="mb-4">
                このサイトはホテルの3D表示での閲覧および予約を想定したデモサイトです。
                基本的な情報表示と3Dのテスト、予約の流れを確認できる最小限の機能で構成しています。
            </p>

            <p className="mb-4">
                技術スタック: Next.js / React / TypeScript / Tailwind CSS / Unity (WebGL Build)。
            </p>
            <Link href="/" className="text-blue-600 hover:underline">
                トップへ戻る
            </Link>
        </main>
    );
}