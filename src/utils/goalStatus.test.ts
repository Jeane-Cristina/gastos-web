import { describe, it, expect } from "vitest";
import { getGoalLevel, combinedScore } from "./goalStatus";

describe("getGoalLevel", () => {
  it("classifica por faixas quando a meta existe", () => {
    expect(getGoalLevel(90, 1000)).toBe("good");
    expect(getGoalLevel(50, 1000)).toBe("warn");
    expect(getGoalLevel(10, 1000)).toBe("bad");
  });

  it("meta zerada vira 'unset', independente do percentual", () => {
    expect(getGoalLevel(0, 0)).toBe("unset");
    expect(getGoalLevel(100, 0)).toBe("unset");
  });

  it("sem informação de meta, usa só o percentual", () => {
    expect(getGoalLevel(85)).toBe("good");
  });
});

describe("combinedScore", () => {
  const base = {
    monthlySavingsGoal: 500,
    monthlyProgressPercent: 100,
    annualSavingsGoal: 6000,
    annualProgressPercent: 20,
  };

  it("faz a média das metas definidas", () => {
    expect(combinedScore(base)).toBe(60);
  });

  it("ignora a meta anual zerada", () => {
    expect(combinedScore({ ...base, annualSavingsGoal: 0 })).toBe(100);
  });

  it("retorna null quando nenhuma meta foi definida", () => {
    expect(combinedScore({ ...base, monthlySavingsGoal: 0, annualSavingsGoal: 0 })).toBeNull();
  });
});
