// src/types/Hotel.ts
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
};

export type ReservationDraft = {
  hotelId: number;
  hotelName: string;
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  price: number;
};