# Hotel3D

**「宿泊の"イメージ違い"をゼロにする」**
3D空間での没入型体験と、物理データの可視化を組み合わせた、次世代の宿泊予約プラットフォームのプロトタイプです。

応用専門PBL2という授業の一環として開発されました。

---

## 📖 概要 (Concept)

従来の宿泊予約サイトでは、広角レンズで撮影された「奇跡の一枚」に頼らざるを得ず、現地での「思ったより狭い」「使い勝手が悪い」といったミスマッチが課題でした。

本プロジェクト **Hotel3D"** は、Unity WebGLを用いた3Dスキャンデータの閲覧機能と、LiDARスキャンを想定した詳細な物理データ（寸法、環境センサー情報）を提供することで、**「想像」ではなく「計測」に基づいた予約体験**を実現します。

### 主な特徴

* **Immersive 3D Experience**: ブラウザ上で施設内を歩き回れるUnity WebGLの統合（デモ）。
* **Kinetic Typography & Art Design**: "About"ページにおける、視差効果（Parallax）やランダム生成テキストを用いた現代アート風の強力なビジュアル表現。
* **Physical Data Dashboard**: 部屋の広さだけでなく、ドア幅、段差、騒音レベル、照度などを可視化する「計測データ」ライクな詳細ページ。
* **Realtime Estimation**: 泊数・人数・単価から即座に合計金額を算出するインタラクティブな見積もり機能。
* **Universal Design**: ダークモード/ライトモードの完全対応と、レスポンシブデザインによるマルチデバイス対応。

---

## 🛠 技術スタック (Tech Stack)

### Frontend

* **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Motion**: CSS Animations, Native Hooks (Scroll/Mouse parallax)

### 3D / Assets

* **Engine**: Unity (WebGL Build)
* **Modeling**: Shade3D (想定ワークフロー)

### Infrastructure

* **Deployment**: Vercel

---

## 📸 スクリーンショット (Screenshots)

| Top Page / About (Art Mode) | Hotel Detail (Dark Mode) |
| --- | --- |
| <img src="[https://via.placeholder.com/600x400?text=About+Page+Screenshot](https://www.google.com/search?q=https://via.placeholder.com/600x400%3Ftext%3DAbout%2BPage%2BScreenshot)" alt="About Page" width="400"/> | <img src="[https://via.placeholder.com/600x400?text=Detail+Page+Screenshot](https://www.google.com/search?q=https://via.placeholder.com/600x400%3Ftext%3DDetail%2BPage%2BScreenshot)" alt="Detail Page" width="400"/> |
| *カオスなコラージュと動的テキスト* | *計測データを表示するダッシュボードUI* |

| Reservation Flow | Mobile Responsive |
| --- | --- |
| <img src="[https://via.placeholder.com/600x400?text=Reserve+Form](https://www.google.com/search?q=https://via.placeholder.com/600x400%3Ftext%3DReserve%2BForm)" alt="Reservation Form" width="400"/> | <img src="[https://via.placeholder.com/600x400?text=Mobile+View](https://www.google.com/search?q=https://via.placeholder.com/600x400%3Ftext%3DMobile%2BView)" alt="Mobile View" width="400"/> |
| *リアルタイム見積もり機能* | *スマホに最適化されたヘッダーとUI* |

---

## 🚀 ローカルでの実行方法 (Getting Started)

### 前提条件

* Node.js 18.17 以降

### インストール手順

1. リポジトリをクローンします。
```bash
git clone https://github.com/your-username/hotel3d.git
cd hotel3d

```


2. 依存パッケージをインストールします。
```bash
npm install
# または
pnpm install
yarn install

```


3. 開発サーバーを起動します。
```bash
npm run dev

```


4. ブラウザで `http://localhost:3000` にアクセスしてください。

---

## 📂 ディレクトリ構成 (Structure)

```
hotel3d/
├── app/
│   ├── about/          # アート/コラージュ演出のAboutページ
│   ├── hotels/         # ホテル一覧
│   ├── reserve/[id]/   # 予約フォーム (Server/Client components分離)
│   ├── view3d/[id]/    # Unity WebGL表示ページ
│   └── layout.tsx      # テーマ切り替えを含むルートレイアウト
├── components/
│   └── Header.tsx      # レスポンシブ対応ヘッダー
├── public/
│   ├── images/         # ホテル画像アセット
│   └── unity/          # Unity WebGLビルドファイル
└── types/              # TypeScript型定義

```

---

## ⚠️ 免責事項 (Disclaimer)

本プロジェクトはPBL（課題解決型学習）のために作成されたデモンストレーションです。
掲載されているホテル名、価格、スペック（ポリゴン数やセンサー情報など）はすべて**架空のもの**であり、実在する施設や団体とは一切関係ありません。

また、Unity WebGLコンテンツが含まれるため、モバイル環境ではデータ通信量にご注意ください。

---

© 2026 応用専門PBL-FVC. All Rights Reserved.