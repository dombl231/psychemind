const form = document.querySelector("#ebookForm");
const topicInput = document.querySelector("#topicInput");
const audienceInput = document.querySelector("#audienceInput");
const toneInput = document.querySelector("#toneInput");
const preview = document.querySelector("#ebookPreview");
const coverTitle = document.querySelector("#coverTitle");
const templateLabel = document.querySelector("#templateLabel");
const downloadButton = document.querySelector("#downloadButton");
const downloadFormat = document.querySelector("#downloadFormat");
const generateButton = document.querySelector("#generateButton");
const statusLine = document.querySelector("#statusLine");
const connectionCard = document.querySelector("#connectionCard");
const connectionDot = document.querySelector("#connectionDot");
const connectionState = document.querySelector("#connectionState");
const loadingLayer = document.querySelector("#loadingLayer");
const loadingTitle = document.querySelector("#loadingTitle");
const loadingMessage = document.querySelector("#loadingMessage");
const progressBar = document.querySelector("#progressBar");
const loadingSteps = [...document.querySelectorAll("#loadingSteps li")];
const themeToggle = document.querySelector("#themeToggle");
const templateButtons = [...document.querySelectorAll("[data-template]")];

let currentTemplate = "obsidian";
let currentEbook = null;
let progressTimer = null;
let serverRuntime = "node";

const templateNames = {
  obsidian: "OBSIDIAN TEMPLATE",
  ivory: "IVORY TEMPLATE",
  graphite: "GRAPHITE TEMPLATE",
};

