// ai.js
// Frontend AI helper — talks ONLY to your backend server

const AI_ENDPOINT = "http://localhost:3000/ask-ai";

/**
 * chatHistory: Array of objects like:
 * [
 *   { prompt: "Hello", response: "Hi there!" },
 *   { prompt: "Explain gravity", response: "..." }
 * ]
 *
 * newPrompt: string (what the user just typed)
 */
export async function askAI(chatHistory, newPrompt) {
  // Convert your chat structure into Gemini "contents"
    console.log(`received new ai request. prompt: ${newPrompt}`);
    const contents = [];

    // add previous chat logs
    if(chatHistory){
        for (const turn of chatHistory) {
            if (turn.prompt) {
            contents.push({
                role: "user",
                parts: [{ text: String(turn.prompt) }]
            });
            }
            if (turn.response) {
            contents.push({
                role: "model",
                parts: [{ text: String(turn.response) }]
            });
            }
        }
    }

    // Add the new user message
    contents.push({
        role: "user",
        parts: [{ text: String(newPrompt) }]
        });

    console.log(JSON.stringify(contents));

    // receive response
    const res = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({ contents })
    });

    // check for error
    if (!res.ok) {
        const errText = await res.text();
        throw new Error("AI request failed: " + errText);
    }

    const data = await res.json();

    // extract text from ai response
    const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "No response from AI.";

    return aiText;
}
