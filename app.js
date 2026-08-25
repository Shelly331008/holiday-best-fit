const DESTINATIONS = {
  canada: {
    label: "加拿大",
    combinations: 18,
    routes: [
      {
        id: "ca-rockies",
        searchDestination: "YVR",
        name: "加西山湖线",
        region: "温哥华 · 卡尔加里 · 班夫",
        route: "上海 → 温哥华 → 卡尔加里 / 班夫 → 上海",
        routeNodes: ["上海", "温哥华", "班夫"],
        fare: 6267,
        localTransport: 522,
        flightHours: 38,
        effectiveDays: 7.4,
        ease: 74,
        firstVisitFit: 96,
        interests: { nature: 100, city: 70, culture: 58, food: 62, shopping: 48 },
        tradeoff: "需增加一段加拿大境内航班及自驾，路线更丰富但衔接要求更高。",
      },
      {
        id: "ca-vancouver",
        searchDestination: "YVR",
        name: "温哥华深度线",
        region: "温哥华 · 惠斯勒 · 维多利亚",
        route: "上海 → 温哥华 → 惠斯勒 / 维多利亚 → 上海",
        routeNodes: ["上海", "温哥华", "惠斯勒"],
        fare: 6267,
        localTransport: 180,
        flightHours: 36,
        effectiveDays: 8.1,
        ease: 92,
        firstVisitFit: 82,
        interests: { nature: 84, city: 78, culture: 55, food: 76, shopping: 66 },
        tradeoff: "交通最轻松，但无法覆盖班夫与落基山核心景观。",
      },
      {
        id: "ca-east",
        searchDestination: "YYZ",
        name: "加东城市线",
        region: "多伦多 · 尼亚加拉 · 蒙特利尔",
        route: "上海 → 多伦多 → 尼亚加拉 / 蒙特利尔 → 上海",
        routeNodes: ["上海", "多伦多", "蒙特利尔"],
        fare: 8600,
        localTransport: 860,
        flightHours: 41,
        effectiveDays: 7.1,
        ease: 67,
        firstVisitFit: 90,
        interests: { nature: 62, city: 96, culture: 94, food: 86, shopping: 82 },
        tradeoff: "城市密度高且国际机票更贵，9天行程会比较紧凑。",
      },
    ],
  },
  japan: {
    label: "日本",
    combinations: 16,
    routes: [
      {
        id: "jp-kansai",
        searchDestination: "KIX",
        name: "关西经典线",
        region: "大阪 · 京都 · 奈良 · 宇治",
        route: "上海 → 大阪 → 京都 / 奈良 / 宇治 → 上海",
        routeNodes: ["上海", "大阪", "京都"],
        fare: 2280,
        localTransport: 520,
        flightHours: 6,
        effectiveDays: 7.8,
        ease: 90,
        firstVisitFit: 98,
        interests: { nature: 72, city: 86, culture: 100, food: 94, shopping: 78 },
        tradeoff: "热门日期京都住宿紧张，城市间移动较多但距离可控。",
      },
      {
        id: "jp-kanto",
        searchDestination: "NRT",
        name: "东京都会线",
        region: "东京 · 镰仓 · 横滨",
        route: "上海 → 东京 → 镰仓 / 横滨 → 上海",
        routeNodes: ["上海", "东京", "镰仓"],
        fare: 3480,
        localTransport: 320,
        flightHours: 6,
        effectiveDays: 8,
        ease: 88,
        firstVisitFit: 94,
        interests: { nature: 58, city: 100, culture: 82, food: 96, shopping: 100 },
        tradeoff: "体验丰富且交通便利，但当前国际机票价格高于关西。",
      },
      {
        id: "jp-fuji-izu",
        searchDestination: "NRT",
        name: "富士伊豆线",
        region: "东京 · 河口湖 · 伊豆",
        route: "上海 → 东京 → 河口湖 / 伊豆 → 上海",
        routeNodes: ["上海", "东京", "河口湖"],
        fare: 3180,
        localTransport: 680,
        flightHours: 6,
        effectiveDays: 7.2,
        ease: 76,
        firstVisitFit: 86,
        interests: { nature: 98, city: 70, culture: 72, food: 80, shopping: 66 },
        tradeoff: "更符合自然偏好，但天气会显著影响富士山观景体验。",
      },
    ],
  },
};

