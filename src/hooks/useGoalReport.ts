import { useEffect, useState } from "react";

export interface GoalReportData {
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

export function useGoalReport(refreshKey: number = 0) {
  const [report, setReport] = useState<GoalReportData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL}/goal/report`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setReport)
      .catch(() => setReport(null));
  }, [refreshKey]);

  return report;
}
