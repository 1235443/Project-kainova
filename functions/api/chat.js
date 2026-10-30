export async function onRequestPost({ request, env }) {
const headers = {
"Content-Type": "application/json"
};

try {
if (!env.GEMINI_API_KEY) {
return new Response(
JSON.stringify({
error: "GEMINI_API_KEY is missing in Cloudflare settings."
}),
{ status: 500, headers }
);
}

const body = await request.json();
const prompt = body.prompt;

if (!prompt || typeof prompt !== "string") {
  return new Response(
    JSON.stringify({
      error: "Please enter a message."
    }),
    { status: 400, headers }
  );
}

const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    encodeURIComponent(env.GEMINI_API_KEY),
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    })
  }
);

const data = await response.json();

if (!response.ok) {
  return new Response(
    JSON.stringify({
      error: data.error?.message || "Gemini API request failed."
    }),
    { status: response.status, headers }
  );
}

const reply =
  data.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("") || "I couldn't generate a reply.";

return new Response(
  JSON.stringify({ reply }),
  { status: 200, headers }
);

} catch (error) {
return new Response(
JSON.stringify({
error: "Server error: " + error.message
}),
{ status: 500, headers }
);
}
    }
