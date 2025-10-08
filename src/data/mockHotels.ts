// src/data/mockHotels.ts
import type { Hotel } from "@/types/Hotel";

// page.tsx が import している名前に合わせて HOTELS をエクスポート
export const HOTELS: Hotel[] = [
  {
    id: 1,
    name: "京都グランドホテル",
    description: "京都駅から徒歩5分の便利な立地。和とモダンが融合したデザイン。",
    price: 12000,
    pref: "京都",
    region: "近畿",
    type: "hotel",
    breakfast: true,
    imageUrl: "/images/kyoto1.png",
    available: true
  },
  {
    id: 2,
    name: "京都リバーサイドイン",
    description: "鴨川沿いに位置する静かなホテル。川沿いの散歩に最適。",
    price: 15000,
    pref: "京都",
    region: "近畿",
    type: "minpaku",
    breakfast: false,
    imageUrl: "/images/kyoto2.png",
    available: false
  },
  {
    id: 3,
    name: "東京シティホテル",
    description: "新宿駅から徒歩圏内、ビジネスにも観光にも便利。",
    price: 18000,
    pref: "東京",
    region: "関東",
    type: "hotel",
    breakfast: true,
    imageUrl: "/images/tokyo1.png",
    available: true
  },
  {
    id: 4,
    name: "東京ベイリゾート",
    description: "東京湾沿いの絶景リゾートホテル。夜景が美しい。",
    price: 25000,
    pref: "東京",
    region: "関東",  
    type: "hotel",
    breakfast: true,
    imageUrl: "/images/tokyo2.png",
    available: true
  },
  {
    id: 5,
    name: "大阪ビジネスホテル",
    description: "梅田駅から徒歩2分。出張に最適なロケーション。",
    price: 9000,
    pref: "大阪",
    region: "近畿",  
    type: "hotel",
    breakfast: false,
    imageUrl: "/images/osaka1.png",
    available: true
  },
  {
    id: 6,
    name: "大阪ベイタワー",
    description: "大阪湾の夜景を一望できる高層ホテル。",
    price: 20000,
    pref: "大阪",
    region: "近畿",  
    type: "hotel",
    breakfast: true,
    imageUrl: "/images/osaka2.png",
    available: false
  },
  {
    id: 7,
    name: "札幌スノーホテル",
    description: "雪景色と温泉が楽しめる札幌の人気ホテル。",
    price: 16000,
    pref: "北海道",
    region: "北海道",  
    type: "hotel",
    breakfast: true,
    imageUrl: "/images/sapporo1.png",
    available: true
  },
  {
    id: 8,
    name: "札幌シティイン",
    description: "札幌駅から徒歩3分、観光に便利なホテル。",
    price: 13000,
    pref: "北海道",
    region: "北海道",  
    type: "minpaku",
    breakfast: false,
    imageUrl: "/images/sapporo2.png",
    available: true
  },
  {
    id: 9,
    name: "福岡ベイサイド",
    description: "海風が心地よいベイエリアのホテル。",
    price: 14000,
    pref: "福岡",
    region: "九州",  
    type: "hotel",
    breakfast: true,
    imageUrl: "/images/fukuoka1.jpg",
    available: true
  },
  {
    id: 10,
    name: "那覇ステイ",
    description: "国際通り近くの便利な立地。観光の拠点に。",
    price: 11000,
    pref: "沖縄",
    region: "沖縄",  
    type: "minpaku",
    breakfast: false,
    imageUrl: "/images/naha1.jpg",
    available: true
  },
  {
    id: 11,
    name: "大阪なんばホステル",
    description: "グループ旅行に人気のドミトリースタイル。",
    price: 6000,
    pref: "大阪",
    region: "近畿",  
    type: "minpaku",
    breakfast: false,
    imageUrl: "/images/osaka3.jpg",
    available: true
  },
  {
    id: 12,
    name: "京都祇園ラグジュアリー",
    description: "祇園の路地裏に佇む隠れ家ホテル。",
    price: 30000,
    pref: "京都",
    region: "近畿",  
    type: "hotel",
    breakfast: true,
    imageUrl: "/images/kyoto3.jpg",
    available: true
  }
];