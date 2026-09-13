const { GoogleGenAI } = require('@google/genai');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(204, {});
  if (event.httpMethod === 'GET') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return jsonResponse(200, {
        connected: false,
        status: 'NOT CONNECTED',
        error: 'GEMINI_API_KEY environment variable is not configured.'
      });
    }
    try {
      const t0 = Date.now();
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping health check. Reply "OK".'
      });
      return jsonResponse(200, {
        connected: true,
        status: 'CONNECTED',
        latencyMs: Date.now() - t0,
        model: 'gemini-3.8-flash',
        reply: res.text?.trim()
      });
    } catch (err) {
      return jsonResponse(200, {
        connected: false,
        status: 'NOT CONNECTED',
        error: err.message
      });
    }
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, {
      error: 'GEMINI_API_KEY is not configured in Netlify environment variables.'
    });
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
    const action = body.action || 'prep';
    const ai = new GoogleGenAI({ apiKey });

    if (action === 'prep') {
      const prompt = `You are a VIP executive assistant preparing a concise, high-value consultation brief for Simran Arrora.
Client Name: ${body.customerName || 'Client'}
Session: ${body.serviceName || 'Consultation'}
Date & Time: ${body.date || 'TBD'} at ${body.time || 'TBD'}
Client Notes: ${body.notes || 'None'}
Category: ${body.category || 'General'}

Return a JSON object with:
- "summary": 2-sentence executive summary.
- "talkingPoints": Array of 3-4 bullets.
- "icebreakers": Array of 2 warm opening remarks.
- "recommendation": High-impact advice for the host.
Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      return jsonResponse(200, {
        success: true,
        model: 'gemini-3.8-flash',
        data: JSON.parse(response.text)
      });
    }

    if (action === 'concierge') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the official concierge for creator Simran Arrora. Answer courteously in under 3 sentences: ${body.message}`
      });

      return jsonResponse(200, {
        success: true,
        model: 'gemini-3.8-flash',
        reply: response.text?.trim()
      });
    }

    return jsonResponse(400, { error: `Unsupported action: ${action}` });
  } catch (err) {
    return jsonResponse(500, { error: err.message });
  }
};
