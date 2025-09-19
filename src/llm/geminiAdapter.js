import axios from "axios";

/**
 * Gemini adapter - calls Google's Generative Language API.
 * Make sure to set GEMINI_API_KEY and GEMINI_MODEL in your .env.
 *
 * NOTE: This is a minimal example. Adjust request & response parsing to match
 * the exact Gemini API version and pricing/usage fields.
 */

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function askGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-pro";

  if (!apiKey) {
    // Return a helpful placeholder for local dev
    return {
      answer: `Gemini API key not set. Received prompt (truncated): ${prompt.slice(0, 400)}`,
      provenance: [],
      tokens: 0,
      cost: 0
    };
  }

  try {
    const url = `${API_BASE}/models/${encodeURIComponent(model)}:generateText?key=${apiKey}`;

    // Example body for a generic generative language model
    const body = {
      prompt: {
        text: prompt
      },
      temperature: 0.2,
      maxOutputTokens: 800
    };

    const r = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 20000
    });

    // Parse the answer — adjust depending on actual response schema
    const answer = r.data?.candidates?.[0]?.content || r.data?.output?.[0]?.content || JSON.stringify(r.data);
    const tokens = r.data?.usage?.totalTokens || 0;
    const cost = 0; // computing cost requires the pricing table; set accordingly if you track it

    return {
      answer: typeof answer === "string" ? answer : JSON.stringify(answer),
      provenance: [],
      tokens,
      cost
    };
  } catch (err) {
    console.error("Gemini call error:", err?.response?.data || err.message);
    throw new Error("LLM call failed: " + (err?.response?.data?.error?.message || err.message));
  }
}