const sampleEbook = {
  title: "직장인을 위한 AI 자동화 부업",
  subtitle: "퇴근 후 부수입을 만들고 싶은 초보자를 위한 프리미엄 실전형 전자책",
  authorName: "한서준",
  audience: "퇴근 후 부수입을 만들고 싶은 초보자",
  pageCount: 60,
  price: "29,000원",
  coverImagePrompt: "프리미엄 업무용 책상 위에 노트북, 노트, 은은한 금색 조명이 있는 고급 편집 사진. 이미지 안에 글자 없음.",
  editorNote: "이 책은 퇴근 후 짧은 시간을 현실적인 부업 구조로 바꾸고 싶은 독자를 위해 기획되었습니다.",
  quickStartRoadmap: [
    { day: "Day 0", goal: "작업 계정 준비", tasks: ["전용 이메일 만들기", "작업 폴더 만들기", "수익 기록 시트 만들기"], output: "부업 운영 기본 세팅" },
  ],
  toolStack: [
    { category: "원고", tool: "ChatGPT", why: "스크립트와 아이디어를 빠르게 만든다.", howToStart: "계정을 만들고 주제별 프롬프트를 저장한다.", freeAlternative: "무료 AI 챗봇" },
  ],
  monetizationModel: {
    primaryRevenue: "전자책 판매와 템플릿 판매를 주 수익으로 둔다.",
    secondaryRevenue: "상담, 강의, 제휴 링크를 보조 수익으로 둔다.",
    platforms: ["YouTube Shorts", "Instagram Reels", "TikTok"],
    metrics: ["조회수", "저장 수", "프로필 클릭", "판매 전환"],
    realisticTimeline: "첫 2주는 실험 기간으로 보고 4~8주 동안 반응을 누적해 개선한다.",
  },
  revenueCaseStudies: [
    {
      title: "회의록 템플릿 전자책으로 첫 판매를 만든 사례",
      context: "문서 정리에 익숙한 직장인이 회의록 작성 시간을 줄이는 방법을 전자책으로 정리했습니다.",
      product: "회의 전 준비표, 회의록 프롬프트, 후속 업무 체크리스트를 묶은 39,000원 상품",
      channels: ["브런치", "네이버 블로그", "오픈채팅"],
      revenuePath: "무료 글로 문제를 설명하고, 글 하단에서 전자책 상세페이지로 연결했습니다.",
      numbers: "초기 4주 동안 소량 판매와 피드백 수집을 목표로 운영했고, 후기 반영 후 템플릿 보너스를 추가했습니다.",
      lesson: "큰 노하우보다 바로 복사해 쓰는 양식이 구매 이유가 되었습니다.",
    },
    {
      title: "쇼츠 스크립트 패키지로 상담 문의를 만든 사례",
      context: "영상 편집 초보자를 대상으로 짧은 스크립트 작성법과 업로드 루틴을 정리했습니다.",
      product: "AI 스크립트 프롬프트 30개와 CapCut 편집 체크리스트",
      channels: ["YouTube Shorts", "Instagram Reels"],
      revenuePath: "짧은 팁 영상을 올리고 프로필 링크에서 전자책과 1회 피드백 상품을 함께 제안했습니다.",
      numbers: "전자책 단품보다 피드백 상품 문의가 함께 들어오면서 객단가를 높일 수 있었습니다.",
      lesson: "콘텐츠는 조회수보다 프로필 클릭과 문의 전환을 같이 봐야 합니다.",
    },
    {
      title: "엑셀 자동화 안내서로 재구매를 만든 사례",
      context: "반복 보고서 때문에 시간을 쓰는 사무직 독자에게 맞춘 실무형 전자책을 만들었습니다.",
      product: "보고서 자동화 순서, 샘플 시트, 검수 체크리스트",
      channels: ["네이버 카페", "블로그", "뉴스레터"],
      revenuePath: "무료 샘플 시트를 배포한 뒤 전체 전자책과 고급 템플릿을 순차적으로 판매했습니다.",
      numbers: "무료 샘플 사용자가 쌓인 뒤 고급 템플릿을 추가해 재구매 흐름을 만들었습니다.",
      lesson: "무료 샘플은 단순 홍보물이 아니라 다음 구매를 설계하는 체험판이어야 합니다.",
    },
    {
      title: "Notion 운영 템플릿으로 구독자를 모은 사례",
      context: "프리랜서가 고객 관리와 일정 정리에 쓰던 Notion 페이지를 초보자용 운영 템플릿으로 바꿨습니다.",
      product: "고객 관리 보드, 주간 업무 루틴, 견적 전 체크리스트를 묶은 템플릿 전자책",
      channels: ["뉴스레터", "LinkedIn", "커뮤니티"],
      revenuePath: "무료 체크리스트를 배포해 이메일 구독을 받고, 3일 뒤 활용법 메일에서 유료 템플릿을 제안했습니다.",
      numbers: "처음에는 낮은 가격의 템플릿으로 진입 장벽을 낮추고, 이후 맞춤 세팅 상담으로 확장했습니다.",
      lesson: "템플릿 상품은 사용 전후 화면을 보여줄수록 구매 판단이 빨라집니다.",
    },
    {
      title: "AI 이미지 프롬프트북으로 니치 시장을 잡은 사례",
      context: "스마트스토어 상세페이지를 만드는 소상공인을 대상으로 이미지 콘셉트 작성법을 정리했습니다.",
      product: "상품 사진 콘셉트 프롬프트, 배경 스타일 예시, 상세페이지 배치 체크리스트",
      channels: ["스마트스토어 카페", "Instagram", "블로그"],
      revenuePath: "예시 이미지를 보여주는 짧은 게시물로 관심을 모으고, 전체 프롬프트북을 다운로드 상품으로 판매했습니다.",
      numbers: "한 번에 큰 매출을 노리기보다 카테고리별 프롬프트팩을 나누어 반복 구매를 설계했습니다.",
      lesson: "대상이 좁을수록 예시가 구체적이어야 하고, 구체적인 예시가 곧 판매 문구가 됩니다.",
    },
    {
      title: "초보 강사용 강의안 패키지로 업셀을 만든 사례",
      context: "강의를 처음 준비하는 직장인과 1인 사업자가 막히는 지점을 강의안 제작 순서로 풀었습니다.",
      product: "90분 강의안 구조, 슬라이드 목차, 실습지, 후기 요청 문구",
      channels: ["브런치", "블로그", "오픈채팅"],
      revenuePath: "무료 목차 샘플을 공개하고, 전체 강의안 패키지와 1회 피드백권을 함께 판매했습니다.",
      numbers: "전자책 구매자 중 일부가 피드백권을 추가 구매하면서 단품 판매보다 높은 객단가를 만들었습니다.",
      lesson: "전자책 뒤에 자연스럽게 이어지는 피드백 상품이 있으면 수익 구조가 안정됩니다.",
    },
  ],
  chapters: [
    {
      title: "돈이 되는 반복 업무 찾기",
      opening: "직장인이 매일 겪는 반복 업무를 수익형 문제로 바꾸는 기준을 정리합니다.",
      body: ["부업 아이디어는 거창한 발명보다 작은 불편에서 시작되는 경우가 많습니다. 매주 반복해서 처리하는 보고서 정리, 고객 응대, 자료 조사 같은 일을 떠올려 보세요. 그 일을 더 빠르고 안정적으로 끝내는 방법을 정리하면 누군가에게는 바로 돈을 내고 사고 싶은 해결책이 됩니다."],
      caseStudy: "마케팅팀 대리 민수는 매주 같은 형식의 경쟁사 조사표를 만들었습니다. 처음에는 단순 업무라고 생각했지만, 이 과정을 템플릿과 프롬프트로 정리하자 다른 직장인도 바로 쓸 수 있는 작은 상품이 되었습니다.",
      requiredTools: [{ name: "Google Sheets", purpose: "반복 업무와 시간을 기록한다.", setup: "새 시트를 만들고 업무명, 소요 시간, 자동화 가능 여부 열을 만든다." }],
      stepByStep: ["이번 주 반복 업무를 모두 적는다.", "업무별 소요 시간을 적는다.", "AI가 대신할 수 있는 단계를 표시한다."],
      platformActions: ["작업 계정 이메일을 만든다.", "결과물을 저장할 폴더를 만든다.", "판매 후보 아이디어를 3개 적는다.", "반응을 기록할 시트를 만든다."],
      qualityChecklist: ["독자가 바로 따라 할 수 있는가", "결과물이 명확한가", "시간 절약 효과가 있는가", "초보자 용어로 설명했는가"],
      commonMistakes: ["너무 큰 주제를 고르는 것", "도구부터 배우려 하는 것", "수익을 먼저 보장하려는 것"],
      actionItems: ["이번 주 반복해서 한 일을 세 가지 적기", "각 업무에 걸린 시간을 기록하기", "AI로 줄일 수 있는 단계를 표시하기"],
      reflectionQuestions: ["내가 반복해서 하는 일 중 남들도 귀찮아할 일은 무엇인가요?", "그 일을 처음 하는 사람에게 어떤 순서가 필요할까요?"],
    },
    {
      title: "AI 자동화 상품 구조 만들기",
      opening: "프롬프트, 노코드 도구, 체크리스트를 묶어 판매 가능한 결과물로 설계합니다.",
      body: ["전자책은 정보만 담는 문서가 아니라 독자가 결과를 얻는 순서를 담아야 합니다. 프롬프트 예시, 입력 양식, 체크리스트를 함께 제공하면 독자는 읽는 데서 멈추지 않고 바로 실행할 수 있습니다."],
      caseStudy: "자료 정리에 익숙한 한 직장인은 회의록 요약 템플릿을 작은 전자책으로 만들었습니다. 본문보다 사람들이 좋아한 것은 그대로 복사해 쓸 수 있는 입력 예시와 검토 체크리스트였습니다.",
      actionItems: ["핵심 프롬프트 3개 만들기", "입력 템플릿 1개 만들기", "완료 체크리스트 작성하기"],
      reflectionQuestions: ["독자가 바로 복사해서 쓸 수 있는 자료는 무엇인가요?", "결과물을 확인하는 기준은 무엇인가요?"],
    },
    {
      title: "첫 고객을 설득하는 상세페이지",
      opening: "문제, 결과, 목차, 보너스, FAQ를 한 흐름으로 배치합니다.",
      body: ["상세페이지는 멋진 문장보다 독자의 불안을 줄이는 구조가 중요합니다. 독자가 현재 겪는 문제를 먼저 보여주고, 이 전자책을 읽은 뒤 얻을 결과를 구체적으로 제시해야 합니다."],
      caseStudy: "초기 판매 페이지가 잘 팔리지 않던 지은은 제목을 바꾸기보다 독자가 실제로 얻는 결과를 먼저 보여주었습니다. 목차와 FAQ가 구체적으로 바뀌자 문의보다 구매가 늘었습니다.",
      actionItems: ["독자의 문제 문장 5개 쓰기", "읽은 뒤 결과를 한 문장으로 정리하기", "FAQ 3개 작성하기"],
      reflectionQuestions: ["구매자가 결제 전 가장 불안해할 지점은 무엇인가요?", "그 불안을 줄일 증거는 무엇인가요?"],
    },
    {
      title: "런칭 후 후기와 업셀 설계",
      opening: "초기 구매자 피드백을 모아 전자책을 개선하고 다음 상품으로 연결합니다.",
      body: ["첫 판매 이후에는 완벽한 자동화보다 빠른 개선이 중요합니다. 구매자가 막힌 지점을 물어보고 그 답을 다음 버전에 반영하면 전자책은 점점 더 팔기 쉬운 상품이 됩니다."],
      caseStudy: "첫 판매 후 후기를 모은 한 창작자는 독자들이 가장 많이 막히는 부분을 별도 워크시트로 만들었습니다. 이 작은 보완이 다음 상품의 출발점이 되었습니다.",
      actionItems: ["구매자 피드백 질문 3개 만들기", "개선할 페이지 표시하기", "다음 상품 아이디어 2개 적기"],
      reflectionQuestions: ["구매자가 다음으로 필요로 할 도움은 무엇인가요?", "전자책 이후 자연스럽게 제안할 상품은 무엇인가요?"],
    },
  ],
  introduction: "이 전자책은 AI 자동화를 막연한 기술이 아니라 실제 판매 가능한 부업 상품으로 바꾸는 방법을 다룹니다.",
  salesPage: {
    headline: "퇴근 후 2시간, 반복 업무를 디지털 상품으로 바꾸세요.",
    bullets: ["초보자도 따라 하는 자동화 상품 설계", "판매 페이지 문구와 가격 전략 포함", "런칭 체크리스트와 보너스 구성 제공"],
    faq: [
      { question: "개발을 몰라도 가능한가요?", answer: "노코드 도구와 프롬프트 기반으로 시작할 수 있게 구성합니다." },
      { question: "얼마에 팔면 좋나요?", answer: "입문 상품은 19,000원에서 49,000원 사이로 테스트하는 전략을 권장합니다." },
    ],
  },
  bonuses: ["판매 페이지 템플릿", "AI 자동화 체크리스트", "첫 런칭 안내문"],
  launchChecklist: ["문제 문장 검증", "목차 공개", "사전 신청 링크 배포", "후기 수집"],
  closingNote: "작게 시작해도 괜찮습니다. 중요한 것은 반복 가능한 문제를 발견하고, 독자가 바로 따라 할 수 있는 형태로 정리하는 것입니다.",
};

