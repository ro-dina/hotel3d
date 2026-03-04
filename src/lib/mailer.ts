import nodemailer from "nodemailer";

type ReservationMail = {
  to: string;
  guestName: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  total: number;
};

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

export async function sendReservationMail(input: ReservationMail) {
  if (!hasSmtpConfig()) {
    return { sent: false, reason: "smtp_not_configured" as const };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: Number(process.env.SMTP_PORT!) === 465,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to: input.to,
    subject: `【予約確認】${input.hotelName}`,
    text: [
      `${input.guestName} 様`,
      "",
      `${input.hotelName} のご予約ありがとうございます。`,
      `チェックイン: ${input.checkIn}`,
      `チェックアウト: ${input.checkOut}`,
      `ご請求予定額: ¥${input.total.toLocaleString()}`,
      "",
      "このメールは自動送信です。",
    ].join("\n"),
  });

  return { sent: true as const };
}
