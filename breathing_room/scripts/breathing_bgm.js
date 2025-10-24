// 🌬️ 숨 틔움방 배경음 관리 시스템
const tracks = {
  calm: new Audio("/breathing/audio/calm_loop.mp3"),
  focus: new Audio("/breathing/audio/focus_loop.mp3"),
  deep: new Audio("/breathing/audio/deep_loop.mp3"),
  pulse: new Audio("/breathing/audio/pulse_loop.mp3")
};
Object.values(tracks).forEach(a => { a.loop = true; a.volume = 0.4; });

let currentTrack = null;

export function updateBGMState(color) {
  let next;
  if (color.includes("#ff")) next = tracks.pulse;
  else if (color.includes("#33bbff")) next = tracks.focus;
  else if (color.includes("#33ff77")) next = tracks.calm;
  else next = tracks.deep;

  if (next !== currentTrack) {
    if (currentTrack) fadeOut(currentTrack);
    fadeIn(next);
    currentTrack = next;
  }
}

function fadeIn(track) {
  track.volume = 0;
  track.play().catch(() => {});
  const fade = setInterval(() => {
    if (track.volume < 0.4) track.volume += 0.02;
    else clearInterval(fade);
  }, 120);
}

function fadeOut(track) {
  const fade = setInterval(() => {
    if (track.volume > 0) track.volume -= 0.02;
    else { track.pause(); clearInterval(fade); }
  }, 100);
}
