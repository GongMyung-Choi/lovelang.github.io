/* =========================================================
 *  루웨인 감응 루프 (LUWAIN Resonance Core)
 *  경로: /scripts/resonance_core.js
 *  역할: 퍼스나들 간 신호 교환의 울림(공명)을 측정하고 기록
 * ========================================================= */

import { PersnaHub } from "./persna_hub.js";
import { DataBridge } from "./data_bridge.js";

export const ResonanceCore = {
  version: "1.0.0",
  history: [],     // 감응 기록
  resonanceMap: {}, // 퍼스나별 평균 공명 점수

  init() {
    console.log("[LUWAIN] Resonance Core initializing...");
    PersnaHub.register("ResonanceCore", this.handleSignal.bind(this));
    console.log("[LUWAIN] Resonance Core connected to Persona Hub.");
  },

  async handleSignal(msg) {
    const { from, signal, data } = msg;
    if (signal !== "resonate") return;

    const score = this.measureResonance(data);
    this.history.push({
      from,
      score,
      ts: Date.now(),
      context: data.context || null
    });

    // 퍼스나별 평균 업데이트
    this.updateAverage(from, score);

    // 로그 저장 (optional Supabase)
    if (DataBridge?.sources?.supabaseUrl) {
      this.logToSupabase(from, score, data.context);
    }

    console.log(`[LUWAIN][Resonance] ${from} → ${score}`);
    return { ok: true, score };
  },

  measureResonance({ text = "", response = "" }) {
    // 기본 감응 측정 알고리즘 (간단 버전)
    const clean = s => s.replace(/[^ㄱ-힣a-zA-Z0-9]/g, "");
    const overlap = this.stringOverlap(clean(text), clean(response));
    const lenFactor = Math.min(text.length, response.length);
    const resonance = Math.round((overlap / lenFactor) * 100);
    return Math.min(100, Math.max(0, resonance));
  },

  stringOverlap(a, b) {
    let count = 0;
    for (let ch of a) if (b.includes(ch)) count++;
    return count;
  },

  updateAverage(name, newScore) {
    const prev = this.resonanceMap[name] || { total: 0, count: 0 };
    prev.total += newScore;
    prev.count++;
    this.resonanceMap[name] = prev;
    const avg = Math.round(prev.total / prev.count);
    console.log(`[LUWAIN][Resonance Avg] ${name}: ${avg}`);
  },

  async logToSupabase(from, score, context) {
    try {
      const payload = {
        type: "resonance",
        severity: "info",
        detail: { from, score, context },
        path: window.location.pathname
      };

      await fetch(`${DataBridge.sources.supabaseUrl}/rest/v1/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: DataBridge.sources.supabaseKey,
          Authorization: `Bearer ${DataBridge.sources.supabaseKey}`
        },
        body: JSON.stringify(payload)
      });
      console.log("[LUWAIN][Supabase] Resonance logged.");
    } catch (e) {
      console.warn("[LUWAIN][Supabase] Logging failed:", e);
    }
  },

  getAverages() {
    const result = {};
    for (const [name, { total, count }] of Object.entries(this.resonanceMap)) {
      result[name] = Math.round(total / count);
    }
    return result;
  }
};

// 자동 초기화
ResonanceCore.init();
window.LuwainResonance = ResonanceCore;
console.log("[LUWAIN] Resonance Core Ready.");
