import { useState, useEffect } from "react";
import { getProfile, saveProfile, type FinancialProfile } from "../services/profileApi";
import "./FinancialProfileForm.css";

export function FinancialProfileForm() {
  const [profile, setProfile] = useState<FinancialProfile>({
    monthlyIncome: 0,
    savingsGoal: 0,
    shortTermGoal: "",
    mediumTermGoal: "",
    longTermGoal: "",
    currentSavings: 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile().then((data) => {
      if (data) setProfile(data);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h2>Meu perfil financeiro</h2>
      <input
        type="number"
        placeholder="Renda mensal"
        value={profile.monthlyIncome || ""}
        onChange={(e) => setProfile({ ...profile, monthlyIncome: parseFloat(e.target.value) || 0 })}
      />
      <input
        type="number"
        placeholder="Quanto quero guardar por mês"
        value={profile.savingsGoal || ""}
        onChange={(e) => setProfile({ ...profile, savingsGoal: parseFloat(e.target.value) || 0 })}
      />
      <input
        placeholder="Objetivo de curto prazo (ex: viagem em 3 meses)"
        value={profile.shortTermGoal}
        onChange={(e) => setProfile({ ...profile, shortTermGoal: e.target.value })}
      />
      <input
        placeholder="Objetivo de médio prazo (ex: trocar de carro em 2 anos)"
        value={profile.mediumTermGoal}
        onChange={(e) => setProfile({ ...profile, mediumTermGoal: e.target.value })}
      />
      <input
        placeholder="Objetivo de longo prazo (ex: entrada de um imóvel)"
        value={profile.longTermGoal}
        onChange={(e) => setProfile({ ...profile, longTermGoal: e.target.value })}
      />
      <input
        type="number"
        placeholder="Quanto já tenho guardado"
        value={profile.currentSavings || ""}
        onChange={(e) => setProfile({ ...profile, currentSavings: parseFloat(e.target.value) || 0 })}
      />
      <button type="submit">Salvar</button>
      {saved && <p>Perfil salvo!</p>}
    </form>
  );
}