function getFormPayload() {
  return {
    topic: cleanValue(topicInput.value, "수익형 전자책 만들기"),
    audience: cleanValue(audienceInput.value, "새로운 디지털 상품을 만들고 싶은 사람"),
    tone: toneInput.value,
    length: "premium",
    lengthLabel: "프리미엄 풀패키지",
    template: currentTemplate,
  };
}

async function checkServer() {
  setConnection("checking", "서버 상태 확인 중...");
  try {
    const response = await fetch(`/api/health?t=${Date.now()}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error("서버 상태 확인 실패");
    serverRuntime = data.runtime || "node";
    updateDownloadFormatLabels();
    if (data.hasOpenAIKey) {
      setConnection("online", "서버 연결 완료");
      setStatus("프리미엄 생성 준비 완료. 시간이 조금 걸려도 더 완성도 높은 전자책을 만듭니다.");
    } else {
      setConnection("warn", "서버 연결 완료");
      setStatus("서버는 켜져 있지만 OpenAI API 키가 필요합니다.");
    }
  } catch {
    setConnection("offline", "서버 연결 실패 · node server.mjs 확인");
    setStatus("서버에 연결할 수 없습니다. 서버 실행 상태를 확인하세요.");
  }
}

async function generateEbook() {
  setBusy(true, "OpenAI 생성 요청을 보냈습니다.");
  showLoading("프리미엄 전자책을 생성하는 중입니다", "풀패키지 기준으로 기획, 본문, 수익 사례, 판매 패키지를 작성하고 있습니다.");

  try {
    const response = await fetch("/api/generate-ebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getFormPayload()),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "전자책 생성에 실패했습니다.");
    }

    currentEbook = normalizeEbook(data.ebook);
    renderPreview();
    loadingTitle.textContent = "표지 이미지를 생성하는 중입니다";
    loadingMessage.textContent = "원고는 준비됐고, 이제 표지 이미지를 붙이고 있습니다.";
    await generateCoverForCurrentEbook();
    setStatus("프리미엄 전자책 생성 완료. 원하는 형식으로 다운로드할 수 있습니다.");
    finishLoading("생성 완료", "상세 원고와 표지 이미지가 준비되었습니다.");
    preview.animate(
      [
        { transform: "translateY(10px)", opacity: 0.65 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: 260, easing: "ease-out" },
    );
  } catch (error) {
    hideLoading();
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function generateCoverForCurrentEbook() {
  try {
    const response = await fetch("/api/generate-cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ebook: currentEbook, topic: topicInput.value }),
    });
    const data = await response.json();
    if (response.ok && data.coverImage) {
      currentEbook.coverImage = data.coverImage;
      renderPreview();
    }
  } catch {
    setStatus("원고 생성은 완료됐지만 표지 이미지는 건너뛰었습니다. 다운로드는 가능합니다.");
  }
}

async function downloadCurrentEbook() {
  if (!currentEbook) {
    currentEbook = normalizeEbook(sampleEbook);
    renderPreview();
  }

  const format = downloadFormat.value;
  const formatLabel = getDownloadFormatLabel(format);
  setBusy(true, `${formatLabel} 파일을 생성하는 중입니다...`);
  showLoading("파일을 생성하는 중입니다", `${formatLabel} 형식으로 전자책을 내보내고 있습니다.`, false);

  try {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ebook: currentEbook, template: currentTemplate, format }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "다운로드 파일 생성에 실패했습니다.");
    }

    const blob = await response.blob();
    const fileName = getFileNameFromResponse(response) || `${slugify(currentEbook.title)}.${format === "markdown" ? "md" : format}`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    finishLoading("다운로드 준비 완료", `${fileName} 파일을 내려받았습니다.`);
    setStatus(`${fileName} 다운로드가 완료되었습니다.`);
  } catch (error) {
    hideLoading();
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

function renderPreview() {
  if (!currentEbook) return;

  preview.className = `ebook-preview ${currentTemplate}`;
  templateLabel.textContent = templateNames[currentTemplate];
  coverTitle.textContent = currentEbook.title;

  preview.innerHTML = `
    <p class="preview-kicker">PROFIT EBOOK</p>
    <h3>${escapeHtml(currentEbook.title)}</h3>
    <p class="preview-subtitle">${escapeHtml(currentEbook.subtitle)}</p>
    <ol>
      ${currentEbook.chapters
        .slice(0, 5)
        .map((chapter) => `<li><strong>${escapeHtml(chapter.title)}</strong><span>${escapeHtml(chapter.opening)}</span></li>`)
        .join("")}
    </ol>
    <div class="sales-box">
      <strong>권장 판매가 ${escapeHtml(currentEbook.price)}</strong>
      <span>예상 구성: 본문 ${escapeHtml(currentEbook.pageCount)}p + 현장 예시 + 보너스 ${currentEbook.bonuses.length}종</span>
    </div>
    <div class="revenue-preview">
      <div class="revenue-preview-head">
        <span>REALISTIC REVENUE CASES</span>
        <strong>현실 기반 수익 사례 ${currentEbook.revenueCaseStudies.length}개</strong>
      </div>
      <div class="revenue-case-grid">
        ${currentEbook.revenueCaseStudies
          .slice(0, 6)
          .map(
            (item, index) => `<article class="revenue-case-card">
              <div class="case-number">${String(index + 1).padStart(2, "0")}</div>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.product)}</p>
              <div class="case-tags">${ensureArray(item.channels, []).slice(0, 3).map((channel) => `<span>${escapeHtml(channel)}</span>`).join("")}</div>
              <small>${escapeHtml(item.revenuePath)}</small>
            </article>`,
          )
          .join("")}
      </div>
    </div>
  `;
  if (currentEbook.coverImage?.data) {
    preview.insertAdjacentHTML(
      "afterbegin",
      `<img class="preview-cover-image" src="data:${currentEbook.coverImage.mimeType || "image/png"};base64,${currentEbook.coverImage.data}" alt="생성된 전자책 표지 이미지" />`,
    );
  }
}

function setTemplate(template) {
  currentTemplate = template;
  templateButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.template === template);
  });
  renderPreview();
}

function showLoading(title, message, useSteps = true) {
  let progress = 12;
  loadingLayer.hidden = false;
  loadingTitle.textContent = title;
  loadingMessage.textContent = message;
  progressBar.style.width = `${progress}%`;
  loadingSteps.forEach((step, index) => step.classList.toggle("is-active", index === 0));
  clearInterval(progressTimer);

  progressTimer = setInterval(() => {
    progress = Math.min(progress + (useSteps ? 9 : 16), 92);
    progressBar.style.width = `${progress}%`;
    const activeIndex = Math.min(Math.floor(progress / 25), loadingSteps.length - 1);
    loadingSteps.forEach((step, index) => {
      step.classList.toggle("is-active", index <= activeIndex);
    });
    if (useSteps) {
      const messages = ["목차를 설계하고 있습니다.", "챕터 요약을 작성하고 있습니다.", "판매 문구와 보너스를 구성하고 있습니다.", "미리보기를 정리하고 있습니다."];
      loadingMessage.textContent = messages[Math.min(activeIndex, messages.length - 1)];
    }
  }, 900);
}

function finishLoading(title, message) {
  clearInterval(progressTimer);
  progressBar.style.width = "100%";
  loadingSteps.forEach((step) => step.classList.add("is-active"));
  loadingTitle.textContent = title;
  loadingMessage.textContent = message;
  setTimeout(hideLoading, 650);
}

function hideLoading() {
  clearInterval(progressTimer);
  loadingLayer.hidden = true;
}

function setConnection(state, message) {
  connectionState.textContent = message;
  connectionCard.dataset.state = state;
  connectionDot.dataset.state = state;
}

function updateDownloadFormatLabels() {
  const pdfOption = downloadFormat.querySelector('option[value="pdf"]');
  if (pdfOption) {
    pdfOption.textContent = serverRuntime === "cloudflare-pages" ? "PDF 인쇄용 HTML" : "PDF";
  }
}

function getDownloadFormatLabel(format) {
  if (format === "pdf" && serverRuntime === "cloudflare-pages") return "PDF 인쇄용 HTML";
  return format.toUpperCase();
}

function normalizeEbook(ebook) {
  const fallback = sampleEbook;
  return {
    title: cleanValue(ebook?.title, fallback.title),
    subtitle: cleanValue(ebook?.subtitle, fallback.subtitle),
    audience: cleanValue(ebook?.audience, fallback.audience),
    pageCount: Number(ebook?.pageCount) || fallback.pageCount,
    price: cleanValue(ebook?.price, fallback.price),
    introduction: cleanValue(ebook?.introduction, fallback.introduction),
    quickStartRoadmap: ensureArray(ebook?.quickStartRoadmap, fallback.quickStartRoadmap),
    toolStack: ensureArray(ebook?.toolStack, fallback.toolStack),
    monetizationModel: ebook?.monetizationModel || fallback.monetizationModel,
    revenueCaseStudies: ensureArray(ebook?.revenueCaseStudies, fallback.revenueCaseStudies),
    chapters: ensureArray(ebook?.chapters, fallback.chapters).map((chapter, index) => ({
      title: cleanValue(chapter?.title, fallback.chapters[index % fallback.chapters.length].title),
      opening: cleanValue(chapter?.opening || chapter?.summary, fallback.chapters[index % fallback.chapters.length].opening),
      body: ensureArray(chapter?.body, fallback.chapters[index % fallback.chapters.length].body),
      caseStudy: cleanValue(chapter?.caseStudy, fallback.chapters[index % fallback.chapters.length].caseStudy),
      requiredTools: ensureArray(chapter?.requiredTools, fallback.chapters[0].requiredTools),
      stepByStep: ensureArray(chapter?.stepByStep, fallback.chapters[0].stepByStep),
      platformActions: ensureArray(chapter?.platformActions, fallback.chapters[0].platformActions),
      qualityChecklist: ensureArray(chapter?.qualityChecklist, fallback.chapters[0].qualityChecklist),
      commonMistakes: ensureArray(chapter?.commonMistakes, fallback.chapters[0].commonMistakes),
      actionItems: ensureArray(chapter?.actionItems, fallback.chapters[index % fallback.chapters.length].actionItems),
      reflectionQuestions: ensureArray(chapter?.reflectionQuestions, fallback.chapters[index % fallback.chapters.length].reflectionQuestions),
    })),
    salesPage: {
      headline: cleanValue(ebook?.salesPage?.headline, fallback.salesPage.headline),
      subheadline: cleanValue(ebook?.salesPage?.subheadline, fallback.salesPage.subheadline || fallback.salesPage.headline),
      bullets: ensureArray(ebook?.salesPage?.bullets, fallback.salesPage.bullets),
      faq: ensureArray(ebook?.salesPage?.faq, fallback.salesPage.faq).map((item, index) => ({
        question: cleanValue(item?.question, fallback.salesPage.faq[index % fallback.salesPage.faq.length].question),
        answer: cleanValue(item?.answer, fallback.salesPage.faq[index % fallback.salesPage.faq.length].answer),
      })),
    },
    bonuses: ensureArray(ebook?.bonuses, fallback.bonuses),
    launchChecklist: ensureArray(ebook?.launchChecklist, fallback.launchChecklist),
    authorName: cleanValue(ebook?.authorName, fallback.authorName),
    coverImagePrompt: cleanValue(ebook?.coverImagePrompt, fallback.coverImagePrompt),
    editorNote: cleanValue(ebook?.editorNote, fallback.editorNote),
    closingNote: cleanValue(ebook?.closingNote, fallback.closingNote),
    coverImage: ebook?.coverImage || null,
  };
}

function ensureArray(value, fallback) {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
}

function setBusy(isBusy, message) {
  generateButton.disabled = isBusy;
  downloadButton.disabled = isBusy;
  if (message) setStatus(message);
}

function setStatus(message) {
  statusLine.textContent = message;
}

function cleanValue(value, fallback) {
  return String(value || "").trim().replace(/\s+/g, " ") || fallback;
}

function slugify(value) {
  return cleanValue(value, "ebook").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "-").slice(0, 42);
}

function getFileNameFromResponse(response) {
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i);
  return match ? decodeURIComponent(match[1] || match[2]) : "";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateEbook();
});

templateButtons.forEach((button) => {
  button.addEventListener("click", () => setTemplate(button.dataset.template));
});

downloadButton.addEventListener("click", downloadCurrentEbook);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

currentEbook = normalizeEbook(sampleEbook);
renderPreview();
checkServer();
