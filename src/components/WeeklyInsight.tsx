import { useState, useEffect } from "react";
import { generateInsight, getLatestInsight } from "../services/profileApi";
import "./WeeklyInsight.css";
import ReactMarkdown from "react-markdown";

export function WeeklyInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const canGenerateNew = nextAvailable ? new Date(nextAvailable) <= new Date() : true;
  const [period, setPeriod] = useState("monthly");

  // ajuste handleGenerate:
  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateInsight(note, period);
      setInsight(result.insight);
      setNextAvailable(result.nextAvailableAt);
    } catch (err) {
      setInsight("Não foi possível gerar o insight agora. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getLatestInsight().then((result) => {
      if (result.insight) {
        setInsight(result.insight);
        setNextAvailable(result.nextAvailableAt);
      }
    });
  }, []);

  function renderInsight(text: string) {
    const sections = text.split(/(?=DETALHAMENTO SEMANAL|ONDE ECONOMIZAR|ESTRATÉGIA PARA SUAS COMPRAS|SUGESTÃO PRÁTICA)/);

    return sections.map((section, i) => {
      const match = section.match(/^([A-ZÀ-Ú ]+):?\s*([\s\S]*)/);
      if (!match) return null;

      const [, title, body] = match;

      return (
        <div key={i} className="insight-section">
          <h4>{title.trim()}</h4>
          <ReactMarkdown>{body.trim()}</ReactMarkdown>
        </div>
      );
    });
  }

  return (
    <div className="insight">
      <h2 className="insight__title">Insight da semana</h2>

      {canGenerateNew && insight && (
        <div className="insight__banner">
          ✨ Um novo insight já está disponível para esta semana!
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Alguma observação pro insight desta semana? (ex: 'tive um gasto extra com viagem')"
      />
      <select value={period} onChange={(e) => setPeriod(e.target.value)} className="insight__period-select">
        <option value="weekly">Esta semana</option>
        <option value="monthly">Este mês</option>
        <option value="quarterly">Últimos 3 meses</option>
      </select>
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