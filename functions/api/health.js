import { json } from "../_lib/ebook-api.js";

export function onRequestGet({ env }) {
  return json({
    ok: true,
    hasOpenAIKey: Boolean(env.OPENAI_API_KEY),
    imagesEnabled: env.ENABLE_IMAGE_GENERATION !== "false",
    runtime: "cloudflare-pages",
  });
}
