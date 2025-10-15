import { HOTELS } from "@/data/mockHotels";

export async function generateStaticParams() {
  return HOTELS.map(h => ({ id: String(h.id) }));
}

type RouteParams = { id: string };

export default async function Page(props: unknown) {
  const { params } = props as { params: RouteParams };
  const { id } = params;

  // 将来: ホテルに紐づく Unity 空間内座標をサーバから取得する想定
  const warp = { x: 10, y: 0, z: 5 };

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">3Dビュー（ホテルID: {id}）</h1>
      <div className="w-full aspect-video border rounded overflow-hidden">
        {/* 例: /public/unity/hotel{id}/index.html を配置すると読み込めます */}
        <iframe
          id="unityFrame"
          src={`/unity/hotel${id}/index.html`}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Web→Unityへ座標を送る例（postMessage）
            window.addEventListener('message', (ev) => {
              // Unityからのメッセージ受け取り用
              console.log('[Unity->Web]', ev.data);
            });
            // 初期ワープ通知（Unity側にリスナー実装が必要）
            window.addEventListener('load', () => {
              const f = document.getElementById('unityFrame');
              if (f && f.contentWindow) {
                const message = { type: 'warpTo', payload: ${JSON.stringify(warp)} };
                f.contentWindow.postMessage(message, '*');
              }
            });
          `,
        }}
      />
    </main>
  );
}