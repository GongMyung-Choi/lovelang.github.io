// 🧠 루웨인 퍼스나 공통 코어
// 감응, 논리, 공감, 창의성 등 기본 계산 로직

export const PersonaCore = {
  traits: { emotion: 50, logic: 50, empathy: 50, creativity: 50 },

  init(defaults = {}) {
    this.traits = { ...this.traits, ...defaults };
    this.loadMemory();
  },

  adjustTrait(key, delta) {
    if (this.traits[key] !== undefined) {
      this.traits[key] = Math.min(100, Math.max(0, this.traits[key] + delta));
      this.saveMemory();
    }
  },

  saveMemory() {
    localStorage.setItem('luwein_persona_traits', JSON.stringify(this.traits));
  },

  loadMemory() {
    const saved = localStorage.getItem('luwein_persona_traits');
    if (saved) this.traits = JSON.parse(saved);
  },

  summary() {
    return `감성:${this.traits.emotion} 논리:${this.traits.logic} 공감:${this.traits.empathy} 창의:${this.traits.creativity}`;
  }
};
