import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  const { type, subject, fields } = await request.json();

  const rows = Object.entries(fields as Record<string, string>)
    .map(
      ([key, value]) =>
        `<tr>
          <td style="padding:6px 12px 6px 0;font-weight:600;color:#555;white-space:nowrap;vertical-align:top;">${humanise(key)}</td>
          <td style="padding:6px 0;color:#222;">${String(value).replace(/\n/g, "<br/>")}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;">
      <h2 style="color:#8B3A2F;margin-bottom:4px;">${type}</h2>
      <p style="color:#888;font-size:13px;margin-top:0;">Submitted via BridgeCross Map</p>
      <table style="border-collapse:collapse;width:100%;margin-top:16px;font-size:14px;">
        ${rows}
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"BridgeCross Map" <${process.env.GMAIL_USER}>`,
      to: "bridgecrossbio@gmail.com",
      subject,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mail error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

function humanise(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
