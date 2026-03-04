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
    const address = typeof body?.address === "string" ? body.address.trim() : null;
    const cardNumberRaw = typeof body?.cardNumber === "string" ? body.cardNumber.replace(/\s|-/g, "") : null;
    const heightCmRaw = Number(body?.heightCm);
    const bodyWidthPercentRaw = Number(body?.bodyWidthPercent);
    const hasHeight = Number.isFinite(heightCmRaw);
    const hasWidth = Number.isFinite(bodyWidthPercentRaw);

    const clampedHeightCm = Math.min(220, Math.max(120, Math.round(heightCmRaw)));
    const clampedBodyWidthPercent = Math.min(140, Math.max(70, Math.round(bodyWidthPercentRaw)));

    const hasCardInput = cardNumberRaw !== null;

    if (
      !name &&
      !password &&
      bookingEmail === null &&
      phone === null &&
      address === null &&
      !hasHeight &&
      !hasWidth &&
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

    const cardEncrypted =
      cardNumberRaw && cardNumberRaw.length > 0 ? encryptText(cardNumberRaw) : null;
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
        ...(address !== null ? { address: address || null } : {}),
        ...(hasHeight ? { heightCm: clampedHeightCm } : {}),
        ...(hasWidth ? { bodyWidthPercent: clampedBodyWidthPercent } : {}),
        ...(hasCardInput
          ? {
              cardEncrypted,
              cardLast4,
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        bookingEmail: true,
        phone: true,
        address: true,
        heightCm: true,
        bodyWidthPercent: true,
        cardLast4: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "アカウント更新に失敗しました" }, { status: 500 });
  }
}
