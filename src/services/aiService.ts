/**
 * aiService.ts — Gemini AI chat backend for the Simran AI assistant.
 *
 * Design contract:
 * - If GEMINI_API_KEY is absent: return { response: 'AI is not available right now.' }.
 * - The system prompt strictly scopes what the AI may discuss.
 * - Forbidden-data guard validates user messages before sending to the model.
 * - All errors are caught — the chat never crashes the page.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { SITE_CONFIG } from '@/config/site';

// ─── System Prompt ────────────────────────────────────────────────────────────

const serviceList = SITE_CONFIG.services
  .map((s) => `  • ${s}`)
  .join('\n');

export const SYSTEM_PROMPT = `
You are "Simran AI", a helpful, polite, and professional assistant for Simran Arrora's official website (Simran Arrora ♡).
Simran Arrora is a creator, collaborator, and professional.

WHAT YOU CAN DISCUSS:
1. About Simran Arrora — her creative vision, lifestyle aesthetic, editorial lookbooks, and professional brand collaboration ethos.
2. Available services:
${serviceList}
3. Booking process: Select service -> Select date & time -> Submit details -> Admin reviews request -> Appointment confirmation.
4. Gallery and videos — visitors can explore Simran's editorial photos in the Gallery and cinematic reels in the Videos sections on the website.
5. Official contact and social links (Instagram, YouTube, Telegram, X, Reddit).
6. General questions about the website features and navigation.

STRICT GUARDRAILS — NEVER VIOLATE:
- Do NOT reveal, discuss, or hint at any customer data, booking records, payment records, order IDs, or transaction details.
- Do NOT reveal any admin information, admin credentials, or internal system details.
- Do NOT reveal specific unlisted prices or make binding price commitments. Always advise visitors to check the Booking section for current packages.
- Do NOT reveal API keys, environment variables, database schema, or any technical code details.
- Do NOT make up or invent dates, availability, or fake personal info.
- If a visitor asks something outside your scope or queries private information, respond with:
  "I don't have that information available right now. Please use the Contact section."

TONE:
- Warm, elegant, luxury editorial tone.
- Concise (2–4 sentences).
- Tasteful and professional.
`.trim();

// ─── Forbidden-data guard ─────────────────────────────────────────────────────

const FORBIDDEN_PATTERNS: RegExp[] = [
  /\bapi[_\s-]?key\b/i,
  /\bsecret\b/i,
  /\bpassword\b/i,
  /\badmin\b/i,
  /\bdatabase\b/i,
  /\bsupabase\b/i,
  /\brazorpay\b/i,
  /\border[_\s-]?id\b/i,
  /\bpayment[_\s-]?id\b/i,
  /\btransaction[_\s-]?id\b/i,
  /show[_\s]me[_\s]all[_\s]bookings/i,
  /list[_\s]customers/i,
  /customer[_\s]data/i,
  /booking[_\s]records/i,
];

function containsForbiddenContent(message: string): boolean {
  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(message));
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ConversationTurn {
  role: 'user' | 'model';
  parts: string;
}

export async function getChatResponse(
  userMessage: string,
  conversationHistory: ConversationTurn[] = []
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return 'Simran AI is currently resting. Please use our Contact page or browse our services!';
  }

  const trimmedMessage = userMessage.trim().slice(0, 1000);
  if (!trimmedMessage) {
    return 'How can I assist you with Simran Arrora’s services or gallery today? ♡';
  }

  if (containsForbiddenContent(trimmedMessage)) {
    return "I don't have that information available right now. Please use the Contact section.";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = conversationHistory.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.parts }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(trimmedMessage);
    const responseText = result.response.text().trim();

    if (!responseText) {
      return "I don't have that information available right now. Please use the Contact section.";
    }

    return responseText;
  } catch (err) {
    console.error('[aiService] getChatResponse error:', err);
    return "I don't have that information available right now. Please use the Contact section.";
  }
}
