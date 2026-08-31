const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;
const MAX_BODY_BYTES = 1024 * 1024;

const ROUTE_FIXTURES = {
  "ca-rockies": {
    price: 6267,
    destination: "YVR",
    segments: [
      ["outbound", "PVG", "上海", "HKG", "香港", "19:05", "21:50", "CX365", 165],
      ["outbound", "HKG", "香港", "YVR", "温哥华", "00:45", "21:25", "CX888", 740, 1],
      ["domestic", "YVR", "温哥华", "YYC", "卡尔加里", "15:45", "18:05", "WS476", 80, 3],
      ["return", "YVR", "温哥华", "HKG", "香港", "14:10", "19:20", "CX819", 790],
      ["return", "HKG", "香港", "PVG", "上海", "21:05", "23:55", "CX362", 170, 1],
    ],
  },
  "ca-vancouver": {
    price: 6267,
    destination: "YVR",
    segments: [
      ["outbound", "PVG", "上海", "HKG", "香港", "19:05", "21:50", "CX365", 165],
      ["outbound", "HKG", "香港", "YVR", "温哥华", "00:45", "21:25", "CX888", 740, 1],
      ["return", "YVR", "温哥华", "HKG", "香港", "14:10", "19:20", "CX819", 790],
      ["return", "HKG", "香港", "PVG", "上海", "21:05", "23:55", "CX362", 170, 1],
    ],
  },
  "ca-east": {
    price: 8600,
    destination: "YYZ",
    segments: [
      ["outbound", "PVG", "上海", "ICN", "首尔", "11:10", "14:05", "KE898", 115],
      ["outbound", "ICN", "首尔", "YYZ", "多伦多", "18:20", "18:35", "KE073", 795],
      ["return", "YUL", "蒙特利尔", "ICN", "首尔", "12:10", "16:35", "KE074", 865],
      ["return", "ICN", "首尔", "PVG", "上海", "19:10", "20:25", "KE895", 135, 1],
    ],
  },
  "jp-kansai": {
    price: 2280,
    destination: "KIX",
    segments: [
      ["outbound", "PVG", "上海", "KIX", "大阪", "08:45", "12:05", "HO1333", 140],
      ["return", "KIX", "大阪", "PVG", "上海", "17:30", "19:15", "HO1338", 165],
    ],
  },
  "jp-kanto": {
    price: 3480,
    destination: "NRT",
    segments: [
      ["outbound", "PVG", "上海", "NRT", "东京", "09:05", "13:10", "NH920", 185],
      ["return", "HND", "东京", "PVG", "上海", "15:20", "17:35", "NH969", 195],
    ],
  },
  "jp-fuji-izu": {
    price: 3180,
    destination: "NRT",
    segments: [
      ["outbound", "PVG", "上海", "NRT", "东京", "09:05", "13:10", "NH920", 185],
      ["return", "HND", "东京", "PVG", "上海", "15:20", "17:35", "NH969", 195],
    ],
  },
};

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

const PUBLIC_FILES = new Set(["index.html", "styles.css", "app.js", "ui-fixes.css", "ui-fixes.js"]);

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(value));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("REQUEST_TOO_LARGE"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });
    request.on("error", reject);
  });
}

function validateSearch(body) {
  if (!body || body.origin !== "SHA") return "V2 当前仅支持上海出发。";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.departureDate || "")) return "出发日期格式无效。";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.returnDate || "")) return "返程日期格式无效。";
  if (!Number.isInteger(body.adults) || body.adults < 1 || body.adults > 8) return "成人数量需要在1到8之间。";
  if (!Array.isArray(body.routes) || body.routes.length < 1 || body.routes.length > 6) return "查询路线数量无效。";
  for (const route of body.routes) {
    const fixture = ROUTE_FIXTURES[route.routeId];
    if (!fixture || route.destination !== fixture.destination) return "查询路线不在当前支持范围内。";
  }
  return "";
}

function dateAt(date, time, dayOffset = 0) {
  const value = new Date(`${date}T${time}:00+08:00`);
  value.setUTCDate(value.getUTCDate() + dayOffset);
  return value.toISOString();
}

function buildFixtureQuote(route, body) {
  const fixture = ROUTE_FIXTURES[route.routeId];
  return {
    id: `demo-${route.routeId}`,
    routeId: route.routeId,
    providerId: "demo",
    providerDisplayName: "产品演示样例",
    price: fixture.price,
    currency: "CNY",
    priceCapturedAt: null,
    freshnessSeconds: null,
    canDeepLink: false,
    deepLinkUrl: null,
    verificationNote: "未接入平台实时价格接口，当前金额与航班仅用于验证产品交互。",
    isLive: false,
    segments: fixture.segments.map((segment, index) => {
      const [direction, depAirport, depCity, arrAirport, arrCity, depTime, arrTime, flightNumber, durationMinutes, offset = 0] = segment;
      const baseDate = direction === "return" ? body.returnDate : body.departureDate;
      return {
        id: `${route.routeId}-${index}`,
        direction,
        departureAirport: depAirport,
        departureCity: depCity,
        arrivalAirport: arrAirport,
        arrivalCity: arrCity,
        departureAt: dateAt(baseDate, depTime, offset),
        arrivalAt: dateAt(baseDate, arrTime, offset + (arrTime < depTime ? 1 : 0)),
        carrier: flightNumber.slice(0, 2),
        flightNumber,
        durationMinutes,
        cabin: "经济舱",
        baggage: "以预订页核验为准",
      };
    }),
  };
}

