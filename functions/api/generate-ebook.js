import { buildEbookPrompt, callOpenAI, cleanText, ebookSchema, getOutputText, HttpError, json, readJson } from "../_lib/ebook-api.js";

export async function onRequestPost({ request, env }) {
  try {
    const body = await readJson(request);
    const result = await callOpenAI(env, "responses", {
      model: env.OPENAI_MODEL || "gpt-5.4",
      input: buildEbookPrompt({
        topic: cleanText(body.topic, "수익형 전자책 만들기"),
        audience: cleanText(body.audience, "새로운 디지털 상품을 만들고 싶은 사람"),
        tone: cleanText(body.tone, "프리미엄 실전형"),
      }),
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
