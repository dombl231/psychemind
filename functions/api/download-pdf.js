import { readJson } from "../_lib/ebook-api.js";
import { exportEbook } from "./export.js";

export async function onRequestPost({ request }) {
  const body = await readJson(request);
  return exportEbook(body, "pdf");
}
