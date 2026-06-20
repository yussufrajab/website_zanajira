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
    const { contentType, fields } = await request.json();

    if (!fields || Object.keys(fields).length === 0) {
      return NextResponse.json({ translations: {} });
    }

    const genAI = getClient();
    if (!genAI) {
      return NextResponse.json(
        { error: "GOOGLE_AI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const model = genAI.getGenerativeModel({ model: MODEL });

    const fieldEntries = Object.entries(fields).filter(
      ([, v]) => v && typeof v === "string" && v.trim(),
    );

    if (fieldEntries.length === 0) {
      return NextResponse.json({ translations: {} });
    }

    let prompt = `You are a professional Swahili→English translator for the Tanzania Public Service Commission (Tume ya Utumishi Serikalini) website. Translate the following ${contentType} content from Swahili to English.

Rules:
- Preserve proper nouns, organization names, and government terminology (e.g., "Tume ya Utumishi Serikalini", "Zanajira").
- Keep numbers, dates, and statistical data exactly as-is.
- Maintain a formal, professional tone appropriate for a government website.
- If a field is empty or just whitespace, return an empty string for it.
- Do NOT add any explanations or extra text.

Fields to translate:\n`;

    for (const [key, value] of fieldEntries) {
      prompt += `\n--- ${key} ---\n${value}\n`;
    }

    prompt += `\n\nRespond ONLY with a JSON object in this exact format (no markdown, no code fences, no extra text):\n{`;

    for (const [key] of fieldEntries) {
      prompt += `\n  "${key}": "<translated text>",`;
    }
    // Remove trailing comma and close
    prompt = prompt.replace(/,$/, "") + "\n}";

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean response: remove markdown code fences if present
    const cleaned = responseText
      .replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1")
      .trim();

    let translations: Record<string, string> = {};
    try {
      translations = JSON.parse(cleaned);
    } catch {
      // Fallback: try to extract JSON object from the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          translations = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error("Failed to parse translation response");
        }
      } else {
        throw new Error("Failed to parse translation response");
      }
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Gemini batch translation error:", error);
    return NextResponse.json(
      { error: "AI translation failed. Please try again." },
      { status: 502 },
    );
  }
}