function md5(value) {
  return crypto.createHash("md5").update(value, "utf8").digest("hex");
}

function tongchengConfig() {
  const user = process.env.TONGCHENG_USER;
  const appKey = process.env.TONGCHENG_APP_KEY;
  const secretKey = process.env.TONGCHENG_SECRET_KEY;
  return user && appKey && secretKey ? { user, appKey, secretKey } : null;
}

function normalizeElongSegment(segment, direction, index) {
  const dep = segment.depPort || {};
  const arr = segment.arrPort || {};
  return {
    id: `${direction}-${segment.flightNo || index}-${index}`,
    direction,
    departureAirport: dep.code || "",
    departureCity: dep.cityNameCn || dep.nameCn || dep.code || "",
    arrivalAirport: arr.code || "",
    arrivalCity: arr.cityNameCn || arr.nameCn || arr.code || "",
    departureAt: segment.depTime,
    arrivalAt: segment.arrTime,
    carrier: segment.airCorp?.shortName || segment.airCorp?.code || "",
    flightNumber: segment.flightNo || "",
    durationMinutes: null,
    cabin: "经济舱",
    baggage: "请在同程预订页核验",
  };
}

function buildTongchengDeepLink(template, body, route) {
  if (!template) return null;
  const values = {
    origin: body.origin,
    destination: route.destination,
    departureDate: body.departureDate,
    returnDate: body.returnDate,
    adults: String(body.adults),
  };
  const deepLink = Object.entries(values).reduce(
    (url, [key, value]) => url.replaceAll(`{${key}}`, encodeURIComponent(value)),
    template,
  );
  return deepLink.startsWith("https://") ? deepLink : null;
}

