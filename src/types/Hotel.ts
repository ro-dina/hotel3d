// src/types/hotel.ts
export type Hotel = {
  id: number;
  name: string;
  description: string;
  price: number;
  lat: number;
  lng: number;
  available: boolean;
  /** 互換のため維持: 主に日本向けの大分類 */
  region: string;
  imageUrl: string;
  /** 任意: ホテル or 民泊 */
  type?: "hotel" | "minpaku";
  /** 任意: 朝食の有無 */
  breakfast?: boolean;
  /** 任意: 都道府県（自由入力可） */
  pref?: string;
  /** 国コード (ISO 3166-1 alpha-2) */
  countryCode?: string;
  /** 国名（表示用） */
  country?: string;
  /** 行政区画レベル1（州/県/都道府県など） */
  admin1?: string;
  /** 都市名 */
  city?: string;
  /** 地区・駅名など */
  district?: string;
  /** 地名検索用の同義語 */
  searchAliases?: string[];
};

export type ReservationDraft = {
  hotelId: number;
  hotelName: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  country: string;
  stateCity: string;
  addressLine1: string;
  addressLine2: string;
  cardHolder: string;
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvc: string;
  checkIn: string;   // ISO yyyy-mm-dd
  checkOut: string;  // ISO yyyy-mm-dd
  guests: number;
  price: number;
};
