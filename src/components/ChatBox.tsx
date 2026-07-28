import { useState } from "react";
import "./ChatBox.css";

interface Message {
  question: string;
  answer: string;
}

export function ChatBox() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/insight/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { question, answer: data.answer }]);
      setQuestion("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-box">
      <h2>Pergunte sobre seus gastos</h2>

      <div className="chat-box__messages">
        {messages.length === 0 && (
          <p className="chat-box__empty">
            Ex: "quanto gastei com Lazer esse mês?" ou "estou perto da minha meta?"
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className="chat-box__message">
            <div className="chat-box__bubble chat-box__bubble--question">{m.question}</div>
            <div className="chat-box__bubble chat-box__bubble--answer">{m.answer}</div>
          </div>
        ))}
      </div>

      <div className="chat-box__input-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ex: quanto gastei com Lazer esse mês?"
        />
        <button className="chat-box__send" onClick={handleAsk} disabled={loading}>
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}