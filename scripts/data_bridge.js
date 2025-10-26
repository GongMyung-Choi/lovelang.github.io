/* =========================================================
 *  루웨인 데이터 브릿지 (LUWAIN Data Bridge)
 *  경로: /scripts/data_bridge.js
 *  역할: 루웨인의 모든 데이터 소스 통합 및 캐시 관리
 * ========================================================= */

import { PersnaHub } from "./persna_hub.js";

export const DataBridge = {
  version: "1.0.0",
  cache: {},
  sources: {
    local: "/assets/paths.json",
    metadata: "/assets/metadata.db",
    supabaseUrl: "",
    supabaseKey: ""
  },

  async init() {
    console.log("[LUWAIN] Data Bridge initializing...");
    await this.loadLocal();
    PersnaHub.register("DataBridge", this.handleSignal.bind(this));
    console.log("[LUWAIN] Data Bridge connected to Persona Hub.");
  },

  async loadLocal() {
    try {
      const res = await fetch(this.sources.local);
      this.cache.paths = await res.json();
      console.log("[LUWAIN] Local paths.json loaded.");
    } catch (e) {
      console.warn("[LUWAIN] Failed to load local paths.json:", e);
    }
  },

  async getMetadata() {
    // metadata.db는 SQLite 기반이라 직접 JS 접근 불가
    // 대신 Supabase mirror 또는 JSON 변환본을 이용
    try {
      const res = await fetch("/assets/metadata_db_prefs_backup.json");
      this.cache.metadata = await res.json();
      return this.cache.metadata;
    } catch (e) {
      console.error("[LUWAIN] Metadata fetch error:", e);
      return null;
    }
  },

  async handleSignal(msg) {
    const { signal, data, from } = msg;
    console.log(`[LUWAIN][Bridge] Received: ${signal} ← ${from}`);

    switch (signal) {
      case "fetch:data":
        return await this.fetchData(data);
      case "update:data":
        return this.updateCache(data.key, data.value);
      case "ping":
        return { ok: true, source: "DataBridge" };
      default:
        console.warn(`[LUWAIN][Bridge] Unknown signal: ${signal}`);
    }
  },

  async fetchData({ source = "paths" } = {}) {
    if (this.cache[source]) return this.cache[source];
    switch (source) {
      case "paths":
        return await this.loadLocal();
      case "metadata":
        return await this.getMetadata();
      default:
        console.warn("[LUWAIN][Bridge] Unknown data source:", source);
    }
  },

  updateCache(key, value) {
    this.cache[key] = value;
    console.log(`[LUWAIN][Bridge] Cache updated: ${key}`);
    return true;
  }
};

// 허브 연결 자동화
DataBridge.init();
window.LuwainDataBridge = DataBridge;
console.log("[LUWAIN] Data Bridge Ready.");
