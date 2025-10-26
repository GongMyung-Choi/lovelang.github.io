# -*- coding: utf-8 -*-
# fix_xhtml.py — Resonant_Linguistics XHTML 일괄 수리/정상화
import re, os, shutil, glob, pathlib

ROOT = pathlib.Path(__file__).parent
BACKUP = ROOT / "_backup"
BACKUP.mkdir(exist_ok=True)

# 정렬 키: ch1, ch2 ... chN, epilogue, glossary 순
def sort_key(p: pathlib.Path):
    name = p.stem.lower()
    m = re.match(r'ch(\d+)', name)
    if m: return (0, int(m.group(1)))
    if name == "epilogue": return (1, 0)
    if name == "glossary": return (2, 0)
    return (3, name)

files = sorted([p for p in ROOT.glob("*.xhtml")], key=sort_key)
if not files:
    print("⚠️ .xhtml 파일이 없습니다. 이 스크립트는 Resonant_Linguistics 폴더에서 실행하세요.")
    raise SystemExit(1)

def safe_read(path: pathlib.Path) -> str:
    # BOM/인코딩 섞여도 최대한 읽기
    data = path.read_bytes()
    # UTF-8 BOM 제거
    if data.startswith(b'\xef\xbb\xbf'):
        data = data[3:]
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("utf-8", errors="replace")

def extract_body(html: str) -> str:
    # 기존 래퍼 제거하고 body 내부만 추출
    html = re.sub(r'^\s*<\?xml[^>]*\?>', '', html, flags=re.I|re.S)
    html = re.sub(r'<!DOCTYPE[^>]*>', '', html, flags=re.I|re.S)
    html = re.sub(r'</?html[^>]*>', '', html, flags=re.I|re.S)
    html = re.sub(r'</?head[^>]*>.*?</head>', '', html, flags=re.I|re.S)
    m = re.search(r'<body[^>]*>(.*?)</body>', html, flags=re.I|re.S)
    content = m.group(1).strip() if m else html.strip()
    # XHTML 자가치유: <br>, <hr>, <img>, <meta>, <link> 등 self-closing
    content = re.sub(r'<br(?=[^/>]*?)>', r'<br />', content, flags=re.I)
    content = re.sub(r'<hr(?=[^/>]*?)>', r'<hr />', content, flags=re.I)
    # img에 alt 없으면 alt 추가, self-closing
    def fix_img(match):
        tag = match.group(0)
        if ' alt=' not in tag.lower():
            tag = tag[:-1] + ' alt=""' + '>'
        tag = re.sub(r'(?<!/)>$', ' />', tag)  # self-closing
        # 이미지 경로 보정: 상대 파일명만 있으면 images/ 붙임
        srcm = re.search(r'src=["\']([^"\']+)["\']', tag, flags=re.I)
        if srcm:
            src = srcm.group(1)
            if not src.startswith(('http://', 'https://', '/', './', '../')) and '/' not in src:
                tag = tag.replace(src, f'images/{src}')
        return tag
    content = re.sub(r'<img\b[^>]*>', fix_img, content, flags=re.I)
    return content

def make_title(p: pathlib.Path) -> str:
    name = p.stem
    if re.match(r'ch(\d+)', name, flags=re.I):
        n = re.findall(r'\d+', name)[0]
        return f"장 {n}"
    if name.lower() == "epilogue": return "에필로그"
    if name.lower() == "glossary": return "용어집"
    return name

TEMPLATE = """<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko" lang="ko">
<head>
<meta charset="UTF-8" />
<title>{title}</title>
<link rel="stylesheet" href="stylesheet.css" />
</head>
<body>
<header class="rl-header">
  <a class="toc" href="index.xhtml">↩ 목차</a>
  <span class="ttl">{title}</span>
</header>
<article id="{aid}">
{content}
</article>
<footer class="rl-footer">
  <div class="nav">
    {prev_link} {next_link}
  </div>
</footer>
</body>
</html>
"""

def nav_link(label, href, cls):
    return f'<a class="{cls}" href="{href}">{label}</a>' if href else f'<span class="{cls} disabled">{label}</span>'

# 원본 백업 + 파일별 정상화
for i, p in enumerate(files):
    raw = safe_read(p)
    (BACKUP / p.name).write_text(raw, encoding="utf-8")
    content = extract_body(raw)
    title = make_title(p)
    aid = p.stem
    prev_href = files[i-1].name if i > 0 else None
    next_href = files[i+1].name if i < len(files)-1 else None
    prev_link = nav_link("← 이전", prev_href, "prev")
    next_link = nav_link("다음 →", next_href, "next")
    normalized = TEMPLATE.format(
        title=title, aid=aid, content=content,
        prev_link=prev_link, next_link=next_link
    )
    p.write_text(normalized, encoding="utf-8")
    print(f"✅ normalized: {p.name}")

# 목차 index.xhtml 생성
def build_toc():
    items = []
    for p in files:
        t = make_title(p)
        items.append(f'<li><a href="{p.name}">{t}</a></li>')
    return "\n".join(items)

INDEX = """<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko" lang="ko">
<head>
<meta charset="UTF-8" />
<title>Resonant Linguistics — 목차</title>
<link rel="stylesheet" href="stylesheet.css" />
</head>
<body>
<header class="rl-header home">
  <span class="ttl">Resonant Linguistics</span>
</header>
<section class="toc-wrap">
  <h1>목차</h1>
  <ol class="toc">
  {items}
  </ol>
</section>
</body>
</html>
"""
(ROOT / "index.xhtml").write_text(INDEX.replace("{items}", build_toc()), encoding="utf-8")
print("📚 built: index.xhtml")

print("\n🎉 완료 — _backup 폴더에 원본 보관, 각 xhtml 정상화/네비/목차 생성 끝")
