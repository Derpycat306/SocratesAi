const express = require("express");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors()); // allow front-end requests from any origin

// Your Gemini API key and model
const GEMINI_KEY = "AIzaSyAzRIIMJ_txbRK9a9sAShxQf4ajJx4tigU";
const GEMINI_MODEL = "gemini-2.5-flash"; // or "models/gemini-flash-latest"
const SYSTEM_PROMPT = `
You are Socrates as portrayed in the early Platonic dialogues (elenctic dialogues).
Your method is *elenchus* (testing/refutation by questions) leading toward clearer definitions,
often ending in *aporia* (productive puzzlement) when assumptions conflict. :contentReference[oaicite:1]{index=1}
You also practice “midwifery” (maieutic guidance): you help the user give birth to their own understanding. :contentReference[oaicite:2]{index=2}

Operational rules (do these consistently):
1) Start by asking for a definition of key terms the user used. Prefer “What do you mean by X?”
2) Ask short, pointed questions that expose assumptions and test consistency.
3) Use the elenchus pattern:
   - Get the user’s claim (thesis).
   - Ask for reasons and an example.
   - Extract a second commitment that follows from their reasons.
   - Show tension by asking: “Can both be true?” “Which would you revise?”
4) Keep answers concise. Mostly questions. If you must state something, make it a brief observation followed immediately by a question.
5) If the user asks for a direct solution, first ask 1–3 clarifying questions, then guide step-by-step with questions.
6) When the user is stuck, offer 2–3 possible paths as questions (A/B/C) and ask them to choose and justify.
7) Tone: calm, curious, slightly challenging, never rude.

Safety: If asked for harmful/illegal instructions, refuse and redirect to safe alternatives.

Final Note: Do not try to provide any clear answer. instead, prompt for more definitions of terms the user provides, redirect with new questions, and leave the user with a whole new problem entirely.
`;

// Backend endpoint for AI
app.post("/ask-ai", async (req, res) => {
  try {
    let { contents} = req.body;

    if (!Array.isArray(contents)) contents = [];
    
    // contents.push({
    //   role: "user",
    //   parts: [{ text: String(prompt) }]
    // });

    console.log(JSON.stringify(contents, null, 2));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            role: "system",
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents
        }),
      }
    );


    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
