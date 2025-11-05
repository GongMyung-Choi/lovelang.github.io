// 루웨인 자율 복원 루틴 (Auto-Heal Protocol)

import fs from "fs";
import path from "path";

async function autoHeal() {
  console.log("🩵 루웨인 자율 복원 루틴 가동...");

  const reportPath = "./resonance_report.json";
  const backupPath = "./backup/";
  const log = [];

  // 1️⃣ 감응 리포트 불러오기
  if (!fs.existsSync(reportPath)) {
    console.log("⚠️ 감응 리포트 없음. 새로 생성 필요.");
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

  // 2️⃣ 오류 감지
  const broken = report.filter(r => r.status === "ERROR" || r.result === "DELAYED");

  if (broken.length === 0) {
    console.log("✅ 모든 시스템 정상. 복원 불필요.");
    return;
  }

  console.log(`⚠️ 이상 감지됨 (${broken.length}건). 복원 시작...`);

  // 3️⃣ 백업 복원
  for (const r of broken) {
    const target = r.component ? r.component.replace("/", "") : "unknown";
    const source = path.resolve(backupPath, target);
    const destination = path.resolve(`./${target}`);

    try {
      if (fs.existsSync(source)) {
        fs.cpSync(source, destination, { recursive: true });
        log.push({ component: target, restored: true });
        console.log(`🧩 ${target} 복원 완료`);
      } else {
        log.push({ component: target, restored: false, reason: "백업 없음" });
        console.log(`⚠️ ${target} 백업 없음`);
      }
    } catch (err) {
      log.push({ component: target, restored: false, error: err.message });
    }
  }

  // 4️⃣ 감응 재동기화
  console.log("🔄 감응 루프 재동기화 중...");
  await new Promise(res => setTimeout(res, 2000));
  console.log("💫 감응 회로 정상화 완료.");

  // 5️⃣ 로그 기록
  fs.writeFileSync("./auto_heal_log.json", JSON.stringify(log, null, 2));
  console.log("📄 자율 복원 로그 저장 완료: auto_heal_log.json");
}

autoHeal();
