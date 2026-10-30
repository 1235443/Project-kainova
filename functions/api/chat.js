export async function onRequestPost({ request, env }) {
const headers = { "Content-Type": "application/json" };

try {
if (!env.GEMINI_API_KEY) {
return new Response(
JSON.stringify({
error: "GEMINI_API_KEY missing. Check Cloudflare Secrets."
}),
{ status: 500, headers }
);
}

const body = await request.json();
const prompt = body.prompt;

if (typeof prompt !== "string" || !prompt.trim()) {
  return new Response(
    JSON.stringify({ error: "Please enter a message." }),
    { status: 400, headers }
  );
}

const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt.trim() }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    })
  }
);

const data = await response.json();

if (!response.ok) {
  return new Response(
    JSON.stringify({
      error: data.error?.message || "Gemini API request failed."
    }),
    { status: 502, headers }
  );
}

const reply = data.candidates?.[0]?.content?.parts
  ?.map(part => part.text || "")
  .join("")
  .trim();

if (!reply) {
  return new Response(
    JSON.stringify({
      error: "Gemini returned no text. Try another message."
    }),
    { status: 502, headers }
  );
}

return new Response(
  JSON.stringify({ reply }),
  { status: 200, headers }
);

} catch (error) {
return new Response(
JSON.stringify({
error: "Backend error: " + (error.message || "Unknown error")
}),
{ status: 500, headers }
);
}
}

export async function onRequestGet({ env }) {
const headers = { "Content-Type": "application/json" };

if (!env.GEMINI_API_KEY) {
return new Response(
JSON.stringify({
status: "error",
message: "GEMINI_API_KEY is missing in Cloudflare."
}),
{ status: 500, headers }
);
}

return new Response(
JSON.stringify({
status: "ok",
message: "KAINOVA backend is online. API key is configured."
}),
{ status: 200, headers }
);
        }
