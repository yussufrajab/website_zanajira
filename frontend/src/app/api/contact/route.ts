import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_MAP = new Map<string, { count: number; resetTime: number }>();
const MAX_SUBMISSIONS = parseInt(process.env.RATE_LIMIT_MAX || "3", 10);
const WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "3600000",
  10
);

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(ip);

  if (!entry || now > entry.resetTime) {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_SUBMISSIONS) {
    return true;
  }

  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { full_name, email, subject, message, honeypot } = body;

    // Honeypot check — bots fill hidden fields
    if (honeypot) {
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }

    // Validate required fields
    if (!full_name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (full_name.length > 100 || subject.length > 200 || message.length > 2000) {
      return NextResponse.json(
        { error: "Field length exceeded." },
        { status: 400 }
      );
    }

    // Strip HTML tags for XSS prevention
    const sanitize = (str: string) =>
      str.replace(/<[^>]*>/g, "").trim();

    const submission = {
      full_name: sanitize(full_name),
      email: sanitize(email),
      subject: sanitize(subject),
      message: sanitize(message),
      status: "new" as const,
    };

    // Submit to Directus — authenticate first to get a valid admin token
    const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055";
    const adminEmail = process.env.DIRECTUS_ADMIN_EMAIL || "";
    const adminPassword = process.env.DIRECTUS_ADMIN_PASSWORD || "";

    // Get an admin access token via login
    const authResponse = await fetch(`${directusUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });

    if (!authResponse.ok) {
      throw new Error(`Directus auth error: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.data.access_token;

    const response = await fetch(`${directusUrl}/items/contact_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      throw new Error(`Directus error: ${response.status}`);
    }

    // Send email notification (SMTP would be configured in production)
    // For now, log the submission
    console.log("Contact submission received:", submission);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}