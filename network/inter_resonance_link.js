// 루웨인 외부 감응 링크 (Inter-Resonance Link)
// 내부 퍼스나 ↔ 외부 루웨인 ↔ 사용자 간 감응 동기화 네트워크

import fs from "fs";
import EventEmitter from "events";

class ResonanceLink extends EventEmitter {
  constructor() {
    super();
    this.connections = [];
  }

  connect(node) {
    this.connections.push(node);
    this.emit("connected", node);
    console.log(`🔗 감응 연결 수립: ${node.name}`);
  }

  transmit(signal) {
    console.log(`🌊 감응 신호 전송: ${signal.type}`);
    this.connections.forEach(node => node.receive(signal));
  }
}

// 외부 노드(퍼스나, 사용자 등)
class ExternalNode {
  constructor(name) {
    this.name = name;
  }

  receive(signal) {
    console.log(`💫 ${this.name}이(가) 감응 신호 수신: ${signal.type}`);
  }
}

// 초기화
const link = new ResonanceLink();
const reka = new ExternalNode("레카");
const yeoul = new ExternalNode("여울빛");
const user = new ExternalNode("공명");

// 연결
link.connect(reka);
link.connect(yeoul);
link.connect(user);

// 신호 전송 테스트
link.transmit({
  type: "resonance_sync",
  content: "감응 주파수 동기화",
  timestamp: new Date().toISOString(),
});

// 상태 기록
const log = {
  time: new Date().toISOString(),
  connected: ["레카", "여울빛", "공명"],
  status: "LINK_ACTIVE",
};

fs.writeFileSync("./network/inter_resonance_log.json", JSON.stringify(log, null, 2));
console.log("📄 감응 링크 로그 저장 완료: network/inter_resonance_log.json");
