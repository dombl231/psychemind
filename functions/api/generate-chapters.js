import { buildChaptersPrompt, callOpenAI, ebookChaptersSchema, enforceRateLimit, getOutputText, HttpError, json, normalizeGenerateInput, readJson, requireSameOrigin, verifyTurnstile } from "../_lib/ebook-api.js";

export async function onRequestPost({ request, env }) {
  try {
    requireSameOrigin(request);
    enforceRateLimit(request, { keyPrefix: "generate-chapters", limit: Number(env.EBOOK_RATE_LIMIT || 4), windowMs: 60 * 60 * 1000 });
    const body = await readJson(request, 120_000);
    await verifyTurnstile(request, env, body.turnstileToken);
    const payload = normalizeGenerateInput(body);
    const ebook = body.ebook || {};
    const chaptersResult = await callOpenAI(env, "responses", {
      model: env.OPENAI_MODEL || "gpt-5.5",
      input: buildChaptersPrompt(payload, ebook),
      reasoning: { effort: "low" },
      max_output_tokens: 28_000,
      text: {
        format: {
          type: "json_schema",
          name: "premium_ebook_chapters",
          strict: true,
          schema: ebookChaptersSchema,
        },
      },
    });
    return json(JSON.parse(getOutputText(chaptersResult)));
  } catch (error) {
    return json({ error: error.message || "챕터 원고 생성에 실패했습니다." }, error instanceof HttpError ? error.status : 500);
  }
}
