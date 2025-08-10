// src/data/mockHotels.ts
import { Hotel } from "@/types/Hotel";

export const mockHotels: Hotel[] = [
  {
    id: 1,
    name: "京都グランドホテル",
    description: "京都駅から徒歩5分の便利な立地。和とモダンが融合したデザイン。",
    price: 12000,
    available: true,
    region: "京都",
    imageUrl: "/images/kyoto1.png"
  },
  {
    id: 2,
    name: "京都リバーサイドイン",
    description: "鴨川沿いに位置する静かなホテル。川沿いの散歩に最適。",
    price: 15000,
    available: false,
    region: "京都",
    imageUrl: "/images/kyoto2.png"
  },
  {
    id: 3,
    name: "東京シティホテル",
    description: "新宿駅から徒歩圏内、ビジネスにも観光にも便利。",
    price: 18000,
    available: true,
    region: "東京",
    imageUrl: "/images/tokyo1.png"
  },
  {
    id: 4,
    name: "東京ベイリゾート",
    description: "東京湾沿いの絶景リゾートホテル。夜景が美しい。",
    price: 25000,
    available: true,
    region: "東京",
    imageUrl: "/images/tokyo2.png"
  },
  {
    id: 5,
    name: "大阪ビジネスホテル",
    description: "梅田駅から徒歩2分。出張に最適なロケーション。",
    price: 9000,
    available: true,
    region: "大阪",
    imageUrl: "/images/osaka1.png"
  },
  {
    id: 6,
    name: "大阪ベイタワー",
    description: "大阪湾の夜景を一望できる高層ホテル。",
    price: 20000,
    available: false,
    region: "大阪",
    imageUrl: "/images/osaka2.png"
  },
  {
    id: 7,
    name: "札幌スノーホテル",
    description: "雪景色と温泉が楽しめる札幌の人気ホテル。",
    price: 16000,
    available: true,
    region: "札幌",
    imageUrl: "/images/sapporo1.png"
  },
  {
    id: 8,
    name: "札幌シティイン",
    description: "札幌駅から徒歩3分、観光に便利なホテル。",
    price: 13000,
    available: true,
    region: "札幌",
    imageUrl: "/images/sapporo2.png"
  }
];