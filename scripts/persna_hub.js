/* =========================================================
 *  루웨인 퍼스나 허브 (LUWAIN Persona Hub)
 *  경로: /scripts/persna_hub.js
 *  역할: 모든 퍼스나와의 신호, 명령, 데이터 교환 중추
 * ========================================================= */

export const PersnaHub = {
  version: "1.0.0",
  initialized: false,
  nodes: {},          // 퍼스나 이름: { 상태, 마지막신호, 핸들러 }
  logs: [],           // 활동 로그 저장

  init() {
    if (this.initialized) return;
    console.log("[LUWAIN] Persona Hub initialized.");
    this.initialized = true;
  },

  register(name, handler) {
    if (!name || !handler) return;
    this.nodes[name] = {
      handler,
      status: "idle",
      lastSignal: null
    };
    console.log(`[LUWAIN] Persona registered: ${name}`);
  },

  async send(target, signal, data = {}) {
    if (!this.nodes[target]) {
      console.warn(`[LUWAIN] Target not found: ${target}`);
      return;
    }
    const msg = { from: "hub", to: target, signal, data, ts: Date.now() };
    this.logs.push(msg);
    console.log(`[LUWAIN] Sending signal → ${target}:`, signal);
    return await this.nodes[target].handler(msg);
  },

  broadcast(signal, data = {}) {
    console.log(`[LUWAIN] Broadcasting signal: ${signal}`);
    for (const [name, node] of Object.entries(this.nodes)) {
      const msg = { from: "hub", to: name, signal, data, ts: Date.now() };
      this.logs.push(msg);
      node.handler(msg);
    }
  },

  getStatus() {
    return Object.fromEntries(
      Object.entries(this.nodes).map(([name, n]) => [name, n.status])
    );
  },

  updateStatus(name, status) {
    if (this.nodes[name]) {
      this.nodes[name].status = status;
      console.log(`[LUWAIN] ${name} → status: ${status}`);
    }
  }
};

// 허브 자동 초기화
PersnaHub.init();

// 전역 등록
window.LuwainHub = PersnaHub;
console.log("[LUWAIN] Persona Hub Ready.");