async function searchTongcheng(body) {
  const config = tongchengConfig();
  if (!config) return { quotes: [], error: null };
  const endpoint = process.env.TONGCHENG_API_BASE || "https://api.elong.com/rest";
  const deepLinkTemplate = process.env.TONGCHENG_DEEP_LINK_TEMPLATE || "";
  const cache = new Map();
  const quotes = [];

  for (const route of body.routes) {
    const cacheKey = `${route.destination}:${body.departureDate}:${body.returnDate}:${body.adults}`;
    let journeys = cache.get(cacheKey);
    if (!journeys) {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const data = JSON.stringify({
        dep: body.origin,
        arr: route.destination,
        date: body.departureDate,
        classType: "Y",
        returnDate: body.returnDate,
        adultCount: body.adults,
        childCount: 0,
        version: "1.0.0",
      });
      const signature = md5(`${timestamp}${md5(`${data}${config.appKey}`)}${config.secretKey}`);
      const url = new URL(endpoint);
      url.searchParams.set("timestamp", timestamp);
      url.searchParams.set("format", "json");
      url.searchParams.set("method", "air.iflight.search");
      url.searchParams.set("signature", signature);
      url.searchParams.set("user", config.user);
      url.searchParams.set("data", data);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP_${response.status}`);
        const raw = await response.json();
        const payload = raw.Result || raw.result || raw;
        if (String(payload.code ?? payload.Code ?? "0") !== "0") throw new Error(payload.message || "PROVIDER_ERROR");
        journeys = payload.data || payload.Data || [];
        cache.set(cacheKey, journeys);
      } finally {
        clearTimeout(timeout);
      }
    }

    for (const [journeyIndex, journey] of journeys.entries()) {
      const products = journey.products || [];
      const product = products
        .map((item) => ({ item, total: Number(item.adultPrice?.price || 0) + Number(item.adultPrice?.tax || 0) }))
        .filter((item) => item.total > 0)
        .sort((a, b) => a.total - b.total)[0];
      if (!product) continue;
      const outbound = (journey.firstJourneyLeg?.segments || []).map((segment, index) =>
        normalizeElongSegment(segment, "outbound", index),
      );
      const inbound = (journey.returnJourneyLeg?.segments || []).map((segment, index) =>
        normalizeElongSegment(segment, "return", index),
      );
      const deepLinkUrl = buildTongchengDeepLink(deepLinkTemplate, body, route);
      quotes.push({
        id: `tongcheng-${route.routeId}-${journeyIndex}`,
        routeId: route.routeId,
        providerId: "tongcheng",
        providerDisplayName: "同程旅行",
        price: product.total,
        currency: "CNY",
        priceCapturedAt: new Date().toISOString(),
        freshnessSeconds: 0,
        canDeepLink: Boolean(deepLinkUrl),
        deepLinkUrl,
        verificationNote: deepLinkUrl
          ? "点击后前往同程官方合作页面核验，最终价格以预订页为准。"
          : "当前商务配置未提供行程级 H5 跳转模板，暂不能官网核验。",
        isLive: true,
        segments: [...outbound, ...inbound],
      });
    }
  }
  return { quotes, error: null };
}

function quotePriority(quote) {
  const freshnessTier = quote.isLive && quote.freshnessSeconds <= 900 ? 2 : quote.isLive ? 1 : 0;
  return { freshnessTier, verifiable: quote.canDeepLink ? 1 : 0, price: quote.price };
}

function compareQuotes(a, b) {
  const left = quotePriority(a);
  const right = quotePriority(b);
  return (
    right.freshnessTier - left.freshnessTier ||
    right.verifiable - left.verifiable ||
    left.price - right.price ||
    String(b.priceCapturedAt || "").localeCompare(String(a.priceCapturedAt || ""))
  );
}

function providerStatuses(tongchengResult) {
  const configured = Boolean(tongchengConfig());
  const tongchengError = tongchengResult.error;
  return [
    {
      id: "tongcheng",
      name: "同程旅行",
      status: tongchengError ? "ERROR" : configured ? "LIVE" : "REQUIRES_CREDENTIALS",
      detail: tongchengError
        ? `实时查询失败：${tongchengError}`
        : configured
          ? "已通过服务端商务账号调用国际机票搜索。"
          : "官方国际机票 API 可接入，需商务发放账号与密钥。",
    },
    { id: "ctrip", name: "携程", status: "REQUIRES_PARTNERSHIP", detail: "已公开平台偏商旅/供应侧，消费者机票比价需商务确认接口与深链。" },
    { id: "qunar", name: "去哪儿", status: "NOT_PUBLIC", detail: "暂未核实到公开的消费者国际机票实时搜索 API。" },
    { id: "meituan", name: "美团", status: "REQUIRES_PARTNERSHIP", detail: "开放平台采用合作申请制，暂未核实公开机票搜索接口。" },
    { id: "fliggy", name: "飞猪", status: "REQUIRES_PARTNERSHIP", detail: "官方机票能力需商家入驻及授权，公开文档以供给、订单接口为主。" },
  ];
}

async function handleFlightSearch(request, response) {
  let body;
  try {
    body = await readJson(request);
  } catch (error) {
    sendJson(response, error.message === "REQUEST_TOO_LARGE" ? 413 : 400, { error: { code: error.message } });
    return;
  }
  const validationError = validateSearch(body);
  if (validationError) {
    sendJson(response, 400, { error: { code: "INVALID_REQUEST", message: validationError } });
    return;
  }

  let tongchengResult;
  try {
    tongchengResult = await searchTongcheng(body);
  } catch (error) {
    tongchengResult = { quotes: [], error: error.name === "AbortError" ? "请求超时" : error.message };
  }
  const liveRouteIds = new Set(tongchengResult.quotes.map((quote) => quote.routeId));
  const fixtures = body.routes.filter((route) => !liveRouteIds.has(route.routeId)).map((route) => buildFixtureQuote(route, body));
  const quotes = [...tongchengResult.quotes, ...fixtures].sort(compareQuotes);
  sendJson(response, 200, {
    searchId: crypto.randomUUID(),
    requestedAt: new Date().toISOString(),
    mode: tongchengResult.quotes.length ? "LIVE_PARTIAL" : "DEMO",
    rankingPolicy: "优先15分钟内实时价，其次支持官网核验，再比较含税价。",
    providers: providerStatuses(tongchengResult),
    quotes,
  });
}

function serveStatic(request, response) {
  const requestPath = new URL(request.url, `http://${request.headers.host || HOST}`).pathname;
  const relativePath = requestPath === "/" ? "index.html" : decodeURIComponent(requestPath).replace(/^\/+/, "");
  const isPublicAsset = relativePath.startsWith("assets/") && !relativePath.includes("..") && !relativePath.includes("/.");
  if (!PUBLIC_FILES.has(relativePath) && !isPublicAsset) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  const filePath = path.resolve(ROOT, relativePath);
  if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  if ((request.method === "GET" || request.method === "HEAD") && request.url === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }
  if (request.method === "POST" && request.url === "/api/v1/flight-searches") {
    await handleFlightSearch(request, response);
    return;
  }
  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(request, response);
    return;
  }
  response.writeHead(405, { Allow: "GET, HEAD, POST" });
  response.end();
});

server.listen(PORT, HOST, () => {
  console.log(`假期最优解 V2 running at http://${HOST}:${PORT}`);
});
