window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  window.deferredPrompt = e;

  const btn = document.createElement("button");
  btn.textContent = "📱 루웨인 앱 설치하기";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "9999",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: "bold",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
  });

  btn.onclick = async () => {
    window.deferredPrompt.prompt();
    const { outcome } = await window.deferredPrompt.userChoice;
    if (outcome === "accepted") btn.remove();
    window.deferredPrompt = null;
  };

  document.body.appendChild(btn);
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/app_ready_patch/service-worker.js')
  .then(() => console.log("✅ LUWAIN service worker registered"))
  .catch(console.error);
}
