type ReservationMail = {
  to: string;
  guestName: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  total: number;
};

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

export async function sendReservationMail(input: ReservationMail) {
  if (!hasResendConfig()) {
    return { sent: false, reason: "resend_not_configured" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM!,
      to: [input.to],
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
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[mail] resend send failed:", response.status, body);
    return { sent: false, reason: "resend_send_failed" as const };
  }

  return { sent: true as const };
}
