import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { getJointInsight } from "../services/jointAccountApi";
import "./JointInsight.css";

interface Props {
  accountId: number;
}

function renderInsight(text: string) {
  const sections = text.split(/(?=EQUILÍBRIO DA CONTA|SUGESTÃO PRÁTICA)/);

  return sections.map((section, i) => {
    const match = section.match(/^([A-ZÀ-Ú ]+):?\s*([\s\S]*)/);
    if (!match) return null;

    const [, title, body] = match;

    return (
      <div key={i} className="joint-insight-section">
        <h4>{title.trim()}</h4>
        <ReactMarkdown>{body.trim()}</ReactMarkdown>
      </div>
    );
  });
}

export function JointInsight({ accountId }: Props) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await getJointInsight(accountId);
      setInsight(result);
    } catch {
      setInsight("Não foi possível gerar o insight agora. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="joint-insight">
      <h4>Insight da conta</h4>
      <button className="joint-insight__generate" onClick={handleGenerate} disabled={loading}>
        {loading ? "Gerando..." : "Gerar insight da conta"}
      </button>
      {insight && <div>{renderInsight(insight)}</div>}
    </div>
  );
}