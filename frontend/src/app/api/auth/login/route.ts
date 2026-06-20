import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, createSession } from "@/lib/auth";
import { rateLimited, getClientIP } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 5; // per 15 min per IP
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  if (rateLimited(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await authenticateAdmin(String(email), String(password));
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession(user);
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}