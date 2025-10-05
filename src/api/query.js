import { Router } from "express";
import { askGemini } from "../llm/geminiAdapter.js";
import { search } from "../search/indexer.js";

const router = Router();

router.post("/", async (req, res) => {
  const question = (req.body.question || "").trim();
  if (!question) return res.status(400).json({ error: "question required in body" });

  try {
    // 1. Search for top 5 relevant docs
    const searchRes = await search(question, 5);
    const provenanceDocs = (searchRes.hits || []).map(h => h.doc).filter(Boolean);

    // 2. Prepare clean document text for the prompt
    const docsText = provenanceDocs
      .map((d, i) => `DOC ${i + 1} (id: ${d._docId || "N/A"}):\n${d.content || JSON.stringify(d)}\n`)
      .join("\n---\n");

    // 3. Build prompt with instructions to cite docs
    const prompt = `
You are a knowledgeable assistant. Answer the user's question using only the provided documents as evidence. 

- Be concise but complete.
- If the documents do not contain enough information, say "insufficient information".

QUESTION:
${question}

DOCUMENTS:
${docsText}

Answer in a clear, structured way.
`;

    // 4. Call Gemini LLM
    const llmRes = await askGemini(prompt);

    // 5. Collect provenance ids
    const provenanceIds = provenanceDocs.map(d => d._docId).filter(Boolean);

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
