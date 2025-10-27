// /scripts/memory_core.js
// 저장/조회/아카이브 핵심 로직 (Supabase 있으면 서버+로컬, 없으면 로컬만)

import { MEMORY_SETTINGS, getSupabaseClient } from "/scripts/config.js";

function nowIso() {
  return new Date().toISOString();
}

function daysSince(iso) {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (_) { return []; }
}

function writeLocal(key, arr) {
  try { localStorage.setItem(key, JSON.stringify(arr)); } catch (_) {}
}

function upsertLocalActive(record) {
  const list = readLocal(MEMORY_SETTINGS.LOCAL_ACTIVE_KEY);
  const idx = list.findIndex(r => r.id === record.id);
  if (idx >= 0) list[idx] = record; else list.push(record);
  writeLocal(MEMORY_SETTINGS.LOCAL_ACTIVE_KEY, list);
}

function pushLocalArchive(record) {
  const list = readLocal(MEMORY_SETTINGS.LOCAL_ARCHIVE_KEY);
  list.push(record);
  writeLocal(MEMORY_SETTINGS.LOCAL_ARCHIVE_KEY, list);
}

async function upsertSupabase(table, record) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, reason: "no-supabase" };
  const { data, error } = await client.from(table).upsert(record);
  if (error) return { ok: false, reason: error.message };
  return { ok: true, data };
}

async function insertSupabase(table, record) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, reason: "no-supabase" };
  const { data, error } = await client.from(table).insert(record);
  if (error) return { ok: false, reason: error.message };
  return { ok: true, data };
}

// 공개 API
export const MemoryCore = {
  /**
   * 이벤트 저장(프로젝트 단위)
   * @param {Object} param0
   *  - project: string (필수)
   *  - payload: any (저장할 내용)
   *  - tags: string[] (자동 분류용 태그)
   *  - importance: number (0~1; 우선도)
   *  - flags: object ({ upgrade_pending: true } 등)
   */
  async saveEvent({ project, payload = {}, tags = [], importance = 0.5, flags = {} }) {
    if (!project) throw new Error("project is required");
    const record = {
      id: crypto.randomUUID(),
      project,
      ts: nowIso(),
      tags,
      importance,
      flags,
      payload
    };
    // 로컬 활성 저장
    upsertLocalActive(record);
    // 서버 동기(옵션)
    await insertSupabase(MEMORY_SETTINGS.TABLE_NAME, record).catch(() => ({}));
    return record.id;
  },

  /**
   * 프로젝트 상태 조회(로컬 기준 요약)
   */
  getProjectState(project) {
    const active = readLocal(MEMORY_SETTINGS.LOCAL_ACTIVE_KEY).filter(r => r.project === project);
    if (active.length === 0) return { project, state: "none", last_ts: null, days: Infinity };
    const last = active.reduce((a,b) => (a.ts > b.ts ? a : b));
    const d = daysSince(last.ts);
    let state = "active";
    if (d >= MEMORY_SETTINGS.HOLD_DAYS) state = "archive_candidate";
    else if (d >= MEMORY_SETTINGS.ACTIVE_DAYS) state = "cooldown";
    // 업그레이드 플래그가 있으면 보류
    const hasUpgrade = active.some(r => r.flags && r.flags.upgrade_pending);
    if (hasUpgrade && state !== "active") state = "on_hold";
    return { project, state, last_ts: last.ts, days: d };
  },

  /**
   * 프로젝트 보류 플래그 토글
   */
  setUpgradePending(project, on = true) {
    const list = readLocal(MEMORY_SETTINGS.LOCAL_ACTIVE_KEY);
    const updated = list.map(r => {
      if (r.project !== project) return r;
      const flags = Object.assign({}, r.flags || {}, { upgrade_pending: on });
      return { ...r, flags };
    });
    writeLocal(MEMORY_SETTINGS.LOCAL_ACTIVE_KEY, updated);
  },

  /**
   * 아카이브로 이동(요약 생성 포함)
   */
  async archiveProject(project) {
    const active = readLocal(MEMORY_SETTINGS.LOCAL_ACTIVE_KEY);
    const keep = [];
    const take = [];
    for (const r of active) {
      if (r.project === project) take.push(r);
      else keep.push(r);
    }
    if (take.length === 0) return { ok: true, moved: 0 };

    // 간단 요약(태그 상위 10, 최신 ts, 중요도 평균)
    const tags = {};
    let latest = "1970-01-01T00:00:00.000Z";
    let sumImp = 0;
    for (const r of take) {
      (r.tags || []).forEach(t => { tags[t] = (tags[t] || 0) + 1; });
      if (r.ts > latest) latest = r.ts;
      sumImp += (r.importance ?? 0.5);
    }
    const topTags = Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([t])=>t);
    const summary = {
      project,
      archived_at: nowIso(),
      latest_event_ts: latest,
      avg_importance: (sumImp / take.length),
      top_tags: topTags,
      count: take.length
    };

    // 로컬 아카이브 적재
    pushLocalArchive({ summary, items: take });

    // 서버 아카이브 전송(옵션)
    await insertSupabase(MEMORY_SETTINGS.ARCHIVE_TABLE_NAME, { summary, items: take }).catch(()=>({}));

    // 활성에서 제거
    writeLocal(MEMORY_SETTINGS.LOCAL_ACTIVE_KEY, keep);
    return { ok: true, moved: take.length, summary };
  },

  /**
   * 아카이브에서 복원(요약만 유지, 아이템은 활성으로 재주입)
   */
  async restoreProject(project) {
    const archive = readLocal(MEMORY_SETTINGS.LOCAL_ARCHIVE_KEY);
    const keep = [];
    let restored = 0;
    for (const pack of archive) {
      if (pack.summary?.project === project) {
        for (const item of (pack.items || [])) {
          upsertLocalActive(item);
          restored++;
          // 서버에도 옵션으로 다시 적재
          await insertSupabase(MEMORY_SETTINGS.TABLE_NAME, item).catch(()=>({}));
        }
      } else keep.push(pack);
    }
    writeLocal(MEMORY_SETTINGS.LOCAL_ARCHIVE_KEY, keep);
    return { ok: true, restored };
  },

  /**
   * 하우스키핑(프로젝트별 상태에 따라 자동 전환 후보 탐색)
   * - 반환: { toCooldown:[], toArchive:[], onHold:[] }
   */
  scanStatuses() {
    const active = readLocal(MEMORY_SETTINGS.LOCAL_ACTIVE_KEY);
    const byProject = new Map();
    for (const r of active) {
      if (!byProject.has(r.project)) byProject.set(r.project, []);
      byProject.get(r.project).push(r);
    }
    const result = { toCooldown: [], toArchive: [], onHold: [] };
    for (const [project, rows] of byProject) {
      const last = rows.reduce((a,b)=> (a.ts > b.ts ? a:b));
      const d = daysSince(last.ts);
      const hasUpgrade = rows.some(r => r.flags && r.flags.upgrade_pending);
      if (hasUpgrade && d >= MEMORY_SETTINGS.ACTIVE_DAYS) result.onHold.push(project);
      else if (d >= MEMORY_SETTINGS.HOLD_DAYS) result.toArchive.push(project);
      else if (d >= MEMORY_SETTINGS.ACTIVE_DAYS) result.toCooldown.push(project);
    }
    return result;
  }
};
