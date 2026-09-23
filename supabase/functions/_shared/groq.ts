const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_TIMEOUT_MS = 20_000;

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class GroqError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "GroqError";
  }
}

// Verified live against api.groq.com on 2026-09-23. A reasoning model:
// low reasoning_effort keeps latency/cost down for a Q&A chatbot and
// leaves enough of max_tokens for the actual answer.
export async function groqChatCompletion(
  messages: GroqMessage[],
  options: { maxTokens?: number; temperature?: number; timeoutMs?: number } = {},
): Promise<string> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) throw new GroqError("GROQ_API_KEY is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature ?? 0.5,
        reasoning_effort: "low",
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new GroqError(`Groq request failed: ${response.status} ${body}`, response.status);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;

    if (typeof content !== "string" || content.trim() === "") {
      throw new GroqError("Groq returned an empty response");
    }

    return content;
  } catch (error) {
    if (error instanceof GroqError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new GroqError("Groq request timed out");
    }
    throw new GroqError(`Groq request failed: ${String(error)}`);
  } finally {
    clearTimeout(timeout);
  }
}
