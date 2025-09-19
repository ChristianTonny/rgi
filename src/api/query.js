import { Router } from "express";
import { askGemini } from "../llm/geminiAdapter.js";
import { search } from "../search/indexer.js";

const router = Router();

/**
 * POST /api/query
 * body: { question: "..." }
 *
 * This route:
 * - does a quick search for supporting docs (provenance)
 * - builds a prompt and calls Gemini adapter
 * - returns answer + provenance + tokens + cost
 */
router.post("/", async (req, res) => {
  const question = (req.body.question || "").trim();
  if (!question) return res.status(400).json({ error: "question required in body" });

  try {
    // quick supporting docs
    const searchRes = await search(question, 5);
    const provenanceDocs = (searchRes.hits || []).map(h => h.doc).filter(Boolean);

    // build a prompt that includes top-matching docs (lightweight)
    const docsText = provenanceDocs.map((d, i) => `DOC ${i + 1}: ${JSON.stringify(d)}`).join("\n\n");
    const prompt = `
You are an assistant that answers questions using the provided documents as evidence.

QUESTION:
${question}

DOCUMENTS:
${docsText}

Provide a concise answer and list which documents (by index) you used.
`;

    const llmRes = await askGemini(prompt);

    // attach provenance ids
    const provenanceIds = provenanceDocs.map(d => d._docId || null).filter(Boolean);

    res.json({
      answer: llmRes.answer,
      provenance: provenanceIds,
      tokens: llmRes.tokens,
      cost: llmRes.cost
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
