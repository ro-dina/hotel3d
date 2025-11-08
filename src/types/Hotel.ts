// src/types/hotel.ts
export type Hotel = {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  region: string;
  imageUrl: string;
  /** 任意: ホテル or 民泊 */
  type?: "hotel" | "minpaku";
  /** 任意: 朝食の有無 */
  breakfast?: boolean;
  /** 任意: 都道府県（自由入力可） */
  pref?: string;
};

export type ReservationDraft = {
  hotelId: number;
  hotelName: string;
  name: string;
  email: string;
  phone: string;
  checkIn: string;   // ISO yyyy-mm-dd
  checkOut: string;  // ISO yyyy-mm-dd
  guests: number;
  price: number;
};