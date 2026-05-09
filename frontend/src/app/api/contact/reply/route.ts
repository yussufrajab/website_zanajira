import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || "";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER || "no-reply@zanajira.go.tz";

async function getAdminToken() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Directus auth failed: ${res.status}`);
  const data = await res.json();
  return data.data.access_token;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, reply_message } = body;

    if (!id || !reply_message) {
      return NextResponse.json(
        { error: "id and reply_message are required" },
        { status: 400 }
      );
    }

    const token = await getAdminToken();

    // Fetch the submission
    const fetchRes = await fetch(
      `${DIRECTUS_URL}/items/contact_submissions/${id}?fields=*`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!fetchRes.ok) throw new Error(`Fetch failed: ${fetchRes.status}`);
    const { data: submission } = await fetchRes.json();

    if (!submission || !submission.email) {
      return NextResponse.json(
        { error: "Submission not found or has no email" },
        { status: 404 }
      );
    }

    if (submission.reply_sent_at) {
      return NextResponse.json(
        { error: "Reply already sent to this submission" },
        { status: 409 }
      );
    }

    // Send the reply email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: MAIL_FROM,
      to: submission.email,
      subject: `Re: ${submission.subject || "Your Inquiry"}`,
      text: [
        `Dear ${submission.full_name || "User"},`,
        "",
        "Thank you for contacting the Commission for Public Service Zanzibar.",
        "",
        reply_message,
        "",
        "Kind regards,",
        "Commission for Public Service Zanzibar",
        "info@zanajira.go.tz",
      ].join("\n"),
      html: `
        <p>Dear ${submission.full_name || "User"},</p>
        <p>Thank you for contacting the Commission for Public Service Zanzibar.</p>
        <p>${reply_message.replace(/\n/g, "<br>")}</p>
        <p>Kind regards,<br>Commission for Public Service Zanzibar<br>
        <a href="mailto:info@zanajira.go.tz">info@zanajira.go.tz</a></p>
      `,
    });

    // Update the submission in Directus
    const updateRes = await fetch(
      `${DIRECTUS_URL}/items/contact_submissions/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reply_message,
          reply_sent_at: new Date().toISOString(),
          status: "replied",
        }),
      }
    );
    if (!updateRes.ok) {
      const err = await updateRes.text();
      console.error("Failed to update submission:", err);
    }

    return NextResponse.json({
      success: true,
      message: `Reply sent to ${submission.email}`,
    });
  } catch (error) {
    console.error("Reply error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to send reply", detail: message },
      { status: 500 }
    );
  }
}