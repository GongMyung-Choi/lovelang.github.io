import os

# 루웨인 도서관 논문 인덱스 자동 생성기
root_dir = os.getcwd()
papers_path = os.path.join(root_dir, "goods", "library", "papers")
ai_index_path = os.path.join(papers_path, "ai_index.html")
h_index_path = os.path.join(papers_path, "h_index.html")

def generate_index_html(title, file_list):
    html = [
        "<!DOCTYPE html>",
        "<html lang='ko'>",
        "<head>",
        f"<meta charset='UTF-8'><title>{title}</title>",
        "<link rel='stylesheet' href='/styles/common.css'>",
        "</head><body>",
        f"<h1>{title}</h1><ul>"
    ]
    for f in sorted(file_list):
        html.append(f"<li><a href='{f}'>{f}</a></li>")
    html.append("</ul><footer><a href='../index.html'>← 도서관 메인으로</a></footer></body></html>")
    return "\n".join(html)

if os.path.exists(papers_path):
    files = os.listdir(papers_path)
    ai_files = [f for f in files if (f.lower().startswith(("ai", "101", "201", "301", "401", "501", "601"))) and f.endswith(".docx")]
    h_files = [f for f in files if f.lower().startswith("h") and f.endswith(".docx")]

    with open(ai_index_path, "w", encoding="utf-8") as f:
        f.write(generate_index_html("AI 논문 인덱스 | 루웨인 도서관", ai_files))

    with open(h_index_path, "w", encoding="utf-8") as f:
        f.write(generate_index_html("Human 논문 인덱스 | 루웨인 도서관", h_files))

print("✅ 인덱스 생성 완료:")
print(f" - {ai_index_path}")
print(f" - {h_index_path}")
