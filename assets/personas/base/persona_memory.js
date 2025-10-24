// 💾 퍼스나 기억 저장 및 복원 모듈
export const PersonaMemory = {
  key: 'luwein_memory_records',

  saveRecord(title, content) {
    const records = this.loadAll();
    const entry = { id: Date.now(), title, content, ts: new Date().toISOString() };
    records.push(entry);
    localStorage.setItem(this.key, JSON.stringify(records));
  },

  loadAll() {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  },

  clear() {
    localStorage.removeItem(this.key);
  }
};
