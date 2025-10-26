// scripts/library_index.js
const container = document.getElementById("library-container");

async function loadLibrary() {
  try {
    const res = await fetch("/paths.json");
    const data = await res.json();

    for (const path of data.paths) {
      const summaryUrl = `/${path}/summary.txt`;
      const coverUrl = `/${path}/cover.png`;
      const pdfUrl = `/${path}/scenario.pdf`;

      const summaryText = await fetch(summaryUrl)
        .then(r => r.text())
        .catch(() => "요약 없음");

      const card = document.createElement("div");
      card.className = "book-card";
      card.innerHTML = `
        <img src="${coverUrl}" alt="표지" onerror="this.src='/assets/default_cover.png'">
        <div class="book-info">
          <h3>${path.split("/").pop()}</h3>
          <p>${summaryText}</p>
          <a href="${pdfUrl}" download>📘 다운로드</a>
        </div>
      `;
      container.appendChild(card);
    }
  } catch (e) {
    container.innerHTML = "<p>도서 정보를 불러오는 중 오류가 발생했습니다.</p>";
  }
}

loadLibrary();
