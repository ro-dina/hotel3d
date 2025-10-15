import { HOTELS } from "@/data/mockHotels";
import type { Hotel } from "@/types/Hotel";
import ReserveClient from "./ReserveClient";

export async function generateStaticParams() {
  return HOTELS.map(h => ({ id: String(h.id) }));
}

type RouteParams = { id: string };

export default async function ReservePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const hotel: Hotel | undefined = HOTELS.find(h => String(h.id) === id);
  return <ReserveClient id={id} hotel={hotel} searchParams={{}} />;
}