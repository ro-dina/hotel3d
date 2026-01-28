import Image from "next/image";
import Link from "next/link";
import { HOTELS } from "@/app/data/mockHotels";
import type { Hotel } from "@/types/Hotel";

// -----------------------------------------------------------------------------
// HELPER: 数値生成ロジック (Pseudo Random Generator)
// -----------------------------------------------------------------------------

const pseudoRandom = (seed: number, offset: number = 0) => {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
};

const range = (id: number, min: number, max: number, offset: number) => {
  const r = pseudoRandom(id, offset);
  return Math.floor(r * (max - min + 1)) + min;
};

const floatRange = (
  id: number,
  min: number,
  max: number,
  offset: number,
  fixed: number = 1
) => {
  const r = pseudoRandom(id, offset);
  const val = r * (max - min) + min;
  return val.toFixed(fixed);
};

// -----------------------------------------------------------------------------
// DATA GENERATORS: 数値データの生成
// -----------------------------------------------------------------------------

const getExtendedSpecs = (id: number) => {
  return {
    // 3Dスキャンデータ
    polygons: `${range(id, 1, 8, 1)}.${range(id, 1, 9, 2)}M`,
    dataSize: `${range(id, 100, 800, 3)} MB`,
    scanDate: `2025.12.${range(id, 1, 30, 4)}`,

    // 空間物理データ (寸法)
    area: range(id, 20, 60, 5),
    ceilingHeight: floatRange(id, 2.3, 3.5, 6, 2),
    doorWidth: range(id, 75, 110, 7),
    corridorWidth: range(id, 85, 140, 8),
    stepHeight: range(id, 0, 150, 9),

    // 環境センサーデータ
    temperature: floatRange(id, 21.0, 24.5, 10, 1),
    humidity: range(id, 35, 55, 11),
    noiseLevel: range(id, 25, 45, 12),
    illuminance: range(id, 300, 800, 13),
    co2: range(id, 400, 900, 14),

    // ネットワーク/設備
    wifiSpeed: range(id, 120, 800, 15),
    ping: range(id, 4, 18, 16),
    outlets: range(id, 4, 12, 17),

    // スコアリング
    accessibilityScore: range(id, 75, 99, 18),
    workabilityScore: range(id, 60, 98, 19),
  };
};

// アメニティリスト（日本語化）
const AMENITIES = [
  "高速Wi-Fi 6",
  "ハーマンミラー製チェア",
  "4K HDRモニター",
  "スマートロック",
  "HEPA空気清浄機",
  "ネスプレッソマシン",
  "レインシャワー",
  "完全防音壁",
  "調光システム",
  "Google Nest Hub",
  "ヨガマット",
  "ミニバー完備",
];

