# Cloudflare 배포 메모

이 프로젝트는 로컬 개발용 `server.mjs`와 Cloudflare Pages 배포용 `functions/api/*`를 함께 둡니다.

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
OPENAI_MODEL=gpt-5.4
OPENAI_IMAGE_MODEL=gpt-image-1.5
ENABLE_IMAGE_GENERATION=true
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

`OPENAI_API_KEY`는 Git에 넣지 말고 Cloudflare 대시보드나 Wrangler secret으로 설정하세요.
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`은 Cloudflare 빌드에서 로컬 PDF용 Playwright 브라우저 바이너리를 내려받지 않게 하는 최적화 옵션입니다.

## 로컬 확인

```bash
npm run build:cloudflare
npm run dev:cloudflare
```

## 배포

Cloudflare Pages Git 연결을 쓰는 경우:

- Build command: `npm run build:cloudflare`
- Build output directory: `public`

Wrangler로 직접 배포하는 경우:

```bash
npx wrangler login
npx wrangler pages project create monograph-ai
npm run deploy:cloudflare
```
