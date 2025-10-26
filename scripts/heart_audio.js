// 🎵 루웨인 공명 비트-싱크 시스템
const audio = {
  idle: new Audio("/assets/audio/beat_idle.mp3"),
  stable: new Audio("/assets/audio/beat_stable.mp3"),
  resonant: new Audio("/assets/audio/beat_resonant.mp3"),
  alert: new Audio("/assets/audio/beat_alert.mp3")
};

let current = null;
Object.values(audio).forEach(a => { a.loop = true; a.volume = 0.45; });

export function playHeartBeat(color) {
  let next;
  if (color.includes("#ff")) next = audio.alert;
  else if (color.includes("#33bbff")) next = audio.resonant;
  else if (color.includes("#33ff77")) next = audio.stable;
  else next = audio.idle;

  if (next !== current) {
    if (current) current.pause();
    next.currentTime = 0;
    next.play().catch(e => console.warn("오디오 재생 불가:", e));
    current = next;
  }
}
