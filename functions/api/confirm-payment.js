import { confirmTossPayment, HttpError, json, readJson, requireSameOrigin } from "../_lib/ebook-api.js";

export async function onRequestPost({ request, env }) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request, 16_000);
    const result = await confirmTossPayment(env, body);
    return json(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message, code: error.details?.code }, error.status);
    }
    return json({ error: "결제 승인 처리 중 오류가 발생했습니다." }, 500);
  }
}
