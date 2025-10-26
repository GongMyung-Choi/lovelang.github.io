// 💫 루웨인 하트 ↔ 숨틔움방 BGM 동기화 브릿지
import { playHeartBeat } from "/scripts/heart_audio.js";
import { updateBGMState } from "/breathing/scripts/breathing_bgm.js";

export function syncHeartToBGM(color) {
  // 오디오 리듬과 동시에 BGM 조정
  playHeartBeat(color);
  updateBGMState(color);
}
