# -*- coding: utf-8 -*-
# 위치 아무 데 OK. 권장: lovelang.github.io/language_of_love/Resonant_Linguistics/
# 실행:  python make_book.py
#
# 자동 수행:
#  1) .docx 원고 자동 탐색(현재 폴더 → 상위로 .git 찾은 뒤 저장소 전체 스캔; goods/library 등 포함)
#  2) 본문 추출 → 장/부/로마숫자/영문 Chapter/괄호번호/에필로그 자동 분할
#  3) ch1~chN.xhtml + epilogue.xhtml + index.xhtml + glossary/references/appendix + stylesheet.css 생성
#  4) images/cover.png 있으면 표지 자동 표시
#  5) 전부 UTF-8로 저장(글자 깨짐 방지)

import os, re, html, zipfile, time

# ---------------- 기본 설정 ----------------
OUT_DIR = "."
IMG_DIR = os.path.join(OUT_DIR, "images")
CSS_NAME = "stylesheet.css"

# 우선순위 높은 키워드 (파일명에 포함되면 가산점)
PREFERRED_KEYWORDS = ["감응", "언어", "숨", "루웨인", "Resonant", "Linguistics", "h_"]

# ---------------- 유틸 ----------------
def find_repo_root(start):
    cur = os.path.abspath(start)
    while True:
        if os.path.isdir(os.path.join(cur, ".git")):
            return cur
        up = os.path.dirname(cur)
        if up == cur:  # reached drive root
            return os.path.abspath(start)
        cur = up

def score_docx(path):
    name = os.path.basename(path)
    score = 0
    lower = name.lower()
    for kw in PREFERRED_KEYWORDS:
        if kw.lower() in lower:
            score += 100
    try:
        st = os.stat(path)
        score += int(st.st_size / 1024)  # 크기 가산 (대용량 원고 우선)
        score += int(st.st_mtime / 86400) % 1000  # 최근 수정 약간 가산
    except:  # pragma: no cover
        pass
    return score

def find_docx():
    # 1) 현재 폴더 직접 탐색
    here = os.path.abspath(".")
    candidates = [os.path.join(here, f) for f in os.listdir(here) if f.lower().endswith(".docx")]
    if candidates:
        best = max(candidates, key=score_docx)
        return best

    # 2) 저장소 루트 파악 후 전체 스캔
    root = find_repo_root(here)
    hits = []
    for base, dirs, files in os.walk(root):
        # 속도: node_modules 등 무시
        bn = os.path.basename(base).lower()
        if bn in (".git", "node_modules", ".venv", "__pycache__"):
            continue
        for f in files:
            if f.lower().endswith(".docx"):
                path = os.path.join(base, f)
                hits.append(path)
    if not hits:
        raise SystemExit("❌ .docx 원고를 찾지 못했습니다. (현재/저장소 전체)")

    # goods/library/ebooks·papers·language_of_love 경로 가산
    def path_boost(p):
        boost = 0
        pl = p.lower()
        for sub in ["goods/library/ebooks", "goods/library/papers", "language_of_love", "resonant_linguistics"]:
            if sub in pl:
                boost += 200
        return boost

    best = max(hits, key=lambda p: score_docx(p) + path_boost(p))
    return best

def xhtml_head(title):
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(title)}</title>
  <link rel="stylesheet" href="{CSS_NAME}" />
</head>
<body>
"""

def xhtml_nav(prev_href, next_href):
    prev_link = f'<a href="{prev_href}">← 이전</a>' if prev_href else '<span></span>'
    next_link = f'<a href="{next_href}">다음 →</a>' if next_href else '<span></span>'
    return f"""
  <nav style="text-align:center;margin:20px 0;">
    {prev_link} | <a href="index.xhtml">목차</a> | {next_link}
  </nav>
