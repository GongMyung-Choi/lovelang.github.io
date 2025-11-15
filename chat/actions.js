"use server";

export async function sendMessage(text) {
  const endpoint = process.env.LUWAIN_ENDPOINT;

  const res = await fetch(`${endpoint}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  return data.reply;
}

export async function uploadImage(file) {
  const endpoint = process.env.LUWAIN_ENDPOINT;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${endpoint}/api/upload`, {
    method: "POST",
    body: form
  });

  const data = await res.json();
  return data.url;
}