const PREFERENCE_LABELS = {
  nature: "自然风光",
  city: "城市漫游",
  culture: "人文历史",
  food: "当地美食",
  shopping: "购物体验",
};

const DEFAULTS = {
  country: "canada",
  startDate: "2026-09-25",
  endDate: "2026-10-08",
  duration: "9",
  leaveDays: "3",
  travelers: "2",
  firstVisit: true,
  preferences: ["nature", "culture"],
  tolerance: "3000",
};

const DEMO_FLIGHT_FIXTURES = {
  "ca-rockies": {
    price: 6267,
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
    segments: [
      ["outbound", "PVG", "上海", "HKG", "香港", "19:05", "21:50", "CX365", 165],
      ["outbound", "HKG", "香港", "YVR", "温哥华", "00:45", "21:25", "CX888", 740, 1],
      ["return", "YVR", "温哥华", "HKG", "香港", "14:10", "19:20", "CX819", 790],
      ["return", "HKG", "香港", "PVG", "上海", "21:05", "23:55", "CX362", 170, 1],
    ],
  },
  "ca-east": {
    price: 8600,
    segments: [
      ["outbound", "PVG", "上海", "ICN", "首尔", "11:10", "14:05", "KE898", 115],
      ["outbound", "ICN", "首尔", "YYZ", "多伦多", "18:20", "18:35", "KE073", 795],
      ["return", "YUL", "蒙特利尔", "ICN", "首尔", "12:10", "16:35", "KE074", 865],
      ["return", "ICN", "首尔", "PVG", "上海", "19:10", "20:25", "KE895", 135, 1],
    ],
  },
  "jp-kansai": {
    price: 2280,
    segments: [
      ["outbound", "PVG", "上海", "KIX", "大阪", "08:45", "12:05", "HO1333", 140],
      ["return", "KIX", "大阪", "PVG", "上海", "17:30", "19:15", "HO1338", 165],
    ],
  },
  "jp-kanto": {
    price: 3480,
    segments: [
      ["outbound", "PVG", "上海", "NRT", "东京", "09:05", "13:10", "NH920", 185],
      ["return", "HND", "东京", "PVG", "上海", "15:20", "17:35", "NH969", 195],
    ],
  },
  "jp-fuji-izu": {
    price: 3180,
    segments: [
      ["outbound", "PVG", "上海", "NRT", "东京", "09:05", "13:10", "NH920", 185],
      ["return", "HND", "东京", "PVG", "上海", "15:20", "17:35", "NH969", 195],
    ],
  },
};

const form = document.querySelector("#planner-form");
const countryInput = document.querySelector("#country");
const toleranceInput = document.querySelector("#tolerance");
const toleranceOutput = document.querySelector("#tolerance-output");
const resultGrid = document.querySelector("#result-grid");
const resultTitle = document.querySelector("#results-title");
const resultSummary = document.querySelector("#result-summary");
const decisionRoute = document.querySelector("#decision-route");
const decisionCallout = document.querySelector("#decision-callout");
const providerStatus = document.querySelector("#provider-status");
const formError = document.querySelector("#form-error");
const toast = document.querySelector("#toast");

let currentResult = null;
let toastTimer = null;
let activeSearch = 0;

function formatCurrency(value) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateTimeAt(date, time, dayOffset = 0) {
  const value = new Date(`${date}T${time}:00+08:00`);
  value.setUTCDate(value.getUTCDate() + dayOffset);
  return value.toISOString();
}

function formatShortDate(date) {
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}

