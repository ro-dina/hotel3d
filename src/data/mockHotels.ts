// src/data/mockHotels.ts
import { Hotel } from "@/types/Hotel";

export const mockHotels: Hotel[] = [
  {
    id: 1,
    name: "ホテル東京",
    description: "都心の便利なロケーション",
    price: 12000,
    available: true,
    imageUrl: "/images/hotel1.jpeg",
  },
  {
    id: 2,
    name: "ホテル京都",
    description: "伝統とモダンが融合した宿泊体験",
    price: 15000,
    available: false,
    imageUrl: "/images/hotel2.jpeg",
  },
  // 他のホテルも同様に
];
