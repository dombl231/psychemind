import { callOpenAI, cleanText, HttpError, json, readJson } from "../_lib/ebook-api.js";

export async function onRequestPost({ request, env }) {
  try {
    if (env.ENABLE_IMAGE_GENERATION === "false") {
      return json({ coverImage: null, skipped: true });
    }

    const body = await readJson(request);
    const ebook = body.ebook;
    const topic = cleanText(body.topic || ebook?.title, "전자책 표지");

    if (!ebook?.title) {
      return json({ error: "표지를 만들 전자책 데이터가 없습니다." }, 400);
    }

    const prompt = `${ebook.coverImagePrompt}

Book topic: ${topic}
Style: premium Korean business ebook cover image, editorial photography, cinematic but clean, no words, no logos, no watermark, no mockup frame, suitable as a full bleed cover background.`;

    const image = await callOpenAI(env, "images/generations", {
      model: env.OPENAI_IMAGE_MODEL || "gpt-image-1.5",
      prompt,
      size: "1024x1536",
      quality: "high",
    });

    const b64 = image.data?.[0]?.b64_json;
    return json({ coverImage: b64 ? { mimeType: "image/png", data: b64, prompt } : null });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return json({ error: error.message || "표지 이미지 생성에 실패했습니다." }, status);
  }
}
