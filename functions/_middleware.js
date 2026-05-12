const allowedOrigins = new Set([
  "https://monographai.co.kr",
  "https://www.monographai.co.kr",
  "https://psychemind.pages.dev",
]);

export async function onRequest(context) {
  const origin = context.request.headers.get("origin");
  const isAllowedOrigin = origin && allowedOrigins.has(origin);

  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(isAllowedOrigin ? origin : ""),
    });
  }

  const response = await context.next();
  if (isAllowedOrigin) {
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      response.headers.set(key, value);
    }
  }
  return response;
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Expose-Headers": "Content-Disposition",
    Vary: "Origin",
  };
}
