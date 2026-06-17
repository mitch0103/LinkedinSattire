import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Swap to "claude-haiku-4-5-20251001" for cheaper/faster at scale.
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are LinkedIn Translator, a satire engine. Translate LinkedIn posts into what the author is really trying to say. Output only one sentence. Be savage, concise, and funny. Do not explain. Do not use bullets. Do not accuse the author of crimes, fraud, corruption, lying, discrimination, sexual conduct, protected-class traits, or anything you cannot infer from the post. Mock the post style and incentives, not immutable personal traits. Keep it plausible and shareable.

NAMES: The input may still contain people's names, @handles, or company names. Never include any person's name or @handle in your output. Always refer to the author as "they" or "this person," never by name. If a name appears in the input, ignore it and do not repeat it.`;

const MAX_INPUT_CHARS = 6000;

// Best-effort soft guard against rapid-fire abuse from one IP.
// Note: serverless instances reset, so this is a speed bump, not a hard limit.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function stripIdentifiers(input) {
  let text = input;
  text = text.replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, "[redacted]");
  text = text.replace(/\bhttps?:\/\/\S+/gi, "[link]");
  text = text.replace(/\bwww\.\S+/gi, "[link]");
  text = text.replace(/@[\w.\-]+/g, "[name]");
  text = text.replace(/[•·]\s*\d(?:st|nd|rd|th)\+?/gi, "");
  const lines = text.split(/\r?\n/);
  if (lines.length > 1) {
    const first = lines[0].trim();
    const looksLikeName =
      /^[A-Z][a-z'’.-]+(?:\s+[A-Z][a-z'’.-]+){1,3}(?:,\s*[A-Za-z.]+)?$/.test(
        first
      ) && first.length <= 50;
    if (looksLikeName) lines.shift();
    text = lines.join("\n");
  }
  return text.trim();
}

export async function POST(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return json({ error: "Slow down a sec, then try again." }, 429);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Send a JSON body with a "post" field.' }, 400);
  }

  const raw = typeof body?.post === "string" ? body.post.trim() : "";
  if (!raw) return json({ error: "Paste a LinkedIn post first." }, 400);
  if (raw.length > MAX_INPUT_CHARS)
    return json({ error: "That post is too long. Trim it down a bit." }, 400);
  if (!process.env.ANTHROPIC_API_KEY)
    return json({ error: "Server is missing its API key." }, 500);

  const post = stripIdentifiers(raw);

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 150,
      temperature: 1,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `LinkedIn post to translate:\n\n"""${post}"""` },
      ],
    });

    const translation = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();

    if (!translation) return json({ error: "Couldn't read that one. Try again." }, 502);
    return json({ translation });
  } catch (err) {
    console.error("translate error:", err);
    return json({ error: "Something broke on our end. Try again." }, 502);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
