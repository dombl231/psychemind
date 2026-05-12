import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadDotEnv();

const port = Number(process.env.PORT || 4173);
const writingModel = process.env.OPENAI_MODEL || "gpt-5.5";
const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5";
const enableImages = process.env.ENABLE_IMAGE_GENERATION !== "false";
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const ebookSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "subtitle",
    "authorName",
    "audience",
    "pageCount",
    "coverImagePrompt",
    "editorNote",
    "introduction",
    "quickStartRoadmap",
    "toolStack",
    "monetizationModel",
    "revenueCaseStudies",
    "chapters",
    "salesPage",
    "bonuses",
    "launchChecklist",
    "closingNote",
  ],
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    authorName: { type: "string" },
    audience: { type: "string" },
    pageCount: { type: "integer" },
    coverImagePrompt: { type: "string" },
    editorNote: { type: "string" },
    introduction: { type: "string" },
    quickStartRoadmap: {
      type: "array",
      minItems: 10,
      maxItems: 14,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "goal", "tasks", "output"],
        properties: {
          day: { type: "string" },
          goal: { type: "string" },
          tasks: { type: "array", minItems: 5, maxItems: 8, items: { type: "string" } },
          output: { type: "string" },
        },
      },
    },
    toolStack: {
      type: "array",
      minItems: 8,
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["category", "tool", "why", "howToStart", "freeAlternative"],
        properties: {
          category: { type: "string" },
          tool: { type: "string" },
          why: { type: "string" },
          howToStart: { type: "string" },
          freeAlternative: { type: "string" },
        },
      },
    },
    monetizationModel: {
      type: "object",
      additionalProperties: false,
      required: ["primaryRevenue", "secondaryRevenue", "platforms", "metrics", "realisticTimeline"],
      properties: {
        primaryRevenue: { type: "string" },
        secondaryRevenue: { type: "string" },
        platforms: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
        metrics: { type: "array", minItems: 4, maxItems: 8, items: { type: "string" } },
        realisticTimeline: { type: "string" },
      },
    },
    revenueCaseStudies: {
      type: "array",
      minItems: 6,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "context", "product", "channels", "revenuePath", "numbers", "lesson"],
        properties: {
          title: { type: "string" },
          context: { type: "string" },
          product: { type: "string" },
          channels: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
          revenuePath: { type: "string" },
          numbers: { type: "string" },
          lesson: { type: "string" },
        },
      },
    },
    chapters: {
      type: "array",
      minItems: 6,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "opening", "body", "caseStudy", "requiredTools", "stepByStep", "platformActions", "qualityChecklist", "commonMistakes", "actionItems", "reflectionQuestions"],
        properties: {
          title: { type: "string" },
          opening: { type: "string" },
          body: { type: "array", minItems: 8, maxItems: 10, items: { type: "string" } },
          caseStudy: { type: "string" },
          requiredTools: {
            type: "array",
            minItems: 4,
            maxItems: 8,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["name", "purpose", "setup"],
              properties: {
                name: { type: "string" },
                purpose: { type: "string" },
                setup: { type: "string" },
              },
            },
          },
          stepByStep: { type: "array", minItems: 10, maxItems: 14, items: { type: "string" } },
          platformActions: { type: "array", minItems: 6, maxItems: 10, items: { type: "string" } },
          qualityChecklist: { type: "array", minItems: 6, maxItems: 10, items: { type: "string" } },
          commonMistakes: { type: "array", minItems: 5, maxItems: 8, items: { type: "string" } },
          actionItems: { type: "array", minItems: 6, maxItems: 9, items: { type: "string" } },
          reflectionQuestions: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
        },
      },
    },
    salesPage: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "subheadline", "bullets", "faq"],
      properties: {
        headline: { type: "string" },
        subheadline: { type: "string" },
        bullets: { type: "array", minItems: 5, maxItems: 7, items: { type: "string" } },
        faq: {
          type: "array",
          minItems: 4,
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["question", "answer"],
            properties: {
              question: { type: "string" },
              answer: { type: "string" },
            },
          },
        },
      },
    },
    bonuses: { type: "array", minItems: 4, maxItems: 6, items: { type: "string" } },
    launchChecklist: { type: "array", minItems: 7, maxItems: 10, items: { type: "string" } },
    closingNote: { type: "string" },
  },
};

const ebookPackageSchema = {
  ...ebookSchema,
  required: ebookSchema.required.filter((field) => field !== "chapters"),
  properties: Object.fromEntries(Object.entries(ebookSchema.properties).filter(([field]) => field !== "chapters")),
};

