export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    if (url.pathname !== "/calendar.ics") {
      return new Response("Not found", { status: 404 });
    }

    if (!env.CALENDAR_ICS_URL) {
      return new Response("CALENDAR_ICS_URL is not configured", { status: 500 });
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const upstream = await fetch(env.CALENDAR_ICS_URL, {
      headers: { "User-Agent": "Entomologie-Club-Calendar-Proxy/1.0" }
    });

    if (!upstream.ok) {
      return new Response(`Calendar upstream returned ${upstream.status}`, { status: 502 });
    }

    const response = new Response(await upstream.text(), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300"
      }
    });
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  }
};
