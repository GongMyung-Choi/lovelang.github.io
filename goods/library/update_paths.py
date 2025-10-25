import os, json

# 🔍 기본 탐색 경로 (index.html과 같은 위치에 둘 것)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 📚 자동으로 도서가 들어 있는 모든 폴더 탐색
book_paths = []

for root, dirs, files in os.walk(BASE_DIR):
    # 무시할 폴더
    if any(x in root for x in ['.git', '__pycache__']):
        continue
    # summary.txt나 metadata.json이 있는 폴더만 등록
    if 'summary.txt' in files or 'metadata.json' in files:
        rel = os.path.relpath(root, BASE_DIR).replace("\\", "/")
        if rel != '.':
            book_paths.append(f"./{rel}")

# 📦 경로 정렬
book_paths = sorted(set(book_paths))

# ✍️ paths.json 작성
output = {"paths": book_paths}
with open(os.path.join(BASE_DIR, "paths.json"), "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"✅ paths.json 생성 완료 — 총 {len(book_paths)}개 폴더 인식됨.")
