// /scripts/memory_policies.js
// 정책(전환 규칙) + 전역 익스포트(페이지 어디서나 접근)

import { MemoryCore } from "/scripts/memory_core.js";

function log(...args){ try{ console.info("[LuwainMemory]", ...args);}catch(_){} }

async function housekeepingOnce() {
  const scan = MemoryCore.scanStatuses();
  log("scan:", scan);

  // on_hold는 그대로 둠(업그레이드 예정)
  for (const pj of scan.toArchive) {
    const res = await MemoryCore.archiveProject(pj);
    log("archived:", pj, res);
  }
  // cooldown은 표시만(전환은 아카이브 때 수행)
  for (const pj of scan.toCooldown) {
    // 필요 시 배지 표시만 하고 넘김
    log("cooldown:", pj);
  }
}

function scheduleHousekeeping() {
  // 페이지 로드시 1회, 이후 6시간마다 점검(가벼움)
  housekeepingOnce().catch(()=>{});
  setInterval(() => housekeepingOnce().catch(()=>{}), 6 * 60 * 60 * 1000);
}

// 전역 API(페이지 어디서든 사용)
window.LuwainMemory = {
  saveEvent: (args) => MemoryCore.saveEvent(args),
  getProjectState: (project) => MemoryCore.getProjectState(project),
  setUpgradePending: (project, on=true) => MemoryCore.setUpgradePending(project, on),
  archiveProject: (project) => MemoryCore.archiveProject(project),
  restoreProject: (project) => MemoryCore.restoreProject(project),
};

document.addEventListener("DOMContentLoaded", scheduleHousekeeping);
