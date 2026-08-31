const COPY_REPLACEMENTS = [
  ["V2.1 报价校准版", ""],
  ["先确定什么值得，再决定怎么买", "先确定什么值得，再决定怎么订"],
  ["用你查到的 OTA 价格修正排序", "录入你查到的平台价格"],
  ["录入 OTA 报价", "录入平台价格"],
  ["真实报价校准", "价格校准"],
  ["OTA 接入与报价状态", "平台报价状态"],
  ["OTA 官方预订页", "平台预订页"],
  ["OTA 商务账号", "平台实时价格接口"],
  ["OTA", "平台"],
  ["Agent 决策过程", "推荐逻辑"],
  ["AGENT 决策过程", "推荐逻辑"],
  ["实时报价", "实时价格"],
  ["非实时价格", "样例价格"],
  ["非实时报价", "样例价格"],
  ["DEMO 报价", "样例价格"],
  ["DEMO 样例报价", "样例价格"],
  ["演示交通价", "样例交通价"],
  ["手动报价", "录入价格"],
  ["决策链路", "推荐链路"],
  ["最终价格与行程以平台官方预订页核验为准。", "最终价格与行程以平台预订页核验为准。"],
];

function replaceCopy(value) {
  if (!value) return value;
  return COPY_REPLACEMENTS.reduce((text, [from, to]) => text.split(from).join(to), value);
}

function polishTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const next = replaceCopy(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  });
}

function polishAttributes(root) {
  root.querySelectorAll("[aria-label], [title], [placeholder]").forEach((element) => {
    ["aria-label", "title", "placeholder"].forEach((name) => {
      const value = element.getAttribute(name);
      const next = replaceCopy(value);
      if (next !== value) element.setAttribute(name, next);
    });
  });
}

function polishPage() {
  document.querySelector(".demo-status")?.remove();
  document.querySelector("footer")?.remove();
  const process = document.querySelector("#decision-process");
  if (process) {
    process.hidden = true;
    process.setAttribute("aria-hidden", "true");
    process.innerHTML = "";
  }
  polishTextNodes(document.body);
  polishAttributes(document.body);
}

let scheduled = false;
function schedulePolish() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    polishPage();
  });
}

window.addEventListener("DOMContentLoaded", polishPage);
new MutationObserver(schedulePolish).observe(document.documentElement, {
  childList: true,
  characterData: true,
  subtree: true,
});
