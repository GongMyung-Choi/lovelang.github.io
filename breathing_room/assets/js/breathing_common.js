// 페이드인, 스크롤 애니메이션 효과
window.addEventListener("scroll", () => {
  document.querySelectorAll(".card").forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }
  });
});
