import { NextResponse } from "next/server";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptText } from "@/lib/secure";

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const bookingEmail = typeof body?.bookingEmail === "string" ? body.bookingEmail.trim() : null;
    const phone = typeof body?.phone === "string" ? body.phone.trim() : null;
    const postalCode = typeof body?.postalCode === "string" ? body.postalCode.trim() : null;
    const country = typeof body?.country === "string" ? body.country.trim() : null;
    const stateCity = typeof body?.stateCity === "string" ? body.stateCity.trim() : null;
    const addressLine1 = typeof body?.addressLine1 === "string" ? body.addressLine1.trim() : null;
    const addressLine2 = typeof body?.addressLine2 === "string" ? body.addressLine2.trim() : null;
    const cardNumberRaw = typeof body?.cardNumber === "string" ? body.cardNumber.replace(/\s|-/g, "") : null;
    const cardCvcRaw = typeof body?.cardCvc === "string" ? body.cardCvc.replace(/\D/g, "") : null;
    const cardHolder = typeof body?.cardHolder === "string" ? body.cardHolder.trim() : null;
    const cardExpMonthRaw = Number(body?.cardExpMonth);
    const cardExpYearRaw = Number(body?.cardExpYear);
    const heightCmRaw = Number(body?.heightCm);
    const bodyWidthPercentRaw = Number(body?.bodyWidthPercent);
    const hasHeight = Number.isFinite(heightCmRaw);
    const hasWidth = Number.isFinite(bodyWidthPercentRaw);
    const hasCardExpMonth = Number.isFinite(cardExpMonthRaw);
    const hasCardExpYear = Number.isFinite(cardExpYearRaw);

    const clampedHeightCm = Math.min(220, Math.max(120, Math.round(heightCmRaw)));
    const clampedBodyWidthPercent = Math.min(140, Math.max(70, Math.round(bodyWidthPercentRaw)));
    const cardExpMonth = Math.min(12, Math.max(1, Math.round(cardExpMonthRaw)));
    const cardExpYear = Math.min(2100, Math.max(2020, Math.round(cardExpYearRaw)));

    const hasCardInput = cardNumberRaw !== null;

    if (
      !name &&
      !password &&
      bookingEmail === null &&
      phone === null &&
      postalCode === null &&
      country === null &&
      stateCity === null &&
      addressLine1 === null &&
      addressLine2 === null &&
      !hasHeight &&
      !hasWidth &&
      cardHolder === null &&
      cardCvcRaw === null &&
      !hasCardExpMonth &&
      !hasCardExpYear &&
      !hasCardInput
    ) {
      return NextResponse.json({ error: "変更項目がありません" }, { status: 400 });
    }
    if (password && password.length < 8) {
      return NextResponse.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });
    }
    if (bookingEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(bookingEmail)) {
      return NextResponse.json({ error: "予約用メールアドレスの形式が不正です" }, { status: 400 });
    }
    if (cardNumberRaw && !/^\d{12,19}$/.test(cardNumberRaw)) {
      return NextResponse.json({ error: "カード番号の形式が不正です" }, { status: 400 });
    }
    if (cardCvcRaw && !/^\d{3,4}$/.test(cardCvcRaw)) {
      return NextResponse.json({ error: "セキュリティコードの形式が不正です" }, { status: 400 });
    }

    const cardEncrypted =
      cardNumberRaw && cardNumberRaw.length > 0 ? encryptText(cardNumberRaw) : null;
    const cardCvcEncrypted =
      cardCvcRaw && cardCvcRaw.length > 0 ? encryptText(cardCvcRaw) : null;
    const cardLast4 =
      cardNumberRaw && cardNumberRaw.length >= 4
        ? cardNumberRaw.slice(-4)
        : null;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...(password ? { passwordHash: hashPassword(password) } : {}),
        ...(bookingEmail !== null ? { bookingEmail: bookingEmail || null } : {}),
        ...(phone !== null ? { phone: phone || null } : {}),
        ...(postalCode !== null ? { postalCode: postalCode || null } : {}),
        ...(country !== null ? { country: country || null } : {}),
        ...(stateCity !== null ? { stateCity: stateCity || null } : {}),
        ...(addressLine1 !== null ? { addressLine1: addressLine1 || null } : {}),
        ...(addressLine2 !== null ? { addressLine2: addressLine2 || null } : {}),
        ...(hasHeight ? { heightCm: clampedHeightCm } : {}),
        ...(hasWidth ? { bodyWidthPercent: clampedBodyWidthPercent } : {}),
        ...(cardHolder !== null ? { cardHolder: cardHolder || null } : {}),
        ...(hasCardExpMonth ? { cardExpMonth } : {}),
        ...(hasCardExpYear ? { cardExpYear } : {}),
        ...(hasCardInput
          ? {
              cardEncrypted,
              cardLast4,
            }
          : {}),
        ...(cardCvcRaw !== null
          ? {
              cardCvcEncrypted,
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        bookingEmail: true,
        phone: true,
        postalCode: true,
        country: true,
        stateCity: true,
        addressLine1: true,
        addressLine2: true,
        heightCm: true,
        bodyWidthPercent: true,
        cardLast4: true,
        cardHolder: true,
        cardExpMonth: true,
        cardExpYear: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "アカウント更新に失敗しました" }, { status: 500 });
  }
}
