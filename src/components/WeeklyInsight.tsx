import { useState } from "react";
import { generateInsight } from "../services/profileApi";
import "./WeeklyInsight.css";

export function WeeklyInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateInsight(note);
      setInsight(result.insight);
      setNextAvailable(result.nextAvailableAt);
    } catch (err) {
      setInsight("Não foi possível gerar o insight agora. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  function renderInsight(text: string) {
  const sections = text.split(/(?=PADRÃO IDENTIFICADO:|PONTOS DE ATENÇÃO:|SUGESTÃO PRÁTICA:)/);
  return sections.map((section, i) => {
    const [title, ...rest] = section.split(":");
    return (
      <div key={i} className="insight-section">
        <h4>{title.trim()}</h4>
        <p>{rest.join(":").trim()}</p>
      </div>
    );
  });
}

  return (
    <div className="insight">
      <h2 className="insight__title">Insight da semana</h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Alguma observação pro insight desta semana? (ex: 'tive um gasto extra com viagem')"
      />
      <button className="insight__generate" onClick={handleGenerate} disabled={loading}>
        {loading ? "Gerando..." : "Ver meu insight"}
      </button>
      {insight && <div>{renderInsight(insight)}</div>}
      {nextAvailable && (
        <p className="insight__next-available">
          Próximo insight novo disponível em: {new Date(nextAvailable).toLocaleDateString("pt-BR")}
        </p>
      )}
    </div>
  );
}