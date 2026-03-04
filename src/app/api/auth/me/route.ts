import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { decryptText } from "@/lib/secure";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      bookingEmail: user.bookingEmail,
      phone: user.phone,
      postalCode: user.postalCode,
      country: user.country,
      stateCity: user.stateCity,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      heightCm: user.heightCm,
      bodyWidthPercent: user.bodyWidthPercent,
      cardLast4: user.cardLast4,
      cardHolder: user.cardHolder,
      cardExpMonth: user.cardExpMonth,
      cardExpYear: user.cardExpYear,
      // デモ用途: ログイン本人に限って復号して返す
      cardNumber: user.cardEncrypted ? decryptText(user.cardEncrypted) : null,
    },
  });
}
