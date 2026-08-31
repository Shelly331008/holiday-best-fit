const { chromium } = require("playwright");
const fs = require("node:fs");

const baseUrl = "http://127.0.0.1:4173";
const artifactsDir = "artifacts";

async function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  fs.mkdirSync(artifactsDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const browserMessages = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) browserMessages.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserMessages.push(`pageerror: ${error.message}`));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator(".hero-image").evaluate((image) => image.complete && image.naturalWidth > 0);
  await assert((await page.locator("h1").textContent()).includes("假期有限"), "Hero title did not render");
  await assert((await page.locator(".plan-card").count()) === 3, "Expected three Canada plans");
  await assert((await page.locator("#results-title").textContent()).includes("加拿大"), "Default country should be Canada");
  await assert((await page.locator(".provider-item").count()) === 5, "Expected five OTA integration statuses");
  await assert((await page.locator(".quote-source").count()) === 3, "Each plan should show a quote source");
  await assert((await page.locator(".flight-itinerary").count()) === 3, "Each plan should show a flight itinerary");
  await assert((await page.locator(".decision-process").textContent()).includes("从约束到推荐"), "Decision process should render");
  await assert((await page.locator(".threshold-meter").count()) === 3, "Each plan should show a price threshold meter");
  await assert((await page.locator(".journey-summary").count()) >= 6, "Outbound and return summaries should be visible");
  await page.locator(".flight-itinerary").first().click();
  await assert(await page.locator(".flight-itinerary").first().evaluate((details) => details.open), "Itinerary should expand");
  await assert((await page.locator(".flight-leg").first().count()) === 1, "Expanded itinerary should show flight legs");

  await page.locator("#toggle-calibrator").click();
  await assert(!(await page.locator("#manual-quote-form").isHidden()), "Manual quote form should expand");
  await page.locator("#manual-route").selectOption("ca-east");
  await page.locator("#manual-provider").selectOption("去哪儿");
  await page.locator("#manual-price").fill("5900");
  await page.locator("#manual-captured-at").fill("2026-08-31T14:20");
  await page.locator("#manual-deep-link").fill("https://example.com/verify");
  await page.locator("#manual-note").fill("含税价格，截图已人工核验");
  await page.locator("#manual-quote-form").evaluate((form) => form.requestSubmit());
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(250);
  await assert((await page.locator(".quote-source.is-manual").count()) === 1, "Manual quote should be shown as an active source");
  await assert((await page.locator(".manual-quote-list").textContent()).includes("加东城市线"), "Manual quote list should show the edited route");
  await assert(
    (await page.locator(".decision-process").textContent()).includes("手动报价校准"),
    "Decision process should mention manual calibration",
  );
  await page.locator("#clear-manual-route").click();
  await page.waitForTimeout(250);
  await assert((await page.locator(".quote-source.is-manual").count()) === 0, "Clearing manual quote should restore demo source");

  const apiResponse = await page.request.post(`${baseUrl}/api/v1/flight-searches`, {
    data: {
      origin: "SHA",
      departureDate: "2026-09-25",
      returnDate: "2026-10-03",
      adults: 2,
      routes: [{ routeId: "ca-vancouver", destination: "YVR" }],
    },
  });
  await assert(apiResponse.ok(), "Flight search API should return 200");
  const apiPayload = await apiResponse.json();
  await assert(apiPayload.quotes.length >= 1, "Flight search API should return a quote or demo fallback");
  await assert(apiPayload.quotes[0].providerDisplayName, "Quote should expose its provider");
  await assert(Array.isArray(apiPayload.quotes[0].segments), "Quote should expose normalized segments");

  await page.screenshot({ path: `${artifactsDir}/desktop-canada.png`, fullPage: true });

  await page.locator('[data-country="japan"]').click();
  await page.locator('input[value="nature"]').uncheck();
  await page.locator('input[value="culture"]').uncheck();
  await page.locator('input[value="city"]').check();
  await page.locator('input[value="food"]').check();
  await page.locator("#planner-form").evaluate((form) => form.requestSubmit());
  await page.waitForTimeout(250);
  await assert((await page.locator("#results-title").textContent()).includes("日本"), "Country switch did not update results");
  await assert((await page.locator(".plan-card").count()) === 3, "Expected three Japan plans");
  await assert((await page.locator(".plan-title").first().textContent()).length > 0, "Japan ranking is empty");

  await page.locator("[data-select-plan]").first().click();
  await assert((await page.locator("[data-select-plan]").first().textContent()) === "已选择", "Plan selection failed");
  await page.screenshot({ path: `${artifactsDir}/desktop-japan.png`, fullPage: true });

  const unnamedButtons = await page.locator("button").evaluateAll((buttons) =>
    buttons.filter((button) => !(button.textContent || "").trim() && !button.getAttribute("aria-label")).length,
  );
  await assert(unnamedButtons === 0, "Found buttons without accessible names");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await assert((await page.locator(".plan-card").count()) === 3, "Mobile result cards did not render");
  const hasBodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  await assert(!hasBodyOverflow, "Mobile page has unintended horizontal body overflow");
  await page.screenshot({ path: `${artifactsDir}/mobile.png`, fullPage: true });

  await assert(browserMessages.length === 0, `Browser console was not clean:\n${browserMessages.join("\n")}`);

  const fallbackPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await fallbackPage.route("**/api/v1/flight-searches", (route) => route.abort());
  await fallbackPage.goto(baseUrl, { waitUntil: "networkidle" });
  await assert((await fallbackPage.locator(".plan-card").count()) === 3, "API outage should fall back to local demo cards");
  await assert(
    (await fallbackPage.locator(".quote-source").first().textContent()).includes("本地演示样例"),
    "Fallback cards should label local demo pricing",
  );
  await fallbackPage.close();

  const filePage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await filePage.goto(`file://${process.cwd()}/index.html`, { waitUntil: "networkidle" });
  await assert((await filePage.locator(".plan-card").count()) === 3, "Local file demo should render cards without a server");
  await assert(
    (await filePage.locator(".quote-source").first().textContent()).includes("本地演示样例"),
    "Local file demo should label local demo pricing",
  );
  await filePage.close();

  await browser.close();
  console.log(
    "Smoke test passed: OTA API contract, provider/source display, expandable itinerary, desktop Canada/Japan, selection, mobile layout, API-outage demo fallback, local-file demo fallback, accessibility names, clean console.",
  );
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
