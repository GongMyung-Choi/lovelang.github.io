async function loadDashboard() {
  try {
    const res = await fetch("/fusion_lab/api/status");
    const data = await res.json();

    document.getElementById("labList").innerHTML = data.labs
      .map(l => `<li>${l.name}: ${l.progress}% 완료</li>`)
      .join("");

    const ctx = document.getElementById("fusionChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labs.map(l => l.name),
        datasets: [{
          label: "진행률",
          data: data.labs.map(l => l.progress),
          backgroundColor: "#ffb347"
        }]
      },
      options: { indexAxis: "y", scales: { x: { max: 100 } } }
    });
  } catch (e) {
    console.error("대시보드 로드 실패:", e);
  }
}
