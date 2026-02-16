import axios from "axios";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function askGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-2.0-flash";

  if (!apiKey) {
    return {
      answer: `Gemini API key not set. Prompt (truncated): ${prompt.slice(0, 400)}`,
      provenance: [],
      tokens: 0,
      cost: 0
    };
  }

  try {
    const url = `${API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    const r = await axios.post(url, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 20000
    });

    // ✅ Correct path to the text
    const answer = r.data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(r.data);
    const tokens = r.data?.usageMetadata?.totalTokenCount || 0;
    const cost = 0; // compute if needed

    console.log("Gemini answer:", answer);

    return { answer, provenance: [], tokens, cost };
  } catch (err) {
    console.error("Gemini call error:", err?.response?.data || err.message);
    throw new Error("LLM call failed: " + (err?.response?.data?.error?.message || err.message));
  }
}
