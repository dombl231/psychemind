import { buildEbookPrompt, callOpenAI, ebookSchema, enforceRateLimit, getOutputText, HttpError, json, normalizeGenerateInput, readJson, requireSameOrigin, verifyTurnstile } from "../_lib/ebook-api.js";

export async function onRequestPost({ request, env }) {
  try {
    requireSameOrigin(request);
    enforceRateLimit(request, { keyPrefix: "generate-ebook", limit: Number(env.EBOOK_RATE_LIMIT || 4), windowMs: 60 * 60 * 1000 });
    const body = await readJson(request, 32_000);
    await verifyTurnstile(request, env, body.turnstileToken);
    const payload = normalizeGenerateInput(body);
    const result = await callOpenAI(env, "responses", {
      model: env.OPENAI_MODEL || "gpt-5.4",
      input: buildEbookPrompt(payload),
      max_output_tokens: 28_000,
      text: {
        format: {
          type: "json_schema",
          name: "premium_ebook_product",
          strict: true,
          schema: ebookSchema,
        },
      },
    });

    const output = getOutputText(result);
    const ebook = JSON.parse(output);
    ebook.coverImage = null;
    return json({ ebook });
  } catch (error) {
    return json({ error: error.message || "전자책 생성에 실패했습니다." }, error instanceof HttpError ? error.status : 500);
  }
}
