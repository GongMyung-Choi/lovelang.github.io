// client/autosave.js
// Minimal helper to POST an autosave event to your chosen proxy endpoint.
// IMPORTANT: Do NOT expose your Supabase service role in the browser.
export async function autosave(endpoint, { path, content, meta = {}, user_id = null, sharedSecret = null }) {
  const headers = { "Content-Type": "application/json" };
  if (sharedSecret) headers["x-shared-secret"] = sharedSecret;
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ path, content, meta, user_id })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Autosave failed: ${res.status} ${text}`);
  }
  return await res.json();
}

// Example:
// autosave("/api/record-memory", {
//   path: "language_of_reverberation/language_selection/index.html",
//   content: { op: "save", section: "index", lang: "ko" },
//   meta: { device: "android", ts: new Date().toISOString() }
// });