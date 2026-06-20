import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimited, getClientIP } from "@/lib/rate-limit";

const MAX_SUBMISSIONS = parseInt(process.env.RATE_LIMIT_MAX || "3", 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "3600000", 10);

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  if (rateLimited(`contact:${ip}`, MAX_SUBMISSIONS, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { full_name, email, subject, message, honeypot } = body;

    // Honeypot check — bots fill hidden fields. Pretend success.
    if (honeypot) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!full_name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (full_name.length > 100 || subject.length > 200 || message.length > 2000) {
      return NextResponse.json(
        { error: "Field length exceeded." },
        { status: 400 }
      );
    }

    // Strip HTML tags for XSS prevention in the stored message.
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, "").trim();

    await prisma.contactSubmission.create({
      data: {
        fullName: sanitize(full_name),
        email: sanitize(email),
        subject: sanitize(subject),
        message: sanitize(message),
        status: "new",
        isRead: false,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}