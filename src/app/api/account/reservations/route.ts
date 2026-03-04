import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const emails = [user.email, user.bookingEmail].filter(
    (v): v is string => Boolean(v && v.trim())
  );

  const reservations = await prisma.reservation.findMany({
    where: {
      email: { in: emails.length > 0 ? emails : ["__none__"] },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      hotelId: true,
      name: true,
      email: true,
      guests: true,
      checkIn: true,
      checkOut: true,
      nights: true,
      total: true,
      createdAt: true,
      cardLast4: true,
    },
  });

  return NextResponse.json({ reservations });
}
