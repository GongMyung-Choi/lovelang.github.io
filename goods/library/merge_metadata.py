#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
루웨인 도서관 메타 병합기
- /goods/library/ 하위 모든 폴더를 훑어 개별 metadata.json을 모아
  /goods/library/metadata.json 을 생성
- 개별 메타가 없으면 최소 정보 추정해서 항목 생성(폴더명 기반)
- 기존 metadata.json은 metadata_db_prefs_backup.json 로 백업
"""

import json, os, re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent        # /goods/library
OUT  = ROOT / "metadata.json"
BACK = ROOT / "metadata_db_prefs_backup.json"

# 도서로 판단하지 않을 상위 파일/폴더 이름들
SKIP_DIRS = set([
    ".git", "scripts", "styles", "images", "assets",
    "includes", "papers", "__pycache__", ".DS_Store"
])

def looks_like_book_dir(p: Path) -> bool:
    if not p.is_dir(): return False
    if p.name.startswith('.'): return False
    if p.name in SKIP_DIRS: return False
    # EPUB/OEBPS 혹은 문서가 있으면 책 폴더로 간주
    has_oebps = (p / "OEBPS").exists()
    has_docs  = any(p.glob("*.docx")) or any(p.glob("*.hwp")) or any(p.glob("*.txt"))
    return has_oebps or has_docs

def load_meta_from_dir(book_dir: Path) -> dict:
    meta_file = book_dir / "metadata.json"
    if meta_file.exists():
        try:
            data = json.loads(meta_file.read_text(encoding="utf-8"))
            # 필수 필드 보정
            data.setdefault("title", book_dir.name.replace('_',' ').strip())
            data.setdefault("author", "공명")
            data.setdefault("summary", "")
            data.setdefault("type", "ai")       # 기본 AI
            data.setdefault("status", "in_progress")
            data.setdefault("path", f"/goods/library/{book_dir.name}/")
            return data
        except Exception as e:
            print(f"[WARN] metadata.json 파싱 실패: {book_dir} ({e})")

    # 메타 없으면 최소치 추정
    title_guess = book_dir.name.replace('_', ' ').strip()
    # 사람용(h_) 파일 존재시 type=human
    has_human_file = any(f.name.startswith("h_") for f in book_dir.glob("*.*"))
    data = {
        "title": title_guess,
        "author": "공명",
        "summary": "",
        "type": "human" if has_human_file else "ai",
        "status": "in_progress",   # 초안
        "path": f"/goods/library/{book_dir.name}/"
    }
    return data

def main():
    # 백업
    if OUT.exists():
        try:
            BACK.write_text(OUT.read_text(encoding="utf-8"), encoding="utf-8")
            print(f"[INFO] 기존 metadata.json 백업 -> {BACK.name}")
        except Exception as e:
            print(f"[WARN] 백업 실패: {e}")

    books = []
    for child in sorted(ROOT.iterdir(), key=lambda p: p.name.lower()):
        if looks_like_book_dir(child):
            meta = load_meta_from_dir(child)
            books.append(meta)

    # 정렬: finished 우선, 그 다음 제목 알파
    def sort_key(m):
        return (0 if m.get("status") == "finished" else 1, m.get("title","").lower())

    books.sort(key=sort_key)

    OUT.write_text(json.dumps(books, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[DONE] {OUT} 생성 ({len(books)}권)  [{datetime.now().isoformat(timespec='seconds')}]")

if __name__ == "__main__":
    main()
