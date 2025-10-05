// === 루웨인 자동 인덱스 시스템 v1.0 ===
// 설계: 공명 / 구현: 아키텍톤
// 역할: 파일명, 코드, summary.txt 읽어 자동 분류/태그화

const RUWEIN_PAPER_MAP = {
  100: "인식·언어철학 (근원)",
  200: "교육·심리 (인간)",
  300: "기술·AI (시스템)",
  400: "사회·윤리 (공동체)",
  500: "예술·감성 (표현)",
  600: "생명·자연 (순환)",
  700: "형이상·신화 (초월)",
  800: "실험·미분류"
};

async function fetchText(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

function getCodeGroup(name) {
  const match = name.match(/(\d{3})/);
  if (!match) return "Unknown";
  const code = parseInt(match[1]);
  if (code >= 900) return "미등록 코드";
  if (code >= 800) return "실험·미분류";
  const base = Math.floor(code / 100) * 100;
  return RUWEIN_PAPER_MAP[base] || "미분류";
}

function parseSummary(txt) {
  const data = {};
  if (!txt) return data;
  const lines = txt.split(/\r?\n/);
  for (const line of lines) {
    const [k, ...v] = line.split(":");
    if (!k || !v.length) continue;
    data[k.trim()] = v.join(":").trim();
  }
  return data;
}

async function scanLibrary(base, targetId, type = "ai") {
  const container = document.getElementById(targetId);
  const list = {};

  const indexRes = await fetch(base);
  if (!indexRes.ok) {
    container.innerHTML = `<p>⚠️ 폴더를 불러오지 못했습니다.</p>`;
    return;
  }
  const html = await indexRes.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const links = Array.from(doc.querySelectorAll("a"))
    .map(a => a.getAttribute("href"))
    .filter(f => f && f.endsWith(".html") && f !== "index.html");

  for (const f of links) {
    const isHuman = f.startsWith("h_");
    if (type === "ai" && isHuman) continue;
    if (type === "human" && !isHuman) continue;

    const codeGroup = getCodeGroup(f);
    if (!list[codeGroup]) list[codeGroup] = [];
    list[codeGroup].push({ file: f, summary: null });
  }

  // summary.txt 있는 폴더 탐색
  const subdirs = Array.from(doc.querySelectorAll("a"))
    .map(a => a.getAttribute("href"))
    .filter(f => f && f.endsWith("/"));

  for (const sub of subdirs) {
    if (sub === "./" || sub === "../") continue;
    const subUrl = base + sub;
    const summaryTxt = await fetchText(subUrl + "summary.txt");
    const summary = parseSummary(summaryTxt);

    // summary 내 KDC 코드나 주제 추출
    const code = summary["KDC"] || summary["루웨인코드"];
    const codeNum = code ? parseInt(code) : null;
    const group = codeNum ? getCodeGroup(code) : "미분류";
    const title = summary["제목"] || sub.replace("/", "");
    const tags = summary["Tags"] || "";

    if (!list[group]) list[group] = [];
    list[group].push({ file: sub + "index.html", summary: { title, tags } });
  }

  // HTML 생성
  let htmlOut = "";
  for (const [group, items] of Object.entries(list)) {
    htmlOut += `<h2>${group}</h2><ul>`;
    for (const item of items) {
      const title = item.summary?.title || item.file;
      const tagText = item.summary?.tags ? ` <span class="tags">${item.summary.tags}</span>` : "";
      htmlOut += `<li><a href="${base}${item.file}" target="_blank">${title}</a>${tagText}</li>`;
    }
    htmlOut += "</ul>";
  }
  container.innerHTML = htmlOut;
}