const ebookChaptersSchema = {
  type: "object",
  additionalProperties: false,
  required: ["chapters"],
  properties: {
    chapters: ebookSchema.properties.chapters,
  },
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
        imagesEnabled: enableImages,
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/generate-ebook") {
      await handleGenerateEbook(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/generate-cover") {
      await handleGenerateCover(request, response);
      return;
    }

    if (request.method === "POST" && (url.pathname === "/api/export" || url.pathname === "/api/download-pdf")) {
      await handleExport(request, response, url.pathname === "/api/download-pdf" ? "pdf" : null);
      return;
    }

    if (request.method === "GET") {
      await serveStatic(url.pathname, response);
      return;
    }

    sendJson(response, 405, { error: "지원하지 않는 요청입니다." });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "서버 처리 중 오류가 발생했습니다." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Monograph AI server running at http://127.0.0.1:${port}`);
});

async function handleGenerateEbook(request, response) {
  if (!client) {
    sendJson(response, 503, { error: "OPENAI_API_KEY가 설정되어 있지 않습니다. .env 파일 또는 환경 변수에 키를 추가하세요." });
    return;
  }

  const body = await readJson(request);
  const topic = cleanText(body.topic, "수익형 전자책 만들기");
  const audience = cleanText(body.audience, "새로운 디지털 상품을 만들고 싶은 사람");
  const tone = cleanText(body.tone, "프리미엄 실전형");
  const profile = premiumGenerationProfile();

  const packageResult = await client.responses.create({
    model: writingModel,
    max_output_tokens: 12_000,
    input: buildEbookPackagePrompt({ topic, audience, tone }, profile),
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

  const chaptersResult = await client.responses.create({
    model: writingModel,
    max_output_tokens: 20_000,
    input: buildChaptersPrompt({ topic, audience, tone }, ebook),
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
  ebook.coverImage = null;
  sendJson(response, 200, { ebook });
}

function buildEbookPrompt({ topic, audience, tone }, profile = premiumGenerationProfile()) {
  return [
    {
      role: "system",
      content:
        "너는 한국어 베스트셀러 실용서 편집자이자 전문 전자책 작가다. 결과물은 사용 설명서가 아니라 돈을 받고 판매할 수 있는 완성형 전자책 원고여야 한다. 각 장은 문제 제기, 배경 설명, 실제 사례, 실행 순서, 검수 기준, 다음 행동까지 이어지는 긴 호흡의 원고로 쓴다. 추상적인 조언을 피하고, 독자의 상황을 이해하는 문장, 구체적인 예시, 실제 적용 순서, 적당한 단호함과 따뜻함이 있는 원고를 쓴다. 과장된 수익 보장, 허위 후기, 근거 없는 숫자는 쓰지 않는다. 마케팅 문구만 나열하지 말고 독자가 읽으면서 배우고, 읽은 뒤 바로 실행할 수 있는 실전형 전자책을 만든다.",
    },
    {
      role: "user",
      content: `전자책 주제: ${topic}
타깃 독자: ${audience}
톤: ${tone}
생성 범위: 프리미엄 풀패키지

품질 기준:
- 제목과 부제는 상업적이지만 싸구려 광고처럼 보이지 않게 작성
- authorName은 실제 개인 저자처럼 보이되 유명인 이름은 쓰지 않기
- 별도 권장 판매가, 가격 메타데이터, 사업자 정보, 연락처 정보는 만들지 않기
- coverImagePrompt는 표지에 넣을 고급 편집 이미지 프롬프트로 작성. 이미지 안에 글자는 넣지 말라고 명시
- editorNote는 이 책을 왜 만들었는지 짧은 편집자 노트처럼 작성
- introduction은 저자가 독자에게 말하듯 10~14문장으로 작성. 왜 이 주제가 돈이 되는지, 독자가 어디서 막히는지, 이 책을 어떻게 읽고 실행해야 하는지까지 설명
- quickStartRoadmap은 완전 초보자가 10~14일 안에 첫 결과물을 만들도록 Day 0부터 Day 14에 가까운 실행 로드맵으로 작성. 각 날짜의 tasks는 클릭할 메뉴, 만들 파일, 써야 할 문장, 점검할 지표처럼 작게 쪼개기
- toolStack은 실제로 어떤 도구를 쓰는지 작성. 예: MONOGRAPH AI, CapCut, Canva, YouTube Studio, TikTok, Instagram, Notion/Google Sheets 등. 주제에 맞지 않으면 더 적절한 도구로 바꾸기
- monetizationModel은 플랫폼별 수익 구조, 조회수/전환/판매 같은 확인 지표, 현실적 소요 기간을 구체적으로 작성. 수익 보장은 하지 않기
- revenueCaseStudies는 독자가 참고할 수 있는 현실 기반 수익 사례 6~8개를 작성. 검증되지 않은 특정 실명이나 회사명을 쓰지 말고, 익명화된 사례처럼 작성. 숫자는 매출 보장이 아니라 예시 범위로 쓰고, 준비물, 판매 전 준비, 유입 채널, 가격 테스트, 실패 후 수정, 배운 점을 포함
- chapter.title에는 '1장', 'Chapter', 숫자 번호를 넣지 말고 순수 제목만 작성
- chapter.opening은 해당 장을 여는 강한 문제 제기 3~5문장으로 작성
- chapter는 6~8개로 구성하되, 각 장이 하나의 실행 단계가 되게 작성
- chapter.body는 실제 전자책 본문 단락 8~10개. 각 단락은 3~5문장으로 충분히 길게 작성하고, 정의만 하지 말고 왜 필요한지, 초보자가 어디서 막히는지, 구체적으로 어떻게 해결하는지까지 설명
- chapter.caseStudy는 가상의 독자 사례 6~8문장. 시작 상황, 실행 과정, 막힌 지점, 수정한 방법, 얻은 결과를 포함
- chapter.requiredTools는 이 장을 실행하는 데 필요한 도구명, 쓰는 이유, 계정/파일/폴더/설정 방법을 아주 구체적으로 작성
- chapter.stepByStep은 독자가 화면을 보며 따라 할 수 있을 정도로 10~14단계로 작성. '어느 메뉴를 누르는지', '어떤 파일명을 쓰는지', '어떤 문장을 입력하는지', '완료 기준이 무엇인지'까지 적기
- chapter.platformActions는 실제 플랫폼에서 해야 할 행동을 6~10개 작성. 계정 세팅, 업로드, 제목/설명/태그, 링크 배치, 결제/문의 동선, 지표 확인을 주제에 맞게 포함
- chapter.qualityChecklist는 결과물이 팔리거나 조회될 최소 품질 기준을 6~10개 작성
- chapter.commonMistakes는 초보자가 흔히 망치는 지점과 피하는 법을 5~8개 작성
- chapter.actionItems는 바로 실행할 체크리스트 6~9개를 작성
- reflectionQuestions는 독자가 직접 써볼 질문 3~5개를 작성
- 각 장은 짧은 답변 묶음이 아니라 '본문 원고'처럼 자연스럽게 이어져야 한다. 리스트는 실행 파트에서만 쓰고, body는 설명형 문단으로 작성
- 모든 내용은 자연스러운 한국어로 작성
- JSON 구조만 반환`,
    },
    {
      role: "user",
      content: `프리미엄 풀패키지 지침:
- 예상 PDF 페이지 수는 ${profile.pageRange} 범위 안에서 현실적으로 산정한다.
- 챕터는 ${profile.chapterCount}개 안팎으로 구성한다.
- 각 장 본문 단락은 ${profile.bodyParagraphs}개 안팎으로 작성한다.
- 로드맵은 ${profile.roadmapDays}개 단계 안팎으로 작성한다.
- 도구 세팅은 ${profile.toolCount}개 안팎으로 작성한다.
- pageCount는 실제 생성량에 맞춘 예상 PDF 페이지 수로 작성하고 과장하지 않는다.
- 페이지 수보다 중요한 것은 독자가 그대로 따라 할 수 있는 구체적인 실행 순서다.
- 전체 결과물은 '개요 + 실행 로드맵 + 본문 원고 + 판매 패키지'가 모두 갖춰진 전자책이어야 한다.
- 사용자가 주제를 바꿔도 일반론을 반복하지 말고, 반드시 해당 주제의 플랫폼, 도구, 파일, 문구, 검수 기준을 맞춤형으로 바꾼다.`,
    },
  ];
}

function buildEbookPackagePrompt(payload, profile = premiumGenerationProfile()) {
  return [
    ...buildEbookPrompt(payload, profile),
    {
      role: "user",
      content:
        "1차 호출에서는 chapters 필드를 만들지 않는다. 대신 제목, 부제, 저자, 독자, 예상 분량, 표지 프롬프트, 편집자 노트, 들어가며, 로드맵, 도구 세팅, 수익 구조, 수익 사례, 판매 페이지, 보너스, 런칭 체크리스트, 마무리 노트를 완성한다. 이후 2차 호출에서 같은 품질 기준으로 긴 챕터 본문을 별도 생성한다.",
    },
  ];
}

function buildChaptersPrompt({ topic, audience, tone }, ebook) {
  return [
    {
      role: "system",
      content:
        "너는 한국어 베스트셀러 실용서 편집자이자 전문 전자책 작가다. 이미 완성된 전자책 패키지 기획을 바탕으로, 돈을 받고 판매할 수 있는 긴 호흡의 본문 챕터만 작성한다. 각 장은 문제 제기, 배경 설명, 실제 사례, 실행 순서, 검수 기준, 다음 행동까지 이어지는 완성형 원고여야 한다.",
    },
    {
      role: "user",
      content: `전자책 주제: ${cleanText(topic, "수익형 전자책 만들기")}
타깃 독자: ${cleanText(audience, "새로운 디지털 상품을 만들고 싶은 사람")}
톤: ${cleanText(tone, "프리미엄 실전형")}

이미 생성된 전자책 패키지:
- 제목: ${cleanText(ebook.title, "")}
- 부제: ${cleanText(ebook.subtitle, "")}
- 대상 독자: ${cleanText(ebook.audience, "")}
- 들어가며 요약: ${cleanText(ebook.introduction, "").slice(0, 900)}
- 수익 구조: ${cleanText(ebook.monetizationModel?.primaryRevenue, "")} / ${cleanText(ebook.monetizationModel?.secondaryRevenue, "")}
- 주요 도구: ${ensureList(ebook.toolStack, []).map((item) => item.tool).filter(Boolean).slice(0, 10).join(", ")}
- 로드맵 목표: ${ensureList(ebook.quickStartRoadmap, []).map((item) => item.goal).filter(Boolean).slice(0, 14).join(" / ")}

챕터 작성 기준:
- chapters 배열만 반환한다.
- chapter.title에는 '1장', 'Chapter', 숫자 번호를 넣지 말고 순수 제목만 작성한다.
- chapter.opening은 해당 장을 여는 강한 문제 제기 3~5문장으로 작성한다.
- chapter는 6~8개로 구성하되, 각 장이 하나의 실행 단계가 되게 작성한다.
- chapter.body는 실제 전자책 본문 단락 8~10개. 각 단락은 3~5문장으로 충분히 길게 작성하고, 정의만 하지 말고 왜 필요한지, 초보자가 어디서 막히는지, 구체적으로 어떻게 해결하는지까지 설명한다.
- chapter.caseStudy는 가상의 독자 사례 6~8문장. 시작 상황, 실행 과정, 막힌 지점, 수정한 방법, 얻은 결과를 포함한다.
- chapter.requiredTools는 이 장을 실행하는 데 필요한 도구명, 쓰는 이유, 계정/파일/폴더/설정 방법을 아주 구체적으로 작성한다.
- chapter.stepByStep은 독자가 화면을 보며 따라 할 수 있을 정도로 10~14단계로 작성한다.
- chapter.platformActions는 실제 플랫폼에서 해야 할 행동을 6~10개 작성한다.
- chapter.qualityChecklist는 결과물이 팔리거나 조회될 최소 품질 기준을 6~10개 작성한다.
- chapter.commonMistakes는 초보자가 흔히 망치는 지점과 피하는 법을 5~8개 작성한다.
- chapter.actionItems는 바로 실행할 체크리스트 6~9개를 작성한다.
- reflectionQuestions는 독자가 직접 써볼 질문 3~5개를 작성한다.
- 별도 권장 판매가, 가격 메타데이터, 사업자 정보, 연락처 정보는 만들지 않는다.
- 모든 내용은 자연스러운 한국어로 작성한다.`,
    },
  ];
}

async function handleGenerateCover(request, response) {
  if (!client) {
    sendJson(response, 503, { error: "OPENAI_API_KEY가 설정되어 있지 않습니다." });
    return;
  }

  if (!enableImages) {
    sendJson(response, 200, { coverImage: null, skipped: true });
    return;
  }

  const body = await readJson(request);
  const ebook = body.ebook;
  const topic = cleanText(body.topic || ebook?.title, "전자책 표지");

  if (!ebook?.title) {
    sendJson(response, 400, { error: "표지를 만들 전자책 데이터가 없습니다." });
    return;
  }

  const coverImage = await generateCoverImage(ebook, topic);
  sendJson(response, 200, { coverImage });
}

async function generateCoverImage(ebook, topic) {
  try {
    const prompt = `${ebook.coverImagePrompt}

Book topic: ${topic}
Style: premium Korean business ebook cover image, editorial photography, cinematic but clean, no words, no logos, no watermark, no mockup frame, suitable as a full bleed cover background.`;

    const image = await client.images.generate({
      model: imageModel,
      prompt,
      size: "1024x1536",
      quality: "high",
    });

    const b64 = image.data?.[0]?.b64_json;
    return b64 ? { mimeType: "image/png", data: b64, prompt } : null;
  } catch (error) {
    console.warn("Cover image generation skipped:", error.message);
    return null;
  }
}

async function handleExport(request, response, forcedFormat) {
  const body = await readJson(request);
  const ebook = sanitizeExportEbook(body.ebook);
  const template = ["obsidian", "ivory", "graphite"].includes(body.template) ? body.template : "obsidian";
  const format = forcedFormat || normalizeFormat(body.format);

  if (!ebook?.title) {
    sendJson(response, 400, { error: "내보낼 전자책 데이터가 없습니다." });
    return;
  }

  const baseName = slugify(ebook.title);

  if (format === "pdf") {
    const pdf = await renderPdf(ebook, template);
    sendFile(response, pdf, "application/pdf", `${baseName}.pdf`);
    return;
  }

  if (format === "html") {
    sendFile(response, Buffer.from(renderStandaloneHtml(ebook, template), "utf8"), "text/html; charset=utf-8", `${baseName}.html`);
    return;
  }

  if (format === "markdown") {
    sendFile(response, Buffer.from(renderMarkdown(ebook), "utf8"), "text/markdown; charset=utf-8", `${baseName}.md`);
    return;
  }

  sendFile(response, Buffer.from(JSON.stringify(ebook, null, 2), "utf8"), "application/json; charset=utf-8", `${baseName}.json`);
}

async function renderPdf(ebook, template) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(renderStandaloneHtml(ebook, template), { waitUntil: "networkidle" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "15mm", bottom: "16mm", left: "15mm" },
    });
  } finally {
    await browser.close();
  }
}

async function serveStatic(urlPath, response) {
  const safePath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.resolve(__dirname, `.${decodeURIComponent(safePath)}`);

  if (!filePath.startsWith(__dirname)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  const ext = path.extname(filePath);
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
  };

  try {
    const content = await fs.promises.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store, max-age=0",
    });
    response.end(content);
  } catch {
    sendJson(response, 404, { error: "Not found" });
  }
}

function renderStandaloneHtml(ebook, template) {
  const palette = {
    obsidian: { bg: "#11100f", text: "#f8f1e5", page: "#fbf7ef", ink: "#18130e", soft: "#f4eadc" },
    ivory: { bg: "#fff8ec", text: "#17130e", page: "#fff8ec", ink: "#17130e", soft: "#f3eadc" },
    graphite: { bg: "#202225", text: "#f8f1e5", page: "#f5f1e8", ink: "#17130e", soft: "#ebe4d8" },
  }[template];
  const coverImage = ebook.coverImage?.data ? `data:${ebook.coverImage.mimeType || "image/png"};base64,${ebook.coverImage.data}` : "";

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(ebook.title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: ${palette.page}; color: ${palette.ink}; font-family: Arial, "Noto Sans KR", sans-serif; line-height: 1.74; word-break: keep-all; }
    .cover { min-height: 960px; position: relative; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; background: ${palette.bg}; color: ${palette.text}; padding: 70px 58px; border-bottom: 8px solid #d6aa61; }
    .cover::before { content: ""; position: absolute; inset: 0; background: ${coverImage ? `linear-gradient(90deg, rgba(0,0,0,.74), rgba(0,0,0,.28)), url("${coverImage}") center/cover` : "radial-gradient(circle at 70% 28%, rgba(214,170,97,.25), transparent 30%), linear-gradient(135deg, #17130e, #050505)"}; }
    .cover > * { position: relative; z-index: 1; }
    .kicker { color: #d6aa61; font-size: 13px; font-weight: 800; letter-spacing: 0.12em; }
    h1 { margin: 0; max-width: 720px; font-size: 54px; line-height: 1.08; letter-spacing: 0; }
    .subtitle { margin-top: 20px; max-width: 620px; font-size: 20px; opacity: 0.86; }
    .author { margin-top: 34px; font-size: 16px; color: #d6aa61; }
    .cover-meta { display: flex; justify-content: space-between; gap: 18px; border-top: 1px solid rgba(214,170,97,.58); padding-top: 22px; font-size: 15px; opacity: .88; }
    main { max-width: 820px; margin: 0 auto; padding: 42px 28px 72px; }
    section { break-inside: avoid; margin-bottom: 34px; }
    .page-break { break-before: page; }
    h2 { margin: 0 0 16px; padding-bottom: 9px; border-bottom: 1px solid #d6aa61; font-size: 25px; }
    h3 { margin: 0 0 8px; font-size: 19px; }
    p { margin: 0 0 13px; }
    ol, ul { margin: 0; padding-left: 24px; }
    li { margin-bottom: 10px; }
    .editor-note { padding: 20px 22px; background: ${palette.soft}; border-left: 4px solid #d6aa61; }
    .toc li { padding: 7px 0; border-bottom: 1px solid rgba(214,170,97,.22); }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
    .table th, .table td { border-bottom: 1px solid rgba(214,170,97,.28); padding: 10px 8px; text-align: left; vertical-align: top; }
    .table th { color: #8a6732; font-size: 13px; }
    .chapter { break-before: page; margin-bottom: 26px; }
    .chapter:first-child { break-before: auto; }
    .chapter-opening { font-weight: 700; font-size: 16px; }
    .chapter-body p { text-align: justify; }
    .case-box, .action-box, .question-box, .sales-box, .tool-box, .step-box, .mistake-box { margin-top: 18px; padding: 18px; background: ${palette.soft}; border-left: 4px solid #d6aa61; }
    .revenue-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 18px; }
    .revenue-card { padding: 18px; background: ${palette.soft}; border: 1px solid rgba(214,170,97,.34); border-left: 4px solid #d6aa61; break-inside: avoid; }
    .revenue-card h3 { margin-bottom: 10px; }
    .revenue-card .case-number { display: inline-block; margin-bottom: 9px; border: 1px solid rgba(138,103,50,.38); border-radius: 999px; color: #8a6732; font-size: 12px; font-weight: 800; padding: 3px 8px; }
    .revenue-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 12px; padding: 0; list-style: none; }
    .revenue-tags li { margin: 0; border-radius: 999px; background: rgba(214,170,97,.14); color: #8a6732; font-size: 12px; font-weight: 800; padding: 4px 8px; }
    .label { margin-bottom: 8px; color: #8a6732; font-weight: 800; }
  </style>
</head>
<body>
  <article class="cover">
    <p class="kicker">실전 가이드북</p>
    <div>
      <h1>${escapeHtml(ebook.title)}</h1>
      <p class="subtitle">${escapeHtml(ebook.subtitle)}</p>
      <p class="author">${escapeHtml(ebook.authorName || "편집부")}</p>
    </div>
    <div class="cover-meta">
      <span>${escapeHtml(ebook.audience || "독자 맞춤형 전자책")}</span>
      <span>${escapeHtml(String(ebook.pageCount || ""))}p</span>
    </div>
  </article>
  <main>
    <section class="editor-note"><p class="label">편집자 노트</p>${paragraphs(ebook.editorNote)}</section>
    <section><h2>들어가며</h2>${paragraphs(ebook.introduction)}</section>
    <section>
      <h2>실행 로드맵</h2>
      <table class="table">
        <thead><tr><th>일정</th><th>목표</th><th>오늘 할 일</th><th>결과물</th></tr></thead>
        <tbody>${ensureList(ebook.quickStartRoadmap, []).map((item) => `<tr><td>${escapeHtml(item.day || "")}</td><td>${escapeHtml(item.goal || "")}</td><td><ul>${ensureList(item.tasks, []).map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul></td><td>${escapeHtml(item.output || "")}</td></tr>`).join("")}</tbody>
      </table>
    </section>
    <section>
      <h2>필수 도구 세팅</h2>
      <table class="table">
        <thead><tr><th>분류</th><th>도구</th><th>왜 쓰는가</th><th>처음 시작</th><th>무료 대안</th></tr></thead>
        <tbody>${ensureList(ebook.toolStack, []).map((item) => `<tr><td>${escapeHtml(item.category || "")}</td><td>${escapeHtml(item.tool || "")}</td><td>${escapeHtml(item.why || "")}</td><td>${escapeHtml(item.howToStart || "")}</td><td>${escapeHtml(item.freeAlternative || "")}</td></tr>`).join("")}</tbody>
      </table>
    </section>
    <section>
      <h2>수익 구조 한눈에 보기</h2>
      <div class="sales-box">
        <p class="label">주 수익</p>${paragraphs(ebook.monetizationModel?.primaryRevenue)}
        <p class="label">보조 수익</p>${paragraphs(ebook.monetizationModel?.secondaryRevenue)}
        <p class="label">사용 플랫폼</p><ul>${ensureList(ebook.monetizationModel?.platforms, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <p class="label">확인 지표</p><ul>${ensureList(ebook.monetizationModel?.metrics, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <p class="label">현실적인 기간</p>${paragraphs(ebook.monetizationModel?.realisticTimeline)}
      </div>
    </section>
    <section>
      <h2>현실 기반 수익 사례</h2>
      ${renderRevenueCaseStudies(ebook.revenueCaseStudies)}
    </section>
    <section>
      <h2>목차</h2>
      <ol class="toc">${(ebook.chapters || []).map((chapter) => `<li>${escapeHtml(cleanChapterTitle(chapter.title || ""))}</li>`).join("")}</ol>
    </section>
    <section class="page-break">
      <h2>본문</h2>
      ${(ebook.chapters || []).map((chapter, index) => renderChapter(chapter, index)).join("")}
    </section>
    <section><h2>런칭 체크리스트</h2><ol>${ensureList(ebook.launchChecklist, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></section>
    <section><h2>마치며</h2>${paragraphs(ebook.closingNote)}</section>
  </main>
</body>
</html>`;
}

function renderRevenueCaseStudies(items) {
  return `<div class="revenue-grid">${ensureList(items, [])
    .map(
      (item, index) => `<article class="revenue-card">
        <span class="case-number">${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(item.title || "")}</h3>
        <p class="label">상황</p>${paragraphs(item.context)}
        <p class="label">상품</p>${paragraphs(item.product)}
        <ul class="revenue-tags">${ensureList(item.channels, []).map((channel) => `<li>${escapeHtml(channel)}</li>`).join("")}</ul>
        <p class="label">수익 흐름</p>${paragraphs(item.revenuePath)}
        <p class="label">예시 수치</p>${paragraphs(item.numbers)}
        <p class="label">핵심 교훈</p>${paragraphs(item.lesson)}
      </article>`,
    )
    .join("")}</div>`;
}

function renderChapter(chapter, index) {
  return `<article class="chapter">
    <h3>${index + 1}. ${escapeHtml(cleanChapterTitle(chapter.title || ""))}</h3>
    <p class="chapter-opening">${escapeHtml(chapter.opening || "")}</p>
    <div class="chapter-body">${arrayParagraphs(chapter.body, chapter.opening)}</div>
    <div class="case-box"><p class="label">현장 예시</p>${paragraphs(chapter.caseStudy)}</div>
    <div class="tool-box">
      <p class="label">이 장에서 쓰는 도구</p>
      <table class="table">
        <thead><tr><th>도구</th><th>용도</th><th>세팅 방법</th></tr></thead>
        <tbody>${ensureList(chapter.requiredTools, []).map((tool) => `<tr><td>${escapeHtml(tool.name || "")}</td><td>${escapeHtml(tool.purpose || "")}</td><td>${escapeHtml(tool.setup || "")}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="step-box">
      <p class="label">화면 보면서 따라 하는 순서</p>
      <ol>${ensureList(chapter.stepByStep, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </div>
    <div class="step-box">
      <p class="label">플랫폼에서 실제로 할 일</p>
      <ol>${ensureList(chapter.platformActions, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </div>
    <div class="action-box">
      <p class="label">품질 체크리스트</p>
      <ul>${ensureList(chapter.qualityChecklist, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
    <div class="mistake-box">
      <p class="label">초보자가 자주 하는 실수</p>
      <ul>${ensureList(chapter.commonMistakes, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
    <div class="action-box">
      <p class="label">바로 실행하기</p>
      <ul>${ensureList(chapter.actionItems, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
    <div class="question-box">
      <p class="label">스스로 점검하기</p>
      <ol>${ensureList(chapter.reflectionQuestions, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </div>
  </article>`;
}

function renderMarkdown(ebook) {
  return `# ${ebook.title}

${ebook.subtitle}

- 저자: ${ebook.authorName}
- 대상 독자: ${ebook.audience}
- 예상 분량: ${ebook.pageCount}p

## 편집자 노트

${ebook.editorNote}

## 들어가며

${ebook.introduction}

## 실행 로드맵

${ensureList(ebook.quickStartRoadmap, []).map((item) => `### ${item.day} - ${item.goal}\n\n${ensureList(item.tasks, []).map((task) => `- ${task}`).join("\n")}\n\n결과물: ${item.output}`).join("\n\n")}

## 필수 도구 세팅

${ensureList(ebook.toolStack, []).map((item) => `### ${item.category}: ${item.tool}\n\n- 왜 쓰는가: ${item.why}\n- 처음 시작: ${item.howToStart}\n- 무료 대안: ${item.freeAlternative}`).join("\n\n")}

## 수익 구조

- 주 수익: ${ebook.monetizationModel?.primaryRevenue || ""}
- 보조 수익: ${ebook.monetizationModel?.secondaryRevenue || ""}
- 현실적인 기간: ${ebook.monetizationModel?.realisticTimeline || ""}

### 플랫폼
${ensureList(ebook.monetizationModel?.platforms, []).map((item) => `- ${item}`).join("\n")}

### 확인 지표
${ensureList(ebook.monetizationModel?.metrics, []).map((item) => `- ${item}`).join("\n")}

## 현실 기반 수익 사례

${ensureList(ebook.revenueCaseStudies, []).map(renderMarkdownRevenueCase).join("\n\n")}

## 목차

${ensureList(ebook.chapters, []).map((chapter, index) => `${index + 1}. ${cleanChapterTitle(chapter.title)}`).join("\n")}

## 본문

${ensureList(ebook.chapters, []).map(renderMarkdownChapter).join("\n\n")}

## 런칭 체크리스트

${ensureList(ebook.launchChecklist, []).map((item, index) => `${index + 1}. ${item}`).join("\n")}

## 마치며

${ebook.closingNote}

`;
}

function renderMarkdownRevenueCase(item, index) {
  return `### 사례 ${index + 1}. ${item.title || ""}

- 상황: ${item.context || ""}
- 상품: ${item.product || ""}
- 채널: ${ensureList(item.channels, []).join(", ")}
- 수익 흐름: ${item.revenuePath || ""}
- 예시 수치: ${item.numbers || ""}
- 핵심 교훈: ${item.lesson || ""}`;
}

function renderMarkdownChapter(chapter, index) {
  return `### ${index + 1}. ${cleanChapterTitle(chapter.title)}

${chapter.opening}

${ensureList(chapter.body, []).join("\n\n")}

#### 현장 예시

${chapter.caseStudy}

#### 이 장에서 쓰는 도구

${ensureList(chapter.requiredTools, []).map((tool) => `- ${tool.name}: ${tool.purpose} / 세팅: ${tool.setup}`).join("\n")}

#### 화면 보면서 따라 하는 순서

${ensureList(chapter.stepByStep, []).map((item, stepIndex) => `${stepIndex + 1}. ${item}`).join("\n")}

#### 플랫폼에서 실제로 할 일

${ensureList(chapter.platformActions, []).map((item, stepIndex) => `${stepIndex + 1}. ${item}`).join("\n")}

#### 품질 체크리스트

${ensureList(chapter.qualityChecklist, []).map((item) => `- ${item}`).join("\n")}

#### 초보자가 자주 하는 실수

${ensureList(chapter.commonMistakes, []).map((item) => `- ${item}`).join("\n")}

#### 바로 실행하기

${ensureList(chapter.actionItems, []).map((item) => `- ${item}`).join("\n")}

#### 스스로 점검하기

${ensureList(chapter.reflectionQuestions, []).map((item, questionIndex) => `${questionIndex + 1}. ${item}`).join("\n")}`;
}

function normalizeFormat(format) {
  return ["pdf", "html", "markdown", "json"].includes(format) ? format : "pdf";
}

function premiumGenerationProfile() {
  return {
    pageRange: "80~120페이지",
    chapterCount: "6~8",
    bodyParagraphs: "8~10",
    roadmapDays: "10~14",
    toolCount: "8~12",
  };
}

function paragraphs(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((item) => `<p>${escapeHtml(item.trim())}</p>`)
    .join("");
}

function arrayParagraphs(value, fallback) {
  return ensureList(value, [fallback || "핵심 내용을 정리하고 바로 실행할 수 있는 순서로 적용합니다."])
    .map((item) => `<p>${escapeHtml(item)}</p>`)
    .join("");
}

function ensureList(value, fallback) {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
}

function getOutputText(result) {
  if (result.output_text) return result.output_text;
  return ensureList(result.output, [])
    .flatMap((item) => ensureList(item.content, []))
    .map((content) => content.text || "")
    .filter(Boolean)
    .join("");
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 12_000_000) {
        request.destroy();
        reject(new Error("요청이 너무 큽니다."));
      }
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
}

function sendFile(response, buffer, contentType, fileName) {
  response.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": buffer.length,
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    "Cache-Control": "no-store",
  });
  response.end(buffer);
}

function sanitizeExportEbook(ebook) {
  const { salesPage, bonuses, ...exportEbook } = ebook || {};
  return exportEbook;
}

function cleanText(value, fallback) {
  return String(value || "").trim().replace(/\s+/g, " ") || fallback;
}

function slugify(value) {
  return cleanText(value, "ebook").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "-").slice(0, 42);
}

function cleanChapterTitle(value) {
  return cleanText(value, "")
    .replace(/^\s*(chapter\s*)?\d+\s*[\).:-]\s*/i, "")
    .replace(/^\s*\d+\s*장\s*[\).:-]?\s*/i, "")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const text = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
