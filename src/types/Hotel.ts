// src/types/Hotel.ts
export type Hotel = {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  region: string;     // 地域
  imageUrl: string;   // 画像URL
};