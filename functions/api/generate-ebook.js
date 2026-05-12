import { buildChaptersPrompt, buildEbookPackagePrompt, callOpenAI, ebookChaptersSchema, ebookPackageSchema, enforceRateLimit, getOutputText, HttpError, json, normalizeGenerateInput, readJson, requireSameOrigin, verifyTurnstile } from "../_lib/ebook-api.js";

export async function onRequestPost({ request, env }) {
  try {
    requireSameOrigin(request);
    enforceRateLimit(request, { keyPrefix: "generate-ebook", limit: Number(env.EBOOK_RATE_LIMIT || 4), windowMs: 60 * 60 * 1000 });
    const body = await readJson(request, 32_000);
    await verifyTurnstile(request, env, body.turnstileToken);
    const payload = normalizeGenerateInput(body);
    const packageResult = await callOpenAI(env, "responses", {
      model: env.OPENAI_MODEL || "gpt-5.5",
      input: buildEbookPackagePrompt(payload),
      reasoning: { effort: "low" },
      max_output_tokens: 12_000,
      text: {
        format: {
          type: "json_schema",
          name: "premium_ebook_package",
          strict: true,
          schema: ebookPackageSchema,
        },
      },
    });
    const ebook = JSON.parse(getOutputText(packageResult));
    ebook.authorName = "";
    ebook.pageCount = Math.max(Number(ebook.pageCount) || 90, 90);

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
    ebook.chapters = JSON.parse(getOutputText(chaptersResult)).chapters;
    ebook.authorName = "";
    ebook.coverImage = null;
    return json({ ebook });
  } catch (error) {
    return json({ error: error.message || "전자책 생성에 실패했습니다." }, error instanceof HttpError ? error.status : 500);
  }
}
