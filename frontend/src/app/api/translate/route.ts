import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

const MODEL = "gemini-2.5-flash-lite";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ translatedText: "" });
    }

    const genAI = getClient();
    if (!genAI) {
      return NextResponse.json(
        { error: "GOOGLE_AI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `You are a professional Swahili→English translator for the Tanzania Public Service Commission (Tume ya Utumishi Serikalini) website.

Translate the following Swahili text to English.

Rules:
- Preserve proper nouns, organization names, and government terminology (e.g., "Tume ya Utumishi Serikalini", "Zanajira").
- Keep numbers, dates, and statistical data exactly as-is.
- Maintain a formal, professional tone appropriate for a government website.
- Do NOT add any explanations or extra text.
- Respond with ONLY the translated text, nothing else.

Text to translate:
${text}`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text().trim();

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("AI translation error:", error);
    return NextResponse.json(
      { error: "AI translation failed. Please try again." },
      { status: 502 },
    );
  }
}
