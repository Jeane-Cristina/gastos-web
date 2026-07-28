import { useState } from "react";

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
    <div>
      <h2>Pergunte sobre seus gastos</h2>
      {messages.map((m, i) => (
        <div key={i}>
          <p><strong>Você:</strong> {m.question}</p>
          <p><strong>Assistente:</strong> {m.answer}</p>
        </div>
      ))}
      <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex: quanto gastei com Lazer esse mês?" />
      <button onClick={handleAsk} disabled={loading}>{loading ? "Pensando..." : "Perguntar"}</button>
    </div>
  );
}