function formatDateTime(value) {
  if (!value) return "时间待核验";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatCapturedAt(value) {
  if (!value) return "非实时样例";
  const date = new Date(value);
  return `抓价 ${new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getPreferences() {
  return [...form.querySelectorAll('input[name="preference"]:checked')].map((input) => input.value);
}

function getFormState() {
  return {
    country: countryInput.value,
    startDate: document.querySelector("#start-date").value,
    endDate: document.querySelector("#end-date").value,
    duration: Number(document.querySelector("#duration").value),
    leaveDays: Number(document.querySelector("#leave-days").value),
    travelers: Number(document.querySelector("#travelers").value),
    firstVisit: document.querySelector("#first-visit").checked,
    preferences: getPreferences(),
    tolerance: Number(toleranceInput.value),
  };
}

function validateState(state) {
  if (!state.startDate || !state.endDate) return "请选择完整的可出发日期范围。";
  if (parseDate(state.endDate) <= parseDate(state.startDate)) return "最晚返程日期需要晚于最早出发日期。";

  const windowDays = Math.floor((parseDate(state.endDate) - parseDate(state.startDate)) / 86400000) + 1;
  if (windowDays < state.duration) return `当前日期窗口只有 ${windowDays} 天，请缩短旅行天数或放宽日期范围。`;
  if (state.preferences.length === 0) return "至少选择一项旅行偏好，推荐才有判断依据。";
  if (state.travelers < 1 || state.travelers > 8) return "同行人数需要在1到8人之间。";
  return "";
}

function scoreRoute(route, state, minPrice, maxPrice) {
  const perPerson = route.fare + route.localTransport;
  const preferenceScore =
    state.preferences.reduce((sum, preference) => sum + route.interests[preference], 0) / state.preferences.length;
  const priceRange = Math.max(1, maxPrice - minPrice);
  const valueScore = 100 - ((perPerson - minPrice) / priceRange) * 100;
  const priceOverTolerance = Math.max(0, perPerson - minPrice - state.tolerance);
  const thresholdPenalty = Math.min(30, priceOverTolerance / 85);
  const firstVisitScore = state.firstVisit ? route.firstVisitFit : 82;
  const overall =
    preferenceScore * 0.5 + route.ease * 0.18 + valueScore * 0.16 + firstVisitScore * 0.16 - thresholdPenalty;

  return {
    ...route,
    perPerson,
    totalPrice: perPerson * state.travelers,
    preferenceScore: Math.round(preferenceScore),
    overall: Math.round(overall),
    priceDifference: perPerson - minPrice,
  };
}

function buildReason(route, state, cheapest) {
  const topPreferences = state.preferences
    .slice()
    .sort((a, b) => route.interests[b] - route.interests[a])
    .slice(0, 2)
    .map((key) => PREFERENCE_LABELS[key])
    .join("和");
  const diff = route.perPerson - cheapest.perPerson;

  if (diff === 0) {
    return `在当前候选中人均交通成本最低，同时对${topPreferences}的匹配度为 ${route.preferenceScore} 分。`;
  }
  if (diff <= state.tolerance) {
    return `比最低价人均高 ${formatCurrency(diff)}，仍在你的容忍范围内；${topPreferences}匹配度更高。`;
  }
  return `比最低价人均高 ${formatCurrency(diff)}，超过你的容忍线；仅在你明确偏爱${topPreferences}时值得保留。`;
}

function getBadges(route, ranked) {
  const badges = [];
  const cheapest = ranked.reduce((best, item) => (item.perPerson < best.perPerson ? item : best));
  const easiest = ranked.reduce((best, item) => (item.ease > best.ease ? item : best));
  const bestPreference = ranked.reduce((best, item) => (item.preferenceScore > best.preferenceScore ? item : best));

  if (route.id === ranked[0].id) badges.push("综合最推荐");
  if (route.id === cheapest.id) badges.push("最省预算");
  if (route.id === easiest.id) badges.push("最少折腾");
  if (route.id === bestPreference.id) badges.push("兴趣最匹配");
  return badges;
}

function renderRouteBar(route) {
  const nodes = route.routeNodes;
  decisionRoute.innerHTML = `
    <strong>${nodes[0]}</strong>
    <span aria-hidden="true"></span>
    <strong>${nodes[1]}</strong>
    <span aria-hidden="true"></span>
    <strong>${nodes[2]}</strong>
  `;
}

function renderCallout(top, cheapest, state, destination, searchData) {
  const diff = top.perPerson - cheapest.perPerson;
  const priceType = top.selectedQuote?.isLive ? "实时交通价" : "演示交通价";
  let title = "偏好与价格共同支持这个选择";
  let detail = `${top.name}与当前兴趣匹配度最高，同时没有触发明显的价格牺牲。`;

  if (top.id === cheapest.id) {
    title = "最适合你的方案也是当前最低价";
    detail = `${top.name}兼顾兴趣和预算，人均${priceType}约 ${formatCurrency(top.perPerson)}。`;
  } else if (diff <= state.tolerance) {
    title = "兴趣优先，差价仍在容忍范围内";
    detail = `${top.name}比最低价人均高 ${formatCurrency(diff)}，两人合计多 ${formatCurrency(
      diff * state.travelers,
    )}，未超过你设置的人均 ${formatCurrency(state.tolerance)} 容忍线。`;
  } else {
    title = "价格已经改变推荐排序";
    detail = `更匹配兴趣的方案比最低价人均高 ${formatCurrency(diff)}，超过当前容忍线，系统优先保留性价比。`;
  }

  const scope = searchData?.mode === "DEMO" ? `${destination.routes.length} 条路线样例` : `${destination.routes.length} 条路线实时结果`;
  decisionCallout.innerHTML = `<strong>${title}</strong><span>${detail} 本次已比较 ${scope}。</span>`;
}

function journeySummary(segments, direction) {
  const matched = segments.filter((segment) => segment.direction === direction);
  if (!matched.length) return "暂无对应航段";
  const first = matched[0];
  const last = matched[matched.length - 1];
  const stopText = matched.length === 1 ? "直飞" : `中转 ${matched.length - 1} 次`;
  return `${formatDateTime(first.departureAt)} · ${escapeHtml(first.departureCity)} ${escapeHtml(
    first.departureAirport,
  )} → ${escapeHtml(last.arrivalCity)} ${escapeHtml(last.arrivalAirport)} · ${stopText}`;
}

function renderSegment(segment) {
  return `
    <div class="flight-leg">
      <div class="flight-time"><strong>${formatDateTime(segment.departureAt)}</strong><span>${escapeHtml(
        segment.departureCity,
      )} ${escapeHtml(segment.departureAirport)}</span></div>
      <div class="flight-line"><span>${escapeHtml(segment.flightNumber || segment.carrier || "航班待核验")}</span></div>
      <div class="flight-time arrival"><strong>${formatDateTime(segment.arrivalAt)}</strong><span>${escapeHtml(
        segment.arrivalCity,
      )} ${escapeHtml(segment.arrivalAirport)}</span></div>
    </div>
  `;
}

function renderItinerary(quote) {
  const segments = quote?.segments || [];
  const outbound = journeySummary(segments, "outbound");
  const inbound = journeySummary(segments, "return");
  const domestic = segments.filter((segment) => segment.direction === "domestic");
  const allLegs = segments.map(renderSegment).join("");
  return `
    <details class="flight-itinerary">
      <summary>
        <span class="itinerary-title">关键机票组合 <small>展开航段</small></span>
        <span class="journey-summary"><b>去</b>${outbound}</span>
        <span class="journey-summary"><b>返</b>${inbound}</span>
        ${domestic.length ? `<span class="journey-summary"><b>境内</b>${journeySummary(segments, "domestic")}</span>` : ""}
      </summary>
      <div class="flight-legs">${allLegs || '<p class="empty-itinerary">暂无可展示航段</p>'}</div>
    </details>
  `;
}

function renderQuoteSource(route) {
  const quote = route.selectedQuote;
  if (!quote) return "";
  const liveClass = quote.isLive ? "is-live" : "is-demo";
  const sourceLabel = quote.isLive ? "实时含税价" : "非实时报价";
  const verificationAction = quote.canDeepLink
    ? `<a class="verify-link" href="${escapeHtml(quote.deepLinkUrl)}" target="_blank" rel="noopener noreferrer">官网核验</a>`
    : `<button class="verify-link is-disabled" type="button" disabled title="${escapeHtml(
        quote.verificationNote,
      )}">暂不可核验</button>`;
  const alternatives = (route.quotes || [])
    .slice(1, 3)
    .map(
      (item) =>
        `<span>${escapeHtml(item.providerDisplayName)} ${formatCurrency(item.price)}${item.canDeepLink ? " · 可核验" : ""}</span>`,
    )
    .join("");
  return `
    <div class="quote-source ${liveClass}">
      <div>
        <span class="quote-status">${sourceLabel}</span>
        <strong>${escapeHtml(quote.providerDisplayName)}</strong>
        <small>${formatCapturedAt(quote.priceCapturedAt)}</small>
      </div>
      ${verificationAction}
    </div>
    ${alternatives ? `<div class="alternate-quotes"><strong>其他报价</strong>${alternatives}</div>` : ""}
    <p class="verification-note">${escapeHtml(quote.verificationNote)}</p>
  `;
}

function renderCard(route, ranked, state, index, dates) {
  const badges = getBadges(route, ranked);
  const cheapest = ranked.reduce((best, item) => (item.perPerson < best.perPerson ? item : best));
  const effectiveDays = Math.max(4, Math.min(route.effectiveDays, state.duration - 1.2)).toFixed(1);
  const badgeMarkup = badges.map((badge) => `<span class="plan-badge">${badge}</span>`).join("");
  const priceLabel = route.selectedQuote?.isLive ? "人均实时交通价" : "人均演示交通价";

  return `
    <article class="plan-card ${index === 0 ? "is-top" : ""}" data-plan-id="${route.id}">
      <div class="plan-card-header">
        <div class="plan-badges">${badgeMarkup}</div>
        <h3 class="plan-title">${route.name}</h3>
        <p class="plan-region">${route.region}</p>
        <div class="plan-price">
          <strong>${formatCurrency(route.perPerson)}</strong>
          <span>${priceLabel}<br />${state.travelers}人合计 ${formatCurrency(route.totalPrice)}</span>
        </div>
      </div>
      <p class="plan-route">${route.route}</p>
      ${renderItinerary(route.selectedQuote)}
      ${renderQuoteSource(route)}
      <div class="metric-grid">
        <div class="metric"><span>建议日期</span><strong>${dates}</strong></div>
        <div class="metric"><span>请假上限</span><strong>${state.leaveDays} 天</strong></div>
        <div class="metric"><span>交通耗时</span><strong>约 ${route.flightHours} 小时</strong></div>
        <div class="metric"><span>有效游玩</span><strong>约 ${effectiveDays} 天</strong></div>
      </div>
      <p class="plan-reason"><strong>为什么推荐：</strong>${buildReason(route, state, cheapest)}</p>
      <p class="plan-tradeoff"><strong>需要接受：</strong>${route.tradeoff}</p>
      <p class="plan-meta">国际机票 ${formatCurrency(route.fare)} + 必要境内交通估算 ${formatCurrency(
        route.localTransport,
      )}</p>
      <div class="plan-actions">
        <button class="plan-action primary" type="button" data-select-plan="${route.id}">选择此方案</button>
        <button class="plan-action" type="button" data-copy-plan="${route.id}">复制摘要</button>
      </div>
    </article>
  `;
}

