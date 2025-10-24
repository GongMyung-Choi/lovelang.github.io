// 📊 퍼스나 데이터 분석 모듈
// 각 퍼스나 감응 지표 시각화

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient("https://omchtafaqgkdwcrwscrp.supabase.co", "공용키");

export async function analyzePersonas() {
  const { data } = await supabase.from("persona_profiles").select("name, emotion, logic, empathy, creativity");
  const canvas = document.getElementById("metaRadar");
  if (!canvas) return;

  new Chart(canvas.getContext("2d"), {
    type: 'radar',
    data: {
      labels: ['감성', '논리', '공감', '창의'],
      datasets: data.map(p => ({
        label: p.name,
        data: [p.emotion, p.logic, p.empathy, p.creativity],
        fill: true,
        borderWidth: 2
      }))
    },
    options: {
      scales: { r: { min: 0, max: 100 } },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}
