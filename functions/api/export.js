import { json, normalizeFormat, readJson, renderMarkdown, renderStandaloneHtml, sendFile, slugify } from "../_lib/ebook-api.js";

export async function onRequestPost({ request }) {
  try {
    const body = await readJson(request);
    return exportEbook(body);
  } catch (error) {
    return json({ error: error.message || "다운로드 파일 생성에 실패했습니다." }, 500);
  }
}

export function exportEbook(body, forcedFormat = null) {
  const ebook = body.ebook;
  const template = ["obsidian", "ivory", "graphite"].includes(body.template) ? body.template : "obsidian";
  const format = forcedFormat || normalizeFormat(body.format);

  if (!ebook?.title) {
    return json({ error: "내보낼 전자책 데이터가 없습니다." }, 400);
  }

  const baseName = slugify(ebook.title);

  if (format === "markdown") {
    return sendFile(renderMarkdown(ebook), "text/markdown; charset=utf-8", `${baseName}.md`);
  }

  if (format === "json") {
    return sendFile(JSON.stringify(ebook, null, 2), "application/json; charset=utf-8", `${baseName}.json`);
  }

  const html = renderStandaloneHtml(ebook, template);
  const fileName = format === "pdf" ? `${baseName}-print.html` : `${baseName}.html`;
  return sendFile(html, "text/html; charset=utf-8", fileName);
}
