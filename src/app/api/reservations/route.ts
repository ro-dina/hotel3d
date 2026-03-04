import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptText } from "@/lib/secure";
import { sendReservationMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const hotelId = Number(body?.hotelId);
    const hotelName = String(body?.hotelName ?? "").trim();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const phone = String(body?.phone ?? "").trim();
    const checkIn = String(body?.checkIn ?? "");
    const checkOut = String(body?.checkOut ?? "");
    const guests = Number(body?.guests ?? 1);
    const nights = Number(body?.nights ?? 0);
    const total = Number(body?.total ?? 0);

    const postalCode = String(body?.postalCode ?? "").trim();
    const country = String(body?.country ?? "").trim();
    const stateCity = String(body?.stateCity ?? "").trim();
    const addressLine1 = String(body?.addressLine1 ?? "").trim();
    const addressLine2 = String(body?.addressLine2 ?? "").trim();

    const cardHolder = String(body?.cardHolder ?? "").trim();
    const cardNumber = String(body?.cardNumber ?? "").replace(/\s|-/g, "");
    const cardLast4 = cardNumber.length >= 4 ? cardNumber.slice(-4) : "";
    const cardEncrypted = cardNumber ? encryptText(cardNumber) : null;
    const cardCvc = String(body?.cardCvc ?? "").replace(/\D/g, "");
    const cardCvcEncrypted = cardCvc ? encryptText(cardCvc) : null;
    const cardExpMonth = Number(body?.cardExpMonth ?? 0);
    const cardExpYear = Number(body?.cardExpYear ?? 0);

    if (!hotelId || !hotelName || !name || !email) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "メールアドレス形式が不正です" }, { status: 400 });
    }
    if (!/^\d{12,19}$/.test(cardNumber)) {
      return NextResponse.json({ error: "カード番号の形式が不正です" }, { status: 400 });
    }
    if (!/^\d{3,4}$/.test(cardCvc)) {
      return NextResponse.json({ error: "セキュリティコードの形式が不正です" }, { status: 400 });
    }
    if (!(cardExpMonth >= 1 && cardExpMonth <= 12) || !(cardExpYear >= 2020 && cardExpYear <= 2100)) {
      return NextResponse.json({ error: "有効期限の形式が不正です" }, { status: 400 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        hotelId,
        name,
        email,
        phone: phone || null,
        guests: Math.max(1, Math.round(guests)),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        nights: Math.max(0, Math.round(nights)),
        total: Number.isFinite(total) ? total : 0,
        postalCode: postalCode || null,
        country: country || null,
        stateCity: stateCity || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
        cardHolder: cardHolder || null,
        cardLast4: cardLast4 || null,
      },
      select: { id: true },
    });

    const mailResult = await sendReservationMail({
      to: email,
      guestName: name,
      hotelName,
      checkIn,
      checkOut,
      total: Number.isFinite(total) ? total : 0,
    });

    return NextResponse.json({
      ok: true,
      reservationId: reservation.id,
      mailSent: mailResult.sent,
      cardStoredEncrypted: Boolean(cardEncrypted && cardCvcEncrypted),
    });
  } catch {
    return NextResponse.json({ error: "予約確定に失敗しました" }, { status: 500 });
  }
}
