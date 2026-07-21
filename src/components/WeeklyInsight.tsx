import { useState } from "react";
import { generateInsight } from "../services/profileApi";

export function WeeklyInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateInsight();
      setInsight(result.insight);
      setNextAvailable(result.nextAvailableAt);
    } catch (err) {
      setInsight("Não foi possível gerar o insight agora. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Insight da semana</h2>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Gerando..." : "Ver meu insight"}
      </button>
      {insight && <p>{insight}</p>}
      {nextAvailable && (
        <p>
          Próximo insight novo disponível em: {new Date(nextAvailable).toLocaleDateString("pt-BR")}
        </p>
      )}
    </div>
  );
}