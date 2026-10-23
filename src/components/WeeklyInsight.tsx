import { useState, useEffect } from "react";
import { generateInsight, getLatestInsight } from "../services/profileApi";
import "./WeeklyInsight.css";
import ReactMarkdown from "react-markdown";
import { cleanInsight, INSIGHT_SECTIONS } from "../utils/cleanInsight";

const CACHE_DAYS = 7;

const PERIOD_LABELS: Record<string, string> = {
  weekly: "esta semana",
  monthly: "este mês",
  quarterly: "os últimos 3 meses",
};
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function WeeklyInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [shownPeriod, setShownPeriod] = useState<string | null>(null);

  const canGenerateNew = nextAvailable ? new Date(nextAvailable) <= new Date() : true;
  const nextIsFuture = nextAvailable !== null && !canGenerateNew;
  const generatedAt = nextAvailable ? new Date(new Date(nextAvailable).getTime() - CACHE_DAYS * DAY_MS).toISOString() : null;

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateInsight(note, period);
      setInsight(result.insight);
      setNextAvailable(result.nextAvailableAt);
      setFromCache(result.cached);
      setShownPeriod(result.period ?? period);
    } catch {
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
        if (result.period) {
          setShownPeriod(result.period);
          setPeriod(result.period);
        }
      }
    });
  }, []);

  function renderInsight(text: string) {
    const clean = cleanInsight(text);
    const sections = clean.split(new RegExp(`(?=${INSIGHT_SECTIONS.join("|")})`));

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
      <h2 className="insight__title">Insight de IA</h2>

      {canGenerateNew && insight && (
        <div className="insight__banner">
          ✨ Já é possível gerar um novo insight. O texto abaixo é de {generatedAt ? formatDate(generatedAt) : "uma data anterior"}.
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Alguma observação pro insight? (ex: 'tive um gasto extra com viagem')"
      />
      <select value={period} onChange={(e) => setPeriod(e.target.value)} className="insight__period-select">
        <option value="weekly">Esta semana</option>
        <option value="monthly">Este mês</option>
        <option value="quarterly">Últimos 3 meses</option>
      </select>
      <button className="insight__generate" onClick={handleGenerate} disabled={loading}>
        {loading ? "Gerando..." : "Ver meu insight"}
      </button>

      {insight && generatedAt && (
        <p className="insight__next-available">
          Gerado em {formatDate(generatedAt)}.
          {shownPeriod && PERIOD_LABELS[shownPeriod] && ` Período analisado: ${PERIOD_LABELS[shownPeriod]}.`}
          {fromCache && " Você já gerou um insight para este período nos últimos 7 dias, então este é o mesmo texto."}
        </p>
      )}

      {insight && shownPeriod && shownPeriod !== period && PERIOD_LABELS[period] && (
        <p className="insight__next-available">
          Este texto é de {PERIOD_LABELS[shownPeriod]}. Clique em "Ver meu insight" para gerar o de {PERIOD_LABELS[period]}.
        </p>
      )}

      {insight && <div>{renderInsight(insight)}</div>}

      {nextIsFuture && nextAvailable && (
        <p className="insight__next-available">
          Próximo insight novo disponível em: {formatDate(nextAvailable)}
        </p>
      )}
    </div>
  );
}
