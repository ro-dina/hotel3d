"use client";
import { use, useEffect, useRef } from "react";

// Next.js 15+ では params は Promise
type RouteParams = { id: string };

export default function Page({ params }: { params: Promise<RouteParams> }) {
  const { id } = use(params);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // PC/モバイルの簡易判定（誤検出を減らす）
  const detectMobile = (): boolean => {
    const ua = navigator.userAgent || "";
    const coarse = matchMedia("(pointer:coarse)").matches;
    const nav = navigator as Navigator & { maxTouchPoints?: number };
    const touchPoints = nav.maxTouchPoints ?? 0;
    return /Android|iPhone|iPad|iPod/i.test(ua) || (coarse && touchPoints > 0);
  };

  useEffect(() => {
    const isMobile = detectMobile();
    const frameEl = frameRef.current; // cleanup 用に退避

    const send = () => {
      frameEl?.contentWindow?.postMessage(
        { type: "setMobile", payload: isMobile ? 1 : 0 },
        "*"
      );
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
  }, []);

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">3Dビュー（ホテルID: {id}）</h1>
      <div className="w-full aspect-video border rounded overflow-hidden">
        <iframe
          ref={frameRef}
          id="unityFrame"
          src={`/view3d/WebGLBuild/index.html`}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    </main>
  );
}