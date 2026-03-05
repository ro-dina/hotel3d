"use client";
import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";

// Next.js 15+ では params は Promise
type RouteParams = { id: string };

export default function Page({ params }: { params: Promise<RouteParams> }) {
  const { id } = use(params);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [bodyWidthPercent, setBodyWidthPercent] = useState<number>(100);
  const heightCmRef = useRef<number>(170);
  const bodyWidthPercentRef = useRef<number>(100);

  // 端末に応じて高さをフィット（モバイルのアドレスバーを考慮）
  const [vh, setVh] = useState<number>(0);
  useEffect(() => {
    const update = () => {
      const h = (window.visualViewport?.height ?? window.innerHeight);
      setVh(h);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // PC/モバイルの簡易判定（誤検出を減らす）
  const detectMobile = (): boolean => {
    const ua = navigator.userAgent || "";
    const coarse = matchMedia("(pointer:coarse)").matches;
    const nav = navigator as Navigator & { maxTouchPoints?: number };
    const touchPoints = nav.maxTouchPoints ?? 0;
    return /Android|iPhone|iPad|iPod/i.test(ua) || (coarse && touchPoints > 0);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const h = Number(json?.user?.heightCm);
        const w = Number(json?.user?.bodyWidthPercent);
        if (Number.isFinite(h)) setHeightCm(Math.max(120, Math.min(220, Math.round(h))));
        if (Number.isFinite(w)) setBodyWidthPercent(Math.max(70, Math.min(140, Math.round(w))));
      } catch {
        // ignore
      }
    };
    void loadProfile();
  }, []);

  useEffect(() => {
    const isMobile = detectMobile();
    const frameEl = frameRef.current; // cleanup 用に退避

    const send = () => {
      frameEl?.contentWindow?.postMessage(
        { type: "setMobile", payload: isMobile ? 1 : 0 },
        "*"
      );
      frameEl?.contentWindow?.postMessage(
        { type: "setHeight", payload: (heightCmRef.current / 100).toFixed(2) },
        "*"
      );
      frameEl?.contentWindow?.postMessage(
        { type: "setBodyWidth", payload: (bodyWidthPercentRef.current / 100).toFixed(2) },
        "*"
      );
      frameEl?.contentWindow?.postMessage({ type: "warpNow" }, "*");
      // 将来のID連携用（いまはランダム遷移で誤魔化す）
      // frameEl?.contentWindow?.postMessage(
      //   { type: "setHotelId", payload: id },
      //   "*"
      // );
    };

    const onLoad = () => send();
    frameEl?.addEventListener("load", onLoad);

    // Unity 側の初期化タイミング差吸収
    const t1 = setTimeout(send, 800);
    const t2 = setTimeout(send, 1800);
    const t3 = setTimeout(send, 3200);

    return () => {
      frameEl?.removeEventListener("load", onLoad);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [id]);

  useEffect(() => {
    heightCmRef.current = heightCm;
    const frameEl = frameRef.current;
    if (!frameEl) return;

    frameEl.contentWindow?.postMessage(
      { type: "setHeight", payload: (heightCm / 100).toFixed(2) },
      "*"
    );
  }, [heightCm]);

  useEffect(() => {
    bodyWidthPercentRef.current = bodyWidthPercent;
    const frameEl = frameRef.current;
    if (!frameEl) return;

    frameEl.contentWindow?.postMessage(
      { type: "setBodyWidth", payload: (bodyWidthPercent / 100).toFixed(2) },
      "*"
    );
  }, [bodyWidthPercent]);

  // ヘッダや余白ぶんのオフセット（適宜調整）
  const HEADER_OFFSET = 120; // px
  const containerStyle: React.CSSProperties = vh
    ? { height: Math.max(360, Math.round(vh - HEADER_OFFSET)) }
    : {};

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">操作方法: WASDで移動、Eで車椅子に乗る、Fでワープポイントに移動、Hでホテルメニュー</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-stretch">
        <div
          className="w-full border rounded overflow-hidden min-h-[360px]"
          style={containerStyle}
        >
          <iframe
            ref={frameRef}
            id="unityFrame"
            // 本番は GitHub Pages / ローカルは public 配下の WebGL を参照
            src={`${
              process.env.NODE_ENV === "production"
                ? "https://ro-dina.github.io/hotel3d/unity/WebGLBuild/index.html"
                : "/view3d/WebGLBuild/index.html"
            }?unityObject=HotelAutoWarpReceiver`}
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        <aside className="border border-gray-200 dark:border-gray-700 rounded p-4 space-y-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-2">
            <Link
              href={`/reserve/${id}`}
              className="block w-full rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              このホテルを予約する
            </Link>
          </div>

          <h2 className="text-lg font-semibold">身長設定</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            身長は縦横比を保って変化します。体型は腹囲スライダーで横幅だけ調整できます。
          </p>

          <label htmlFor="height-slider" className="block text-sm font-medium">
            身長: <span className="font-bold">{heightCm} cm</span>
          </label>
          <input
            id="height-slider"
            type="range"
            min={120}
            max={220}
            step={1}
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full"
          />

          <label htmlFor="body-width-slider" className="block text-sm font-medium">
            体型(腹囲): <span className="font-bold">{bodyWidthPercent}%</span>
          </label>
          <input
            id="body-width-slider"
            type="range"
            min={70}
            max={140}
            step={1}
            value={bodyWidthPercent}
            onChange={(e) => setBodyWidthPercent(Number(e.target.value))}
            className="w-full"
          />
        </aside>
      </div>
    </main>
  );
}
