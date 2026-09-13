const { GoogleGenAI } = require('@google/genai');

let aiInstance = null;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

/**
 * Generate an executive briefing for a consultation session using Gemini
 */
async function generateConsultationPrep({ customerName, serviceName, date, time, notes, categoryName, location }) {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      source: 'offline_template',
      summary: `VIP briefing for ${customerName || 'Client'} attending ${serviceName || 'Consultation'} on ${date || 'upcoming date'} at ${time || 'scheduled time'}.`,
      talkingPoints: [
        'Review client background and previous interaction history',
        'Clarify primary session goals from reservation notes',
        'Provide tailored consultation advice and actionable roadmap'
      ],
      icebreakers: [
        `Welcome ${customerName || 'there'}, so excited to connect today!`,
        'Before we dive in, how has your week been treating you?'
      ],
      recommendation: 'Ensure camera, microphone, and lighting are prepared 5 minutes prior to the session.'
    };
  }

  const prompt = `You are a VIP executive briefing coordinator preparing a high-end consultation brief for creator/celebrity Simran Arrora.
Details:
- Client Name: ${customerName || 'Client'}
- Consultation Service: ${serviceName || 'Personal Consultation'}
- Category: ${categoryName || 'General'}
- Date & Time: ${date} at ${time}
- Meeting Location / Format: ${location || 'Online via Google Meet'}
- Client Notes / Inquiries: ${notes || 'No specific notes entered'}

Generate a structured JSON response with the following exact keys:
1. "summary": A concise, 2-sentence executive summary of the consultation objectives.
2. "talkingPoints": An array of 3 to 4 specific discussion topics or high-value questions.
3. "icebreakers": An array of 2 warm, natural opening conversational lines.
4. "recommendation": A single high-impact recommendation for running a successful, memorable session.

Return ONLY valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text);
    return {
      source: 'gemini-3.8-flash',
      ...parsed
    };
  } catch (err) {
    console.error('[Gemini] consultation prep error:', err.message);
    return {
      source: 'fallback',
      summary: `Consultation brief for ${customerName || 'Client'} (${serviceName || 'Session'}).`,
      talkingPoints: [
        'Review client expectations and topics noted during reservation',
        'Discuss primary objectives and personalized guidance'
      ],
      icebreakers: [
        `Welcome ${customerName || 'there'}! Happy to connect with you.`
      ],
      recommendation: 'Focus on listening actively and providing distinct, actionable value.'
    };
  }
}

/**
 * Intelligent concierge answering booking, platform, and session queries
 */
async function conciergeChat(userMessage, context = '') {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      reply: 'The Gemini AI concierge is offline. Please configure GEMINI_API_KEY in your environment to activate instant intelligent assistance.',
      status: 'offline'
    };
  }

  const systemInstruction = `You are the official VIP Booking Concierge for creator & influencer Simran Arrora.
Answer questions politely, warmly, and concisely regarding:
- Booking categories: Video Calls (Google Meet), Audio Calls, Real Meet (exclusive in-person consultations, strictly 18+), and Event/Party appearances.
- Booking lifecycle: Bookings are submitted in PENDING status, then reviewed and approved by the admin. Once approved, Google Calendar invites and Google Meet links are generated.
- Payments: Payment links or UPI QR can be used. Reference ID is submitted for manual verification.
- Content: Exclusive vlogs, portfolio gallery, social channels (Instagram, YouTube, Telegram, X).

Always maintain professional composure, elegance, and friendly courtesy. Keep answers under 3-4 sentences unless more detail is directly requested.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${context ? `Context: ${context}\n\n` : ''}User: ${userMessage}`,
      config: {
        systemInstruction
      }
    });

    return {
      reply: response.text,
      status: 'ok',
      model: 'gemini-3.8-flash'
    };
  } catch (err) {
    return {
      reply: 'I am currently unable to process your request. Please check back shortly or reach out through the Contact form.',
      status: 'error',
      error: err.message
    };
  }
}

/**
 * Test Gemini API connection & measure latency
 */
async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      connected: false,
      status: 'NOT CONNECTED',
      details: 'GEMINI_API_KEY environment variable is not configured.'
    };
  }

  try {
    const t0 = Date.now();
    const ai = getGeminiClient();
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Respond with the single word "CONNECTED".'
    });
    const latency = Date.now() - t0;
    return {
      connected: true,
      status: 'CONNECTED',
      latencyMs: latency,
      model: 'gemini-3.8-flash',
      reply: res.text?.trim()
    };
  } catch (err) {
    return {
      connected: false,
      status: 'NOT CONNECTED',
      error: err.message
    };
  }
}

module.exports = {
  getGeminiClient,
  generateConsultationPrep,
  conciergeChat,
  testGemini
};
