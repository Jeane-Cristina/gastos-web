import { useEffect, useState } from "react";
import { GoalRadar } from "./GoalRadar";
import { StatusBadge } from "./StatusBadge";

interface GoalReportData {
  monthlySpent: number;
  monthlySavingsGoal: number;
  monthlySavingsAchieved: number;
  monthlyGoalMet: boolean;
  monthlyProgressPercent: number;
  annualSpent: number;
  annualSavingsGoal: number;
  annualSavingsAchieved: number;
  annualGoalMet: boolean;
  annualProgressPercent: number;
}

export function GoalReport() {
  const [report, setReport] = useState<GoalReportData | null>(null);

  useEffect(() => {
    const url = `${import.meta.env.VITE_API_URL}/goal/report`;
    const token = localStorage.getItem("token");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setReport);
  }, []);

  if (!report) return null;

  return (
    <div>
      <h2>Relatório de metas</h2>
      <p>
        Mensal: {report.monthlyGoalMet ? "✅ Meta atingida" : "⚠️ Abaixo da meta"} —
        economizou R$ {report.monthlySavingsAchieved.toFixed(2)} de R$ {report.monthlySavingsGoal.toFixed(2)}
      </p>
      <p>
        Anual: {report.annualGoalMet ? "✅ Meta atingida" : "⚠️ Abaixo da meta"} —
        economizou R$ {report.annualSavingsAchieved.toFixed(2)} de R$ {report.annualSavingsGoal.toFixed(2)}
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <GoalRadar label="Meta mensal" percent={report.monthlyProgressPercent} />
        <GoalRadar label="Meta anual" percent={report.annualProgressPercent} />
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <StatusBadge label="Economia mensal" percent={report.monthlyProgressPercent} />
        <StatusBadge label="Economia anual" percent={report.annualProgressPercent} />
      </div>
    </div>
  );
}