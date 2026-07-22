import { useEffect, useState } from "react";

interface GoalReportData {
  monthlySpent: number;
  monthlySavingsGoal: number;
  monthlySavingsAchieved: number;
  monthlyGoalMet: boolean;
  annualSpent: number;
  annualSavingsGoal: number;
  annualSavingsAchieved: number;
  annualGoalMet: boolean;
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
    </div>
  );
}