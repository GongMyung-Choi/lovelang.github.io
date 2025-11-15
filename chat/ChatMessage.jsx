export default function ChatMessage({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div
      style={{
        marginBottom: 10,
        textAlign: isUser ? "right" : "left"
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "8px 12px",
          borderRadius: 8,
          background: isUser ? "#3a3a3a" : "#222",
          color: "#e5e5e5"
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}
