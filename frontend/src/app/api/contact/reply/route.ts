import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER || "no-reply@tume.go.tz";

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function POST(request: NextRequest) {
  // Require an admin session — only authenticated admins may send replies.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, reply_message } = body;

    if (!id || !reply_message) {
      return NextResponse.json(
        { error: "id and reply_message are required" },
        { status: 400 }
      );
    }

    const submission = await prisma.contactSubmission.findUnique({
      where: { id: Number(id) },
    });

    if (!submission || !submission.email) {
      return NextResponse.json(
        { error: "Submission not found or has no email" },
        { status: 404 }
      );
    }

    if (submission.replySentAt) {
      return NextResponse.json(
        { error: "Reply already sent to this submission" },
        { status: 409 }
      );
    }

    const transporter = createTransporter();
    await transporter.sendMail({
      from: MAIL_FROM,
      to: submission.email,
      subject: `Re: ${submission.subject || "Your Inquiry"}`,
      text: [
        `Dear ${submission.fullName || "User"},`,
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
        <p>Dear ${submission.fullName || "User"},</p>
        <p>Thank you for contacting the Commission for Public Service Zanzibar.</p>
        <p>${String(reply_message).replace(/\n/g, "<br>")}</p>
        <p>Kind regards,<br>Commission for Public Service Zanzibar<br>
        <a href="mailto:info@zanajira.go.tz">info@zanajira.go.tz</a></p>
      `,
    });

    await prisma.contactSubmission.update({
      where: { id: Number(id) },
      data: {
        replyMessage: reply_message,
        replySentAt: new Date(),
        status: "replied",
      },
    });

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