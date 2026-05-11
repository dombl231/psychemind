# Security Review

Date: 2026-05-11

## Executive Summary

The OpenAI API key is not exposed in browser-delivered JavaScript or static assets. The realistic attack path is not key theft from the frontend, but abuse of public API endpoints to spend OpenAI credits through the deployed service. The current patch adds request origin checks, body/input limits, output limits, security headers, optional Turnstile verification, basic IP rate limiting, and removes unnecessary model disclosure from public health responses.

## High Severity

### SEC-001: Public generation endpoints can be abused to spend OpenAI credits

- Location: `functions/api/generate-ebook.js:5`, `functions/api/generate-cover.js:5`
- Evidence: public POST endpoints proxy requests to OpenAI using server-side `OPENAI_API_KEY`.
- Impact: an attacker cannot read the key, but can automate same-service calls and burn credits.
- Fix applied: `requireSameOrigin(request)` now rejects browser cross-origin calls; generation input is size-limited and clamped; `max_output_tokens` limits response size; generation routes have basic IP rate limits; `TURNSTILE_SECRET_KEY` enables Cloudflare Turnstile verification.
- Residual risk: the code-level rate limit is an in-memory serverless-instance guard, not a full edge-wide quota. Before paid launch, add Cloudflare WAF rate limiting, payment entitlement checks, or account/session gating.

## Medium Severity

### SEC-002: Missing production security headers

- Location: `scripts/build-cloudflare.mjs:19`
- Evidence: previous `_headers` did not set CSP or frame protection.
- Impact: XSS or clickjacking bugs would have a larger blast radius.
- Fix applied: Cloudflare `_headers` now includes CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, referrer policy, and permissions policy.

### SEC-003: Unbounded request bodies in Cloudflare Functions

- Location: `functions/_lib/ebook-api.js:183`
- Evidence: request JSON was parsed without an explicit application limit.
- Impact: large requests could waste memory/CPU or amplify cost.
- Fix applied: `readJson()` now checks `content-length` and payload size.

## Low Severity

### SEC-004: Health endpoint disclosed model names

- Location: `functions/api/health.js:3`, `server.mjs:186`
- Evidence: health response included concrete model names.
- Impact: minor fingerprinting and operational detail disclosure.
- Fix applied: public health responses keep `hasOpenAIKey`, `imagesEnabled`, and runtime only.

## Verification

- `npm audit --omit=dev`: 0 vulnerabilities.
- Secret pattern scan: no literal OpenAI secret key pattern found in tracked source.
- Deployed cross-origin API test: `POST /api/generate-ebook` with `Origin: https://evil.example` returns `403`.
- Deployed headers confirmed: CSP, `X-Frame-Options: DENY`, and `nosniff` are present.
- Local build should create `public/config.js`; when `TURNSTILE_SITE_KEY` is set at build time, the frontend will send Turnstile tokens with generation requests.

## Recommended Next Steps

- Add Cloudflare WAF rate limiting for `/api/generate-ebook` and `/api/generate-cover`.
- Set Cloudflare Turnstile `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` before public paid launch.
- Add payment entitlement checks before allowing unlimited generation.
- Rotate the OpenAI API key if it was ever pasted into chat, logs, screenshots, or a non-ignored file.
- Replace the placeholder Git remote with a real private GitHub repository before pushing.
