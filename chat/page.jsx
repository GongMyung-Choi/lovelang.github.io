"use client";

import { useState } from "react";
import ChatMessage from "./ChatMessage";
import { sendMessage, uploadImage } from "./actions";

export default function Page() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    const reply = await sendMessage(input);
    const assistantMessage = { role: "assistant", content: reply };

    setMessages((prev) => [...prev, assistantMessage]);
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const url = await uploadImage(file);

    setUploading(false);

    const userMessage = {
      role: "user",
      content: `📷 이미지 업로드됨: ${url}`
    };

    setMessages((prev) => [...prev, userMessage]);

    const reply = await sendMessage(`사용자가 이미지를 보냈습니다: ${url}`);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
  }

  return (
    <div style={{ padding: "20px", maxWidth: 600, margin: "0 auto" }}>
      <h2>📡 루웨인 직통 무전기</h2>

      <div
        style={{
          border: "1px solid #333",
          padding: "10px",
          borderRadius: 8,
          height: 400,
          overflowY: "auto",
          marginBottom: 10,
          background: "#111",
          color: "#eee"
        }}
      >
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} msg={msg} />
        ))}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />

      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #444",
            background: "#222",
            color: "#eee"
          }}
          placeholder="메시지 입력…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          style={{
            marginLeft: 6,
            padding: "10px 15px",
            borderRadius: 6,
            background: "#4466ff",
            color: "#fff",
            border: "none"
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}
