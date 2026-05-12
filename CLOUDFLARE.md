# Cloudflare 배포 메모

이 프로젝트는 로컬 개발용 `server.mjs`와 Cloudflare Pages 배포용 `functions/api/*`를 함께 둡니다.

현재 GitHub 자동 배포용 Cloudflare Pages 프로젝트는 `psychemind`입니다.
이전 `monograph-ai` 프로젝트는 Direct Upload 방식으로 만들어진 배포본이며, Cloudflare 정책상 나중에 Git source를 붙일 수 없습니다.

## 배포 구조

- 정적 파일: `index.html`, `styles.css`, `script.js`
- Cloudflare 산출물: `public/`
- Cloudflare API: `functions/api/*`
- 로컬 서버: `server.mjs`

Cloudflare Workers/Pages Functions에서는 Playwright Chromium을 직접 실행할 수 없으므로, 배포 환경에서 `PDF` 옵션은 인쇄용 HTML 파일을 내려줍니다. 브라우저에서 열어 인쇄 메뉴의 PDF 저장을 사용하면 됩니다. 로컬 `server.mjs`에서는 기존처럼 Playwright PDF 렌더링을 유지합니다.

## 필요한 환경변수

Cloudflare Pages 프로젝트 설정의 Environment variables에 아래 값을 넣습니다.

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.5
OPENAI_IMAGE_MODEL=gpt-image-1.5
ENABLE_IMAGE_GENERATION=true
TURNSTILE_SITE_KEY=your_public_turnstile_site_key
TURNSTILE_SECRET_KEY=your_private_turnstile_secret_key
EBOOK_RATE_LIMIT=4
COVER_RATE_LIMIT=8
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

`OPENAI_API_KEY`는 Git에 넣지 말고 Cloudflare 대시보드나 Wrangler secret으로 설정하세요.
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`은 Cloudflare 빌드에서 로컬 PDF용 Playwright 브라우저 바이너리를 내려받지 않게 하는 최적화 옵션입니다.

`TURNSTILE_SECRET_KEY`를 설정하면 전자책/표지 생성 API가 Cloudflare Turnstile 검증을 요구합니다. 이때 빌드 환경에도 공개값인 `TURNSTILE_SITE_KEY`를 넣어 `public/config.js`에 반영되도록 해야 합니다. `EBOOK_RATE_LIMIT`와 `COVER_RATE_LIMIT`은 같은 IP에서 1시간 동안 허용할 생성 요청 수입니다. 이 제한은 서버리스 인스턴스별 메모리 기반의 보조 방어선이므로, 유료 공개 전에는 Cloudflare WAF rate limiting도 함께 설정하세요.

## 로컬 확인

```bash
npm run build:cloudflare
npm run dev:cloudflare
```

## 배포

Cloudflare Pages Git 연결을 쓰는 경우:

- Build command: `npm run build:cloudflare`
- Build output directory: `public`
- Production branch: `main`
- Project: `psychemind`

Wrangler로 직접 배포하는 경우:

```bash
npx wrangler login
npx wrangler pages project create psychemind
npm run deploy:cloudflare
```