function renderProviderStatus(searchData) {
  const modeText = searchData.mode === "DEMO" ? "当前为演示降级" : "已获取部分实时报价";
  providerStatus.innerHTML = `
    <div class="provider-status-heading">
      <div><strong>${modeText}</strong><span>${escapeHtml(searchData.rankingPolicy)}</span></div>
      <span class="search-id">查询 ${escapeHtml(searchData.searchId.slice(0, 8))}</span>
    </div>
    <div class="provider-list">
      ${searchData.providers
        .map(
          (provider) => `
            <details class="provider-item" data-status="${escapeHtml(provider.status)}">
              <summary><span class="provider-dot" aria-hidden="true"></span><strong>${escapeHtml(
                provider.name,
              )}</strong><small>${provider.status === "LIVE" ? "已接入" : "待接入"}</small></summary>
              <p>${escapeHtml(provider.detail)}</p>
            </details>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderLoading(state) {
  const destination = DESTINATIONS[state.country];
  resultTitle.textContent = `上海 → ${destination.label}`;
  resultSummary.textContent = "正在查询 OTA 接入状态与可用报价…";
  providerStatus.innerHTML = '<div class="provider-loading"><span></span>查询服务端报价</div>';
  resultGrid.innerHTML = Array.from({ length: 3 }, () => '<div class="plan-skeleton" aria-hidden="true"></div>').join("");
}

async function fetchFlightQuotes(state) {
  const destination = DESTINATIONS[state.country];
  const departureDate = state.startDate;
  const returnDate = addDays(parseDate(departureDate), state.duration - 1).toISOString().slice(0, 10);
  const response = await fetch("/api/v1/flight-searches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin: "SHA",
      departureDate,
      returnDate,
      adults: state.travelers,
      routes: destination.routes.map((route) => ({ routeId: route.id, destination: route.searchDestination })),
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || "报价服务暂不可用");
  return payload;
}

function buildLocalDemoQuote(route, state, returnDate) {
  const fixture = DEMO_FLIGHT_FIXTURES[route.id];
  return {
    id: `local-demo-${route.id}`,
    routeId: route.id,
    providerId: "local-demo",
    providerDisplayName: "本地演示样例",
    price: fixture.price,
    currency: "CNY",
    priceCapturedAt: null,
    freshnessSeconds: null,
    canDeepLink: false,
    deepLinkUrl: null,
    verificationNote: "本地 API 未连接，当前金额与航班仅用于验证产品交互。",
    isLive: false,
    segments: fixture.segments.map((segment, index) => {
      const [direction, depAirport, depCity, arrAirport, arrCity, depTime, arrTime, flightNumber, durationMinutes, offset = 0] = segment;
      const baseDate = direction === "return" ? returnDate : state.startDate;
      return {
        id: `${route.id}-${index}`,
        direction,
        departureAirport: depAirport,
        departureCity: depCity,
        arrivalAirport: arrAirport,
        arrivalCity: arrCity,
        departureAt: dateTimeAt(baseDate, depTime, offset),
        arrivalAt: dateTimeAt(baseDate, arrTime, offset + (arrTime < depTime ? 1 : 0)),
        carrier: flightNumber.slice(0, 2),
        flightNumber,
        durationMinutes,
        cabin: "经济舱",
        baggage: "以预订页核验为准",
      };
    }),
  };
}

function buildLocalDemoSearchData(state, reason) {
  const destination = DESTINATIONS[state.country];
  const returnDate = addDays(parseDate(state.startDate), state.duration - 1).toISOString().slice(0, 10);
  return {
    searchId: `local-${Date.now().toString(36)}`,
    requestedAt: new Date().toISOString(),
    mode: "DEMO",
    rankingPolicy: "本地演示模式：展示产品决策链路，不代表 OTA 实时报价。",
    providers: [
      { id: "local-demo", name: "本地演示", status: "DEMO", detail: `已使用内置样例恢复展示。原因：${reason}` },
      { id: "tongcheng", name: "同程旅行", status: "OFFLINE", detail: "本地报价 API 未连接或未启动，暂未调用实时接口。" },
      { id: "ctrip", name: "携程", status: "OFFLINE", detail: "本地报价 API 未连接，暂未调用平台接口。" },
      { id: "qunar", name: "去哪儿", status: "OFFLINE", detail: "本地报价 API 未连接，暂未调用平台接口。" },
      { id: "meituan", name: "美团", status: "OFFLINE", detail: "本地报价 API 未连接，暂未调用平台接口。" },
      { id: "fliggy", name: "飞猪", status: "OFFLINE", detail: "本地报价 API 未连接，暂未调用平台接口。" },
    ],
    quotes: destination.routes.map((route) => buildLocalDemoQuote(route, state, returnDate)),
  };
}

function renderResults(state, searchData) {
  const destination = DESTINATIONS[state.country];
  const routes = destination.routes.map((route) => {
    const quotes = searchData.quotes.filter((quote) => quote.routeId === route.id);
    const selectedQuote = quotes[0] || null;
    return { ...route, fare: selectedQuote?.price || route.fare, selectedQuote, quotes };
  });
  const prices = routes.map((route) => route.fare + route.localTransport);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const ranked = routes
    .map((route) => scoreRoute(route, state, minPrice, maxPrice))
    .sort((a, b) => b.overall - a.overall);

  const dateStart = parseDate(state.startDate);
  const displayEnd = addDays(dateStart, state.duration - 1);
  const dates = `${formatShortDate(dateStart)} - ${formatShortDate(displayEnd)}`;
  const preferenceText = state.preferences.map((key) => PREFERENCE_LABELS[key]).join("、");

  resultTitle.textContent = `上海 → ${destination.label}`;
  resultSummary.textContent = `${state.duration}天 · ${state.travelers}人 · 偏好${preferenceText} · 人均容忍差价 ${formatCurrency(
    state.tolerance,
  )}`;
  renderRouteBar(ranked[0]);
  const cheapest = ranked.reduce((best, item) => (item.perPerson < best.perPerson ? item : best));
  renderCallout(ranked[0], cheapest, state, destination, searchData);
  renderProviderStatus(searchData);
  resultGrid.innerHTML = ranked.map((route, index) => renderCard(route, ranked, state, index, dates)).join("");

  currentResult = { state, destination, ranked, dates, searchData };
  saveState(state);
}

async function runSearch(state, { scroll = false } = {}) {
  const searchNumber = ++activeSearch;
  renderLoading(state);
  try {
    const searchData = await fetchFlightQuotes(state);
    if (searchNumber !== activeSearch) return;
    renderResults(state, searchData);
    if (scroll && window.innerWidth < 861) resultTitle.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    if (searchNumber !== activeSearch) return;
    renderResults(state, buildLocalDemoSearchData(state, error.message));
  }
}

function saveState(state) {
  try {
    localStorage.setItem("holiday-best-fit-state", JSON.stringify(state));
  } catch {
    // The product still works when storage is unavailable.
  }
}

function loadState() {
  try {
    const stored = localStorage.getItem("holiday-best-fit-state");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function applyState(state) {
  const normalized = { ...DEFAULTS, ...state };
  countryInput.value = normalized.country;
  document.querySelectorAll("[data-country]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.country === normalized.country);
  });
  document.querySelector("#start-date").value = normalized.startDate;
  document.querySelector("#end-date").value = normalized.endDate;
  document.querySelector("#duration").value = String(normalized.duration);
  document.querySelector("#leave-days").value = String(normalized.leaveDays);
  document.querySelector("#travelers").value = String(normalized.travelers);
  document.querySelector("#first-visit").checked = Boolean(normalized.firstVisit);
  toleranceInput.value = String(normalized.tolerance);
  updateToleranceOutput();
  form.querySelectorAll('input[name="preference"]').forEach((input) => {
    input.checked = normalized.preferences.includes(input.value);
  });
}

function updateToleranceOutput() {
  toleranceOutput.textContent = `人均 ${formatCurrency(Number(toleranceInput.value))}`;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function buildPlanText(route) {
  if (!currentResult) return "";
  const quote = route.selectedQuote;
  const priceType = quote?.isLive ? "实时交通价" : "演示交通价";
  const source = quote ? `${quote.providerDisplayName}（${formatCapturedAt(quote.priceCapturedAt)}）` : "暂无来源";
  return `假期最优解｜${route.name}\n${route.route}\n日期：${currentResult.dates}\n人均${priceType}：${formatCurrency(
    route.perPerson,
  )}\n报价来源：${source}\n同行总价：${formatCurrency(route.totalPrice)}\n推荐理由：${buildReason(
    route,
    currentResult.state,
    currentResult.ranked.reduce((best, item) => (item.perPerson < best.perPerson ? item : best)),
  )}\n提示：最终价格与行程以 OTA 官方预订页核验为准。`;
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast(successMessage);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const state = getFormState();
  const error = validateState(state);
  formError.hidden = !error;
  formError.textContent = error;
  if (error) return;

  await runSearch(state, { scroll: true });
});

document.querySelectorAll("[data-country]").forEach((button) => {
  button.addEventListener("click", () => {
    countryInput.value = button.dataset.country;
    document.querySelectorAll("[data-country]").forEach((item) => item.classList.toggle("is-active", item === button));
  });
});

document.querySelectorAll("[data-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.querySelector("#travelers");
    const direction = button.dataset.step === "up" ? 1 : -1;
    input.value = String(Math.min(8, Math.max(1, Number(input.value) + direction)));
  });
});

