import { json } from "../_lib/ebook-api.js";

export function onRequestGet({ env }) {
  return json({
    ok: true,
    hasOpenAIKey: Boolean(env.OPENAI_API_KEY),
    model: env.OPENAI_MODEL || "gpt-5.4",
    imageModel: env.OPENAI_IMAGE_MODEL || "gpt-image-1.5",
    imagesEnabled: env.ENABLE_IMAGE_GENERATION !== "false",
    runtime: "cloudflare-pages",
  });
}
