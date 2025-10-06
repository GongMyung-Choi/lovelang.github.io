# -*- coding: utf-8 -*-
# 위치: C:\Users\admin\Documents\GitHub\lovelang.github.io\language_of_love\Resonant_Linguistics\make_book.py
# 실행:  (PowerShell 또는 CMD에서 해당 폴더로 이동 후)  python make_book.py
#
# 동작:
#  - DOCX 원고 읽기 -> 장/에필로그 자동 분할 -> ch1~chN.xhtml 생성
#  - index.xhtml(표지+목차) 자동 생성
#  - glossary.xhtml / references.xhtml / appendix.xhtml / stylesheet.css 생성
#  - images/cover.png가 있으면 index.xhtml 표지에 표시

import os, re, html, zipfile

DOCX_NAME = "h_숨 쉬는 언어, 살아 있는 말(감응언어학).docx"
OUT_DIR   = "."           # 현재 폴더
IMG_DIR   = os.path.join(OUT_DIR, "images")
CSS_NAME  = "stylesheet.css"

# --------------------- 공통 템플릿 ---------------------
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

def para_html(p):
    return f"<p>{html.escape(p)}</p>"

# --------------------- DOCX → 문단 ---------------------
def read_docx_paragraphs(docx_path):
    if not os.path.exists(docx_path):
        raise SystemExit(f"원고(.docx) 없음: {docx_path}")
    with zipfile.ZipFile(docx_path) as z:
        xml = z.read("word/document.xml").decode("utf-8", errors="ignore")
    parts = re.split(r"</w:p>", xml)
    paras = []
    for part in parts:
        texts = re.findall(r"<w:t[^>]*>(.*?)</w:t>", part, flags=re.DOTALL)
        if not texts:
            continue
        txt = html.unescape("".join(texts)).strip()
        if txt:
            paras.append(txt)
    # 연속 중복 제거
    out, prev = [], None
    for p in paras:
        if p != prev:
            out.append(p); prev = p
    return out

# --------------------- 장/에필로그 탐지 ---------------------
CHAPTER_PATTERNS = [
    r"^\s*\d+\s*장[.\s]",             # 1장, 2장 ...
    r"^\s*\d+\s*부[.\s]",             # 1부, 2부 ...
    r"^\s*[IVX]{1,4}[.\s]",           # Ⅰ. Ⅱ. Ⅲ.
    r"^\s*(?:Chapter|CHAPTER|Ch\.)\s*\d+",
    r"^\s*(?:\(|\[)?\d+(?:\)|\.)\s*"  # (1) 1. [1] 등
]
EPI_RE = re.compile(r"(설계자의\s*기록|후기|에필로그)")

def detect_slices(paras):
    chap_idx, titles = [], []
    # 챕터 시작 인덱스 수집
    for i, p in enumerate(paras):
        if EPI_RE.search(p):
            continue
        for pat in CHAPTER_PATTERNS:
            if re.match(pat, p):
                chap_idx.append(i); titles.append(p.strip()); break
    # 에필로그 위치
    epi_idx = None
    for i, p in enumerate(paras):
        if EPI_RE.search(p):
            epi_idx = i; break
    # 범위 결정
    slices = []
    if chap_idx:
        for k, start in enumerate(chap_idx):
            end = chap_idx[k+1] if k+1 < len(chap_idx) else (epi_idx if (epi_idx and epi_idx>start) else len(paras))
            slices.append((start, end))
    else:
        slices = [(0, epi_idx if epi_idx else len(paras))]
        titles = ["1장"]
    return slices, titles, epi_idx

# --------------------- 파일 생성 ---------------------
def write_chapters(paras, slices, titles):
    made = []
    for ci, (start, end) in enumerate(slices, start=1):
        title = titles[ci-1] if ci-1 < len(titles) else f"{ci}장"
        fname = f"ch{ci}.xhtml"
        prev_href = f"ch{ci-1}.xhtml" if ci>1 else None
        next_href = f"ch{ci+1}.xhtml" if ci < len(slices) else ("epilogue.xhtml" if any("epilogue.xhtml" in x for x,_ in made) or True else None)
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

def write_misc_pages():
    for name, title in [("glossary.xhtml","용어집"),("references.xhtml","참고문헌"),("appendix.xhtml","부록")]:
        doc = xhtml_head(title) + f"<main><h1>{title}</h1><p>추후 내용 추가.</p></main>" + xhtml_tail()
        with open(os.path.join(OUT_DIR, name), "w", encoding="utf-8") as f:
            f.write(doc)

def index_has_cover():
    return os.path.exists(os.path.join(IMG_DIR, "cover.png"))

def write_index(toc_list):
    has_cover = index_has_cover()
    toc_items = "\n".join([f'<li><a href="{fname}">{html.escape(title)}</a></li>' for fname, title in toc_list])
    epi_exists = os.path.exists(os.path.join(OUT_DIR, "epilogue.xhtml"))
    if epi_exists:
        toc_items += '\n<li><a href="epilogue.xhtml">설계자의 기록</a></li>'
    toc_items += '\n<li><a href="glossary.xhtml">용어집</a></li>\n<li><a href="references.xhtml">참고문헌</a></li>\n<li><a href="appendix.xhtml">부록</a></li>'
    cover_img = '<img src="images/cover.png" alt="감응 언어학 표지" />' if has_cover else ''
    html_doc = f"""<?xml version="1.0" encoding="UTF-8"?>
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
    {cover_img}
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
        f.write(html_doc)

def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    ensure_css()

    paras = read_docx_paragraphs(os.path.join(OUT_DIR, DOCX_NAME))
    slices, titles, epi_idx = detect_slices(paras)
    chapters = write_chapters(paras, slices, titles)
    write_epilogue(paras, epi_idx, chapters[-1][0] if chapters else None)
    write_misc_pages()
    write_index(chapters)

if __name__ == "__main__":
    main()
