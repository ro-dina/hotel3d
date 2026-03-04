"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body =
        mode === "login"
          ? { email, password }
          : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? "認証に失敗しました");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {mode === "login" ? "ログイン" : "新規登録"}
      </h1>

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`px-3 py-2 rounded text-sm ${
            mode === "login"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`px-3 py-2 rounded text-sm ${
            mode === "signup"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
          }`}
        >
          新規登録
        </button>
      </div>

      <form className="space-y-4" onSubmit={submit}>
        {mode === "signup" && (
          <div>
            <label className="block text-sm mb-1">表示名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">パスワード（8文字以上）</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            minLength={8}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded py-2"
        >
          {loading ? "送信中..." : mode === "login" ? "ログインする" : "登録する"}
        </button>
      </form>
    </div>
  );
}
