document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("diaryForm");
  const entryInput = document.getElementById("entry");
  const confirmation = document.getElementById("confirmation");
  const entriesList = document.getElementById("entries");

  // 저장된 항목 불러오기
  function loadEntries() {
    const saved = localStorage.getItem("gamsung_ilgi_entries");
    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("저장된 감성일기를 불러오는 데 실패했습니다.");
      return [];
    }
  }

  // 항목 저장
  function saveEntry(text) {
    const current = loadEntries();
    current.unshift({ text, date: new Date().toISOString() });
    localStorage.setItem("gamsung_ilgi_entries", JSON.stringify(current));
  }

  // 기존 일기 목록 보여주기
  function displayEntries() {
    const entries = loadEntries();
    if (entriesList) {
      entriesList.innerHTML = "";
      entries.forEach(entry => {
        const li = document.createElement("li");
        const date = new Date(entry.date).toLocaleDateString("ko-KR");
        li.textContent = `[${date}] ${entry.text}`;
        entriesList.appendChild(li);
      });
    }
  }

  if (entriesList) {
    displayEntries(); // returning_user.html일 경우
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const text = entryInput.value.trim();
      if (!text) return;

      saveEntry(text);
      entryInput.value = "";

      if (confirmation) {
        confirmation.classList.remove("hidden");
      }

      if (entriesList) {
        displayEntries();
      }
    });
  }
});