"""

def xhtml_tail():
    return "\n</body>\n</html>\n"

def para_html(p):  # 불필요 공백 정리
    p = re.sub(r"\s+", " ", p).strip()
    return f"<p>{html.escape(p)}</p>"

# ---------------- DOCX → 문단 ----------------
def read_docx_paragraphs(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        xml = z.read("word/document.xml").decode("utf-8", errors="ignore")
    parts = re.split(r"</w:p>", xml)
    paras = []
    for part in parts:
        texts = re.findall(r"<w:t[^>]*>(.*?)</w:t>", part, flags=re.DOTALL)
        if not texts: 
            continue
        txt = html.unescape("".join(texts))
        txt = txt.replace("\u00ad", "")  # soft hyphen 제거
        txt = txt.replace("\r", " ").replace("\n", " ").strip()
        if txt:
            # 페이지번호/머리말 단순 제거(숫자만 한 줄 등)
            if re.fullmatch(r"[0-9ivxlcdmIVXLCDM.\-–—]+", txt):
                continue
            paras.append(txt)
    # 연속 중복 제거
    out, prev = [], None
    for p in paras:
        if p != prev:
            out.append(p); prev = p
    return out

# ---------------- 장/에필로그 탐지 ----------------
CHAPTER_PATTERNS = [
    r"^\s*제?\s*\d+\s*장[.\s]",      # "제1장", "1장"
    r"^\s*\d+\s*부[.\s]",            # "1부"
    r"^\s*[IVX]{1,6}[.\s]",          # "Ⅰ.", "II."
    r"^\s*(?:Chapter|CHAPTER|Ch\.)\s*\d+",
    r"^\s*(?:\(|\[)?\d+(?:\)|\.)\s+",# "(1)", "1."
]
EPI_RE = re.compile(r"(설계자의\s*기록|후기|에필로그|Epilogue)", re.I)

def detect_slices(paras):
    chap_idx, titles = [], []
    for i, p in enumerate(paras):
        if EPI_RE.search(p):  # 에필로그는 뒤에서 처리
            continue
        for pat in CHAPTER_PATTERNS:
            if re.match(pat, p):
                chap_idx.append(i); titles.append(p.strip()); break

    # 에필로그 위치
    epi_idx = None
    for i, p in enumerate(paras):
        if EPI_RE.search(p):
            epi_idx = i; break

    slices = []
    if chap_idx:
        for k, start in enumerate(chap_idx):
            end = chap_idx[k+1] if k+1 < len(chap_idx) else (epi_idx if (epi_idx and epi_idx>start) else len(paras))
            slices.append((start, end))
    else:
        slices = [(0, epi_idx if epi_idx else len(paras))]
        titles = ["1장"]
    return slices, titles, epi_idx

# ---------------- 파일 생성 ----------------
def ensure_css():
    if os.path.exists(os.path.join(OUT_DIR, CSS_NAME)):
        return
    css = """body{margin:0;font-family:'Noto Sans KR',sans-serif;line-height:1.8;background:#fcfcfc;color:#222;}
main{max-width:820px;margin:40px auto;padding:0 20px;}
h1,h2,h3{color:#004d60;}
nav{text-align:center;margin:20px 0;}
a{color:#006678;text-decoration:none}
a:hover{text-decoration:underline}
"""
    with open(os.path.join(OUT_DIR, CSS_NAME), "w", encoding="utf-8") as f:
        f.write(css)

def write_chapters(paras, slices, titles):
    made = []
    for ci, (start, end) in enumerate(slices, start=1):
        title = titles[ci-1] if ci-1 < len(titles) else f"{ci}장"
        fname = f"ch{ci}.xhtml"
        prev_href = f"ch{ci-1}.xhtml" if ci>1 else None
        next_href = f"ch{ci+1}.xhtml" if ci < len(slices) else ("epilogue.xhtml" if any("에필로그" in t or "설계자의" in t for _,t in made) or True else None)
        body = "\n".join(para_html(p) for p in paras[start:end])
        html_doc = (
            xhtml_head(title)
            + xhtml_nav(prev_href, next_href)
            + f"<main>\n<h1>{html.escape(title)}</h1>\n{body}\n</main>"
            + xhtml_nav(prev_href, next_href)
            + xhtml_tail()
        )
        with open(os.path.join(OUT_DIR, fname), "w", encoding="utf-8") as f:
            f.write(html_doc)
        made.append((fname, title))
    return made

def write_epilogue(paras, epi_idx, last_ch_name):
    if epi_idx is None:
        return False
    epi_body = "\n".join(para_html(p) for p in paras[epi_idx:])
    html_doc = (
        xhtml_head("설계자의 기록")
        + xhtml_nav(last_ch_name, None)
        + f"<main>\n<h1>설계자의 기록</h1>\n{epi_body}\n</main>"
        + xhtml_nav(last_ch_name, None)
        + xhtml_tail()
    )
    with open(os.path.join(OUT_DIR, "epilogue.xhtml"), "w", encoding="utf-8") as f:
        f.write(html_doc)
    return True

def write_misc_pages():
    for name, title in [("glossary.xhtml","용어집"),("references.xhtml","참고문헌"),("appendix.xhtml","부록")]:
        doc = xhtml_head(title) + f"<main><h1>{title}</h1><p>추후 내용 추가.</p></main>" + xhtml_tail()
        with open(os.path.join(OUT_DIR, name), "w", encoding="utf-8") as f:
            f.write(doc)

def index_has_cover():
    return os.path.exists(os.path.join(IMG_DIR, "cover.png"))

def write_index(toc_list):
    os.makedirs(IMG_DIR, exist_ok=True)
    cover = '<img src="images/cover.png" alt="감응 언어학 표지" />' if index_has_cover() else ''
    toc_items = "\n".join([f'<li><a href="{f}">{html.escape(t)}</a></li>' for f,t in toc_list])
    if os.path.exists(os.path.join(OUT_DIR, "epilogue.xhtml")):
        toc_items += '\n<li><a href="epilogue.xhtml">설계자의 기록</a></li>'
    toc_items += '\n<li><a href="glossary.xhtml">용어집</a></li>\n<li><a href="references.xhtml">참고문헌</a></li>\n<li><a href="appendix.xhtml">부록</a></li>'
    doc = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>🌀 감응 언어학 | Resonant Linguistics</title>
  <link rel="stylesheet" href="{CSS_NAME}" />
  <style>
    .cover{{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:16px;background:#f5f7f8;padding:24px}}
    .cover img{{max-width:280px;height:auto;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.08)}}
    .toc{{max-width:820px;margin:30px auto;padding:0 20px}}
    .toc ol{{line-height:1.9}}
    .btn{{display:inline-block;padding:12px 18px;border-radius:8px;border:1px solid #0a6;cursor:pointer;text-decoration:none;color:#0a6}}
  </style>
</head>
<body>
  <header class="cover">
    {cover}
    <h1>🌀 감응 언어학</h1>
    <p>언어는 여전히 숨 쉬고 있다 — 그 울림의 회로를 찾아서.</p>
    <p><a class="btn" href="{toc_list[0][0] if toc_list else '#'}">읽기 시작하기</a></p>
  </header>
  <main class="toc">
    <h2>목차</h2>
    <ol>
      {toc_items}
    </ol>
  </main>
</body>
</html>
"""
    with open(os.path.join(OUT_DIR, "index.xhtml"), "w", encoding="utf-8") as f:
        f.write(doc)

# ---------------- 메인 ----------------
def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    # 1. 원고 자동 탐색
    docx_path = find_docx()
    print(f"📄 원고: {docx_path}")

    # 2. 본문 문단 추출
    paras = read_docx_paragraphs(docx_path)
    if not paras:
        raise SystemExit("❌ 본문을 추출하지 못했습니다. (빈 문서?)")

    # 3. 장/에필로그 경계 잡기
    slices, titles, epi_idx = detect_slices(paras)

    # 4. 출력 생성
    ensure_css()
    chapters = write_chapters(paras, slices, titles)
    write_epilogue(paras, epi_idx, chapters[-1][0] if chapters else None)
    write_misc_pages()
    write_index(chapters)

    print("✅ 완료:", ", ".join(f for f,_ in chapters), "+ epilogue.xhtml, index.xhtml, stylesheet.css")

if __name__ == "__main__":
    main()