const getAmenities = (id: number) => {
  const count = range(id, 6, 10, 20);
  const shuffled = [...AMENITIES].sort(
    (a, b) => pseudoRandom(id, a.length) - 0.5
  );
  return shuffled.slice(0, count);
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export async function generateStaticParams() {
  return HOTELS.map((h) => ({ id: String(h.id) }));
}

type RouteParams = { id: string };

export default async function HotelDetailPage(props: unknown) {
  const { params } = props as { params: RouteParams };
  const { id } = params;
  const hotelIdNum = parseInt(id, 10);
  const hotel: Hotel | undefined = HOTELS.find((h) => String(h.id) === id);

  if (!hotel)
    return <div className="p-10 text-center text-slate-500">データが見つかりません</div>;

  const specs = getExtendedSpecs(hotelIdNum);
  const amenities = getAmenities(hotelIdNum);

  return (
    <main className="min-h-screen pb-20 bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      
      {/* HEADER IMAGE */}
      <div className="relative h-[55vh] w-full overflow-hidden bg-black">
        <Image
          src={hotel.imageUrl}
          alt={hotel.name}
          fill
          className="object-cover opacity-70"
          priority
          unoptimized
        />
        {/* ダーク/ライト両対応のグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-slate-950 via-transparent to-black/40" />

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="bg-black/40 backdrop-blur text-white px-4 py-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition text-sm font-bold flex items-center gap-1"
          >
            <span>←</span> ホテル一覧に戻る
          </Link>
        </div>

        {/* Title Area */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded mb-4 shadow-lg">
              <span>ID: {hotel.id.toString().padStart(4, "0")}</span>
              <span className="w-1 h-3 bg-white/30" />
              <span>3D計測済み</span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-black mb-2 text-slate-900 dark:text-white leading-none drop-shadow-xl"
            >
              {hotel.name}
            </h1>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200 max-w-2xl bg-white/60 dark:bg-black/40 backdrop-blur-sm p-2 rounded inline-block">
              {hotel.region}・{hotel.pref}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        
        {/* === LEFT COLUMN === */}
        <div className="space-y-8">
          
          {/* 1. PHYSICAL DIMENSIONS */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              空間計測データ
              <span className="text-xs text-gray-400 dark:text-slate-500 font-normal ml-auto font-mono">
                LASER SCAN DATA
              </span>
            </h2>

            {/* メインの広さと高さ */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col justify-center items-center text-center">
                <div className="text-xs text-gray-500 dark:text-slate-400 font-bold mb-1">
                  床面積 (実測)
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-white">
                  {specs.area}
                  <span className="text-lg font-medium ml-1 text-gray-500 dark:text-slate-400">㎡</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col justify-center items-center text-center">
                <div className="text-xs text-gray-500 dark:text-slate-400 font-bold mb-1">
                  天井高 (最大)
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-white">
                  {specs.ceilingHeight}
                  <span className="text-lg font-medium ml-1 text-gray-500 dark:text-slate-400">m</span>
                </div>
              </div>
            </div>

            {/* アクセシビリティ詳細数値 */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <DataCard
                label="ドア有効幅"
                value={`${specs.doorWidth} cm`}
                sub="車椅子・大型荷物"
              />
              <DataCard
                label="廊下幅(最小)"
                value={`${specs.corridorWidth} cm`}
                sub="すれ違い可否"
              />
              <DataCard
                label="最大段差"
                value={`${specs.stepHeight} mm`}
                sub="バリアフリー計測"
                warning={Number(specs.stepHeight) > 100}
              />
            </div>
          </section>

          {/* 2. ENVIRONMENTAL SENSORS (Always Dark Theme for this card) */}
          <section className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 blur-[80px] opacity-30" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
              <span className="text-blue-500">/-/</span> 環境センサー情報
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              <SensorGauge
                label="室温"
                value={specs.temperature}
                unit="°C"
                color="#FF5500"
              />
              <SensorGauge
                label="湿度"
                value={specs.humidity}
                unit="%"
                color="#00AAFF"
              />
              <SensorGauge
                label="騒音レベル"
                value={specs.noiseLevel}
                unit="dB"
                color={Number(specs.noiseLevel) < 40 ? "#00FFaa" : "#FFaa00"}
              />
              <SensorGauge
                label="CO2濃度"
                value={specs.co2}
                unit="ppm"
                color="#aaaaaa"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 font-mono flex justify-between">
              <span>センサーID: {id}-X99</span>
              <span>最終更新: 30秒前</span>
            </div>
          </section>

          {/* 3. CONNECTIVITY & WORK */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
              通信・作業環境
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-500 dark:text-slate-400">
                    回線速度 (下り)
                  </span>
                  <span className="font-black text-xl text-slate-900 dark:text-white">
                    {specs.wifiSpeed} Mbps
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{
                      width: `${Math.min(Number(specs.wifiSpeed) / 10, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 dark:text-slate-500 font-bold mb-1">
                      Ping値
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">{specs.ping} ms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 dark:text-slate-500 font-bold mb-1">
                      コンセント数
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">{specs.outlets} 口</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 dark:text-slate-500 font-bold mb-1">
                      照度 (机上)
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">{specs.illuminance} lux</div>
                  </div>
                </div>
              </div>

              {/* スコアリング円グラフ */}
              <div className="flex gap-4">
                <CircleScore
                  score={Number(specs.workabilityScore)}
                  label="作業快適度"
                />
                <CircleScore
                  score={Number(specs.accessibilityScore)}
                  label="バリアフリー"
                />
              </div>
            </div>
          </section>

          {/* 4. DESCRIPTION & AMENITIES */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors">
            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">施設概要</h3>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-8">
              {hotel.description}
              <br />
              <br />
              この空間は、LiDARスキャンと環境センサーによってデジタル化されています。
              ポリゴン数 {specs.polygons}、データサイズ {specs.dataSize}{" "}
              の高精細モデルにより、 現地の空気感まで再現されています。
            </p>

            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">設備・アメニティ</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenities.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded border border-gray-100 dark:border-slate-700"
                >
                  <span className="text-blue-500">✓</span> {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* === RIGHT COLUMN (Sticky) === */}
        <div className="relative">
          <div className="sticky top-24 space-y-4">
            
            {/* 3D LAUNCHER CARD (Always Dark Theme) */}
            <div className="bg-slate-950 text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden group border border-slate-800">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <div className="relative z-10">
                <div className="text-xs font-bold text-red-500 tracking-widest mb-2">
                  IMMERSIVE MODE
                </div>
                <h3 className="text-2xl font-black mb-4">3Dモデルを起動</h3>
                <p className="text-slate-400 text-sm mb-6">
                  ブラウザ上で空間に入り、寸法や家具配置を確認します。
                </p>
                <a
                  href={`/view3d/${hotel.id}`}
                  className="block w-full py-4 bg-white text-black font-black text-center rounded-lg hover:scale-105 transition transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  体験を開始する →
                </a>
              </div>
            </div>

            {/* BOOKING CARD */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-500 dark:text-slate-400 text-sm">
                  1泊 / 1名
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ¥{hotel.price.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between border-b border-dashed border-gray-200 dark:border-slate-700 py-2">
                  <span className="text-gray-500 dark:text-slate-400">計測日</span>
                  <span className="font-mono text-slate-700 dark:text-slate-200">{specs.scanDate}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-gray-200 dark:border-slate-700 py-2">
                  <span className="text-gray-500 dark:text-slate-400">ポリゴン数</span>
                  <span className="font-mono text-slate-700 dark:text-slate-200">{specs.polygons}</span>
                </div>
              </div>

              <a
                href={`/reserve/${hotel.id}`}
                className={`block w-full py-3 rounded-lg font-bold text-center text-white transition ${
                  hotel.available
                    ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
                    : "bg-gray-400 dark:bg-slate-700 cursor-not-allowed"
                }`}
              >
                {hotel.available ? "今すぐ予約する" : "キャンセル待ち"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// -----------------------------------------------------------------------------
// UI COMPONENTS
// -----------------------------------------------------------------------------

type DataCardProps = {
  label: string;
  value: string | number;
  sub: string;
  warning?: boolean;
};

function DataCard({ label, value, sub, warning }: DataCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-colors ${
        warning
          ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50"
          : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
      }`}
    >
      <div
        className={`text-[10px] font-bold tracking-wider mb-1 ${
          warning ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-slate-500"
        }`}
      >
        {label}
      </div>
      <div
        className={`text-xl md:text-2xl font-black ${
          warning ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

type SensorGaugeProps = {
  label: string;
  value: string | number;
  unit: string;
  color: string;
};

function SensorGauge({ label, value, unit, color }: SensorGaugeProps) {
  return (
    <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
      <div className="text-[10px] text-gray-400 font-bold mb-1">{label}</div>
      <div className="text-2xl font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-gray-500">{unit}</div>
    </div>
  );
}

type CircleScoreProps = {
  score: number;
  label: string;
};

function CircleScore({ score, label }: CircleScoreProps) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          className="text-gray-100 dark:text-slate-700"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={score > 80 ? "#00AAFF" : "#FFaa00"}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-sm font-black text-slate-900 dark:text-white">{score}</div>
        <div className="text-[8px] font-bold text-gray-500 dark:text-slate-500">{label}</div>
      </div>
    </div>
  );
}