const businessInfo = {
  name: "MONOGRAPH AI",
  registrationNumber: "202-44-67028",
  partnershipEmail: "ohmunxx01@gmail.com",
};

export const ebookSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "subtitle",
    "authorName",
    "audience",
    "pageCount",
    "price",
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
    price: { type: "string" },
    coverImagePrompt: { type: "string" },
    editorNote: { type: "string" },
    introduction: { type: "string" },
    quickStartRoadmap: {
      type: "array",
      minItems: 7,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "goal", "tasks", "output"],
        properties: {
          day: { type: "string" },
          goal: { type: "string" },
          tasks: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
          output: { type: "string" },
        },
      },
    },
    toolStack: {
      type: "array",
      minItems: 6,
      maxItems: 10,
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
      minItems: 5,
      maxItems: 6,
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
      minItems: 5,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "opening", "body", "caseStudy", "requiredTools", "stepByStep", "platformActions", "qualityChecklist", "commonMistakes", "actionItems", "reflectionQuestions"],
        properties: {
          title: { type: "string" },
          opening: { type: "string" },
          body: { type: "array", minItems: 4, maxItems: 6, items: { type: "string" } },
          caseStudy: { type: "string" },
          requiredTools: {
            type: "array",
            minItems: 3,
            maxItems: 7,
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
          stepByStep: { type: "array", minItems: 6, maxItems: 9, items: { type: "string" } },
          platformActions: { type: "array", minItems: 4, maxItems: 8, items: { type: "string" } },
          qualityChecklist: { type: "array", minItems: 4, maxItems: 8, items: { type: "string" } },
          commonMistakes: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
          actionItems: { type: "array", minItems: 4, maxItems: 6, items: { type: "string" } },
          reflectionQuestions: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
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

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function readJson(request, maxBytes = 8_000_000) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > maxBytes) {
    throw new HttpError(413, "요청이 너무 큽니다.");
  }

  const text = await request.text();
  if (text.length > maxBytes) {
    throw new HttpError(413, "요청이 너무 큽니다.");
  }

  return text ? JSON.parse(text) : {};
}

export function sendFile(content, contentType, fileName) {
  return new Response(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "no-store",
    },
  });
}

export async function callOpenAI(env, path, body) {
  if (!env.OPENAI_API_KEY) {
    throw new HttpError(503, "OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  const response = await fetch(`https://api.openai.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpError(response.status, data.error?.message || "OpenAI 요청에 실패했습니다.");
  }
  return data;
}

const rateLimitStore = globalThis.__monographRateLimitStore || new Map();
globalThis.__monographRateLimitStore = rateLimitStore;

export function enforceRateLimit(request, options = {}) {
  const limit = options.limit || 6;
  const windowMs = options.windowMs || 60 * 60 * 1000;
  const keyPrefix = options.keyPrefix || "api";
  const clientIp = getClientIp(request);
  const now = Date.now();
  const key = `${keyPrefix}:${clientIp}`;
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    pruneRateLimitStore(now);
    return;
  }

  if (record.count >= limit) {
    throw new HttpError(429, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
  }

  record.count += 1;
}

export async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SECRET_KEY) return;

  if (!token) {
    throw new HttpError(403, "보안 확인이 필요합니다. 페이지를 새로고침한 뒤 다시 시도해주세요.");
  }

  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  form.append("remoteip", getClientIp(request));

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new HttpError(403, "보안 확인에 실패했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.");
  }
}

export function requireSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const requestUrl = new URL(request.url);
  if (origin !== requestUrl.origin) {
    throw new HttpError(403, "허용되지 않은 요청 출처입니다.");
  }
}

function getClientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function pruneRateLimitStore(now) {
  if (rateLimitStore.size < 1000) return;
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) rateLimitStore.delete(key);
  }
}

export function normalizeGenerateInput(body) {
  return {
    topic: clampText(body.topic, "수익형 전자책 만들기", 120),
    audience: clampText(body.audience, "새로운 디지털 상품을 만들고 싶은 사람", 140),
    tone: clampText(body.tone, "프리미엄 실전형", 40),
  };
}

export function clampText(value, fallback, maxLength) {
  const text = cleanText(value, fallback);
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

export function getOutputText(result) {
  if (result.output_text) return result.output_text;
  return ensureList(result.output, [])
    .flatMap((item) => ensureList(item.content, []))
    .map((content) => content.text || "")
    .filter(Boolean)
    .join("");
}

export function buildEbookPrompt({ topic, audience, tone }) {
  const profile = {
    pageRange: "40~60페이지",
    chapterCount: "6",
    bodyParagraphs: "5~6",
    roadmapDays: "9~10",
    toolCount: "8~10",
  };

  return [
    {
      role: "system",
      content:
        "너는 한국어 베스트셀러 실용서 편집자이자 전문 전자책 작가다. 결과물은 AI가 쓴 티가 나지 않아야 한다. 추상적인 조언을 피하고, 독자의 상황을 이해하는 문장, 구체적인 예시, 실제 적용 순서, 적당한 단호함과 따뜻함이 있는 원고를 쓴다. 과장된 수익 보장, 허위 후기, 근거 없는 숫자는 쓰지 않는다. 마케팅 문구만 나열하지 말고 실제 판매 가능한 완성형 전자책 원고를 만든다.",
    },
    {
      role: "user",
      content: `전자책 주제: ${cleanText(topic, "수익형 전자책 만들기")}
타깃 독자: ${cleanText(audience, "새로운 디지털 상품을 만들고 싶은 사람")}
톤: ${cleanText(tone, "프리미엄 실전형")}
생성 범위: 프리미엄 풀패키지

품질 기준:
- 제목과 부제는 상업적이지만 싸구려 광고처럼 보이지 않게 작성
- authorName은 실제 개인 저자처럼 보이되 유명인 이름은 쓰지 않기
- coverImagePrompt는 표지에 넣을 고급 편집 이미지 프롬프트로 작성. 이미지 안에 글자는 넣지 말라고 명시
- editorNote는 이 책을 왜 만들었는지 짧은 편집자 노트처럼 작성
- introduction은 저자가 독자에게 말하듯 6~8문장으로 작성
- quickStartRoadmap은 완전 초보자가 10일 안에 첫 결과물을 만들도록 Day 0부터 Day 10까지에 가까운 실행 로드맵으로 작성
- toolStack은 실제로 어떤 도구를 쓰는지 작성. 주제에 맞는 도구로 바꾸기
- monetizationModel은 플랫폼별 수익 구조, 조회수/전환/판매 같은 확인 지표, 현실적 소요 기간을 구체적으로 작성. 수익 보장은 하지 않기
- revenueCaseStudies는 독자가 참고할 수 있는 현실 기반 수익 사례 5~6개를 작성. 검증되지 않은 특정 실명이나 회사명을 쓰지 말고, 익명화된 사례처럼 작성
- chapter.title에는 '1장', 'Chapter', 숫자 번호를 넣지 말고 순수 제목만 작성
- chapter는 5~6개로 구성하되, 각 장이 하나의 실행 단계가 되게 작성
- chapter.body는 실제 본문 단락 5~6개. 각 단락은 2~4문장으로 충분히 길게 작성
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
- 페이지 수보다 중요한 것은 독자가 그대로 따라 할 수 있는 구체적인 실행 순서다.`,
    },
  ];
}

export function renderStandaloneHtml(ebook, template = "obsidian") {
  const palette = {
    obsidian: { bg: "#11100f", text: "#f8f1e5", page: "#fbf7ef", ink: "#18130e", soft: "#f4eadc" },
    ivory: { bg: "#fff8ec", text: "#17130e", page: "#fff8ec", ink: "#17130e", soft: "#f3eadc" },
    graphite: { bg: "#202225", text: "#f8f1e5", page: "#f5f1e8", ink: "#17130e", soft: "#ebe4d8" },
  }[template] || { bg: "#11100f", text: "#f8f1e5", page: "#fbf7ef", ink: "#18130e", soft: "#f4eadc" };
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
    .editor-note, .case-box, .action-box, .question-box, .sales-box, .tool-box, .step-box, .mistake-box { margin-top: 18px; padding: 18px; background: ${palette.soft}; border-left: 4px solid #d6aa61; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
    .table th, .table td { border-bottom: 1px solid rgba(214,170,97,.28); padding: 10px 8px; text-align: left; vertical-align: top; }
    .table th, .label { color: #8a6732; font-weight: 800; }
    .chapter { break-before: page; margin-bottom: 26px; }
    .chapter-body p { text-align: justify; }
    .revenue-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 18px; }
    .revenue-card { padding: 18px; background: ${palette.soft}; border: 1px solid rgba(214,170,97,.34); border-left: 4px solid #d6aa61; break-inside: avoid; }
    .revenue-card .case-number { display: inline-block; margin-bottom: 9px; border: 1px solid rgba(138,103,50,.38); border-radius: 999px; color: #8a6732; font-size: 12px; font-weight: 800; padding: 3px 8px; }
    .revenue-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 12px; padding: 0; list-style: none; }
    .revenue-tags li { margin: 0; border-radius: 999px; background: rgba(214,170,97,.14); color: #8a6732; font-size: 12px; font-weight: 800; padding: 4px 8px; }
    @media print { body { background: #fff; } }
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
      <span>${escapeHtml(String(ebook.pageCount || ""))}p · 권장 판매가 ${escapeHtml(ebook.price || "")}</span>
    </div>
  </article>
  <main>
    <section class="editor-note"><p class="label">편집자 노트</p>${paragraphs(ebook.editorNote)}</section>
    <section><h2>들어가며</h2>${paragraphs(ebook.introduction)}</section>
    <section><h2>10일 실행 로드맵</h2><table class="table"><thead><tr><th>일정</th><th>목표</th><th>오늘 할 일</th><th>결과물</th></tr></thead><tbody>${ensureList(ebook.quickStartRoadmap, []).map((item) => `<tr><td>${escapeHtml(item.day || "")}</td><td>${escapeHtml(item.goal || "")}</td><td><ul>${ensureList(item.tasks, []).map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul></td><td>${escapeHtml(item.output || "")}</td></tr>`).join("")}</tbody></table></section>
    <section><h2>필수 도구 세팅</h2><table class="table"><thead><tr><th>분류</th><th>도구</th><th>왜 쓰는가</th><th>처음 시작</th><th>무료 대안</th></tr></thead><tbody>${ensureList(ebook.toolStack, []).map((item) => `<tr><td>${escapeHtml(item.category || "")}</td><td>${escapeHtml(item.tool || "")}</td><td>${escapeHtml(item.why || "")}</td><td>${escapeHtml(item.howToStart || "")}</td><td>${escapeHtml(item.freeAlternative || "")}</td></tr>`).join("")}</tbody></table></section>
    <section><h2>수익 구조 한눈에 보기</h2><div class="sales-box"><p class="label">주 수익</p>${paragraphs(ebook.monetizationModel?.primaryRevenue)}<p class="label">보조 수익</p>${paragraphs(ebook.monetizationModel?.secondaryRevenue)}<p class="label">사용 플랫폼</p><ul>${ensureList(ebook.monetizationModel?.platforms, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><p class="label">확인 지표</p><ul>${ensureList(ebook.monetizationModel?.metrics, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><p class="label">현실적인 기간</p>${paragraphs(ebook.monetizationModel?.realisticTimeline)}</div></section>
    <section><h2>현실 기반 수익 사례</h2>${renderRevenueCaseStudies(ebook.revenueCaseStudies)}</section>
    <section><h2>목차</h2><ol>${ensureList(ebook.chapters, []).map((chapter) => `<li>${escapeHtml(cleanChapterTitle(chapter.title || ""))}</li>`).join("")}</ol></section>
    <section class="page-break"><h2>본문</h2>${ensureList(ebook.chapters, []).map(renderChapter).join("")}</section>
    <section><h2>판매 페이지 문구</h2><div class="sales-box"><h3>${escapeHtml(ebook.salesPage?.headline || "")}</h3><p>${escapeHtml(ebook.salesPage?.subheadline || "")}</p><ul>${ensureList(ebook.salesPage?.bullets, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></section>
    <section><h2>보너스 구성</h2><ul>${ensureList(ebook.bonuses, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
    <section><h2>런칭 체크리스트</h2><ol>${ensureList(ebook.launchChecklist, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></section>
    <section><h2>FAQ</h2>${ensureList(ebook.salesPage?.faq, []).map((item) => `<div class="question-box"><h3>${escapeHtml(item.question || "")}</h3><p>${escapeHtml(item.answer || "")}</p></div>`).join("")}</section>
    <section><h2>마치며</h2>${paragraphs(ebook.closingNote)}</section>
  </main>
</body>
</html>`;
}

function renderRevenueCaseStudies(items) {
  return `<div class="revenue-grid">${ensureList(items, []).map((item, index) => `<article class="revenue-card"><span class="case-number">${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(item.title || "")}</h3><p class="label">상황</p>${paragraphs(item.context)}<p class="label">상품</p>${paragraphs(item.product)}<ul class="revenue-tags">${ensureList(item.channels, []).map((channel) => `<li>${escapeHtml(channel)}</li>`).join("")}</ul><p class="label">수익 흐름</p>${paragraphs(item.revenuePath)}<p class="label">예시 수치</p>${paragraphs(item.numbers)}<p class="label">핵심 교훈</p>${paragraphs(item.lesson)}</article>`).join("")}</div>`;
}

function renderChapter(chapter, index) {
  return `<article class="chapter"><h3>${index + 1}. ${escapeHtml(cleanChapterTitle(chapter.title || ""))}</h3><p class="chapter-opening">${escapeHtml(chapter.opening || "")}</p><div class="chapter-body">${arrayParagraphs(chapter.body, chapter.opening)}</div><div class="case-box"><p class="label">현장 예시</p>${paragraphs(chapter.caseStudy)}</div><div class="tool-box"><p class="label">이 장에서 쓰는 도구</p><table class="table"><thead><tr><th>도구</th><th>용도</th><th>세팅 방법</th></tr></thead><tbody>${ensureList(chapter.requiredTools, []).map((tool) => `<tr><td>${escapeHtml(tool.name || "")}</td><td>${escapeHtml(tool.purpose || "")}</td><td>${escapeHtml(tool.setup || "")}</td></tr>`).join("")}</tbody></table></div><div class="step-box"><p class="label">화면 보면서 따라 하는 순서</p><ol>${ensureList(chapter.stepByStep, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></div><div class="step-box"><p class="label">플랫폼에서 실제로 할 일</p><ol>${ensureList(chapter.platformActions, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></div><div class="action-box"><p class="label">품질 체크리스트</p><ul>${ensureList(chapter.qualityChecklist, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div><div class="mistake-box"><p class="label">초보자가 자주 하는 실수</p><ul>${ensureList(chapter.commonMistakes, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div><div class="action-box"><p class="label">바로 실행하기</p><ul>${ensureList(chapter.actionItems, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div><div class="question-box"><p class="label">스스로 점검하기</p><ol>${ensureList(chapter.reflectionQuestions, []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></div></article>`;
}

export function renderMarkdown(ebook) {
  return `# ${ebook.title}

${ebook.subtitle}

- 저자: ${ebook.authorName}
- 대상 독자: ${ebook.audience}
- 예상 분량: ${ebook.pageCount}p
- 권장 판매가: ${ebook.price}

## 편집자 노트

${ebook.editorNote}

## 들어가며

${ebook.introduction}

## 10일 실행 로드맵

${ensureList(ebook.quickStartRoadmap, []).map((item) => `### ${item.day} - ${item.goal}\n\n${ensureList(item.tasks, []).map((task) => `- ${task}`).join("\n")}\n\n결과물: ${item.output}`).join("\n\n")}

## 필수 도구 세팅

${ensureList(ebook.toolStack, []).map((item) => `### ${item.category}: ${item.tool}\n\n- 왜 쓰는가: ${item.why}\n- 처음 시작: ${item.howToStart}\n- 무료 대안: ${item.freeAlternative}`).join("\n\n")}

## 수익 구조

- 주 수익: ${ebook.monetizationModel?.primaryRevenue || ""}
- 보조 수익: ${ebook.monetizationModel?.secondaryRevenue || ""}
- 현실적인 기간: ${ebook.monetizationModel?.realisticTimeline || ""}

## 현실 기반 수익 사례

${ensureList(ebook.revenueCaseStudies, []).map((item, index) => `### 사례 ${index + 1}. ${item.title || ""}\n\n- 상황: ${item.context || ""}\n- 상품: ${item.product || ""}\n- 채널: ${ensureList(item.channels, []).join(", ")}\n- 수익 흐름: ${item.revenuePath || ""}\n- 예시 수치: ${item.numbers || ""}\n- 핵심 교훈: ${item.lesson || ""}`).join("\n\n")}

## 목차

${ensureList(ebook.chapters, []).map((chapter, index) => `${index + 1}. ${cleanChapterTitle(chapter.title)}`).join("\n")}

## 본문

${ensureList(ebook.chapters, []).map((chapter, index) => `### ${index + 1}. ${cleanChapterTitle(chapter.title)}\n\n${chapter.opening}\n\n${ensureList(chapter.body, []).join("\n\n")}\n\n#### 현장 예시\n\n${chapter.caseStudy}\n\n#### 바로 실행하기\n\n${ensureList(chapter.actionItems, []).map((item) => `- ${item}`).join("\n")}`).join("\n\n")}

## 판매 페이지 문구

### ${ebook.salesPage?.headline || ""}

${ebook.salesPage?.subheadline || ""}

${ensureList(ebook.salesPage?.bullets, []).map((item) => `- ${item}`).join("\n")}

## 보너스 구성

${ensureList(ebook.bonuses, []).map((item) => `- ${item}`).join("\n")}

## 런칭 체크리스트

${ensureList(ebook.launchChecklist, []).map((item, index) => `${index + 1}. ${item}`).join("\n")}

## FAQ

${ensureList(ebook.salesPage?.faq, []).map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n")}

## 마치며

${ebook.closingNote}
`;
}

export function normalizeFormat(format) {
  return ["pdf", "html", "markdown", "json"].includes(format) ? format : "pdf";
}

export function slugify(value) {
  return cleanText(value, "ebook").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "-").slice(0, 42);
}

export function cleanText(value, fallback) {
  return String(value || "").trim().replace(/\s+/g, " ") || fallback;
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

export function ensureList(value, fallback = []) {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
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

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