toleranceInput.addEventListener("input", updateToleranceOutput);

document.querySelector("#reset-form").addEventListener("click", async () => {
  applyState(DEFAULTS);
  await runSearch(getFormState());
  showToast("已恢复默认条件");
});

resultGrid.addEventListener("click", (event) => {
  const selectButton = event.target.closest("[data-select-plan]");
  const copyButton = event.target.closest("[data-copy-plan]");
  const planId = selectButton?.dataset.selectPlan || copyButton?.dataset.copyPlan;
  if (!planId || !currentResult) return;

  const route = currentResult.ranked.find((item) => item.id === planId);
  if (!route) return;

  if (selectButton) {
    resultGrid.querySelectorAll(".plan-card").forEach((card) => card.classList.remove("is-selected"));
    selectButton.closest(".plan-card").classList.add("is-selected");
    selectButton.textContent = "已选择";
    showToast(`已选择${route.name}`);
  } else {
    copyText(buildPlanText(route), "方案摘要已复制");
  }
});

document.querySelector("#share-result").addEventListener("click", async () => {
  if (!currentResult) return;
  const top = currentResult.ranked[0];
  const text = buildPlanText(top);
  if (navigator.share) {
    try {
      await navigator.share({ title: `假期最优解｜${top.name}`, text });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  copyText(text, "推荐结果已复制，可直接分享");
});

const initialState = loadState() || DEFAULTS;
applyState(initialState);
const initialError = validateState(getFormState());
if (initialError) {
  applyState(DEFAULTS);
}
runSearch(getFormState());
