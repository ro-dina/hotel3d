import { HOTELS } from "@/app/data/mockHotels";
import type { Hotel } from "@/types/Hotel";
import ReserveClient from "./ReserveClient";

export async function generateStaticParams() {
  return HOTELS.map(h => ({ id: String(h.id) }));
}

type RouteParams = { id: string };

export default function ReservePage(props: unknown) {
  const { params, searchParams } = props as {
    params: RouteParams;
    searchParams?: { [key: string]: string | string[] | undefined };
  };

  const { id } = params;
  const hotel: Hotel | undefined = HOTELS.find(h => String(h.id) === id);

  return (
    <ReserveClient id={id} hotel={hotel} searchParams={searchParams ?? {}} />
  );
}