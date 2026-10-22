import { useState, useEffect, useId } from "react";
import { getProfile, saveProfile, type FinancialProfile } from "../services/profileApi";
import { MoneyInput } from "./MoneyInput";
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
  const shortId = useId();
  const mediumId = useId();
  const longId = useId();

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

      <MoneyInput
        label="Renda mensal"
        value={profile.monthlyIncome}
        onChange={(monthlyIncome) => setProfile({ ...profile, monthlyIncome })}
      />
      <MoneyInput
        label="Quanto quero guardar por mês"
        hint="Base da sua meta mensal de economia"
        value={profile.savingsGoal}
        onChange={(savingsGoal) => setProfile({ ...profile, savingsGoal })}
      />
      <MoneyInput
        label="Quanto já tenho guardado"
        value={profile.currentSavings}
        onChange={(currentSavings) => setProfile({ ...profile, currentSavings })}
      />

      <div className="field">
        <label htmlFor={shortId}>Objetivo de curto prazo</label>
        <input
          id={shortId}
          placeholder="ex: viagem em 3 meses"
          value={profile.shortTermGoal}
          onChange={(e) => setProfile({ ...profile, shortTermGoal: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor={mediumId}>Objetivo de médio prazo</label>
        <input
          id={mediumId}
          placeholder="ex: trocar de carro em 2 anos"
          value={profile.mediumTermGoal}
          onChange={(e) => setProfile({ ...profile, mediumTermGoal: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor={longId}>Objetivo de longo prazo</label>
        <input
          id={longId}
          placeholder="ex: entrada de um imóvel"
          value={profile.longTermGoal}
          onChange={(e) => setProfile({ ...profile, longTermGoal: e.target.value })}
        />
      </div>

      <button type="submit">Salvar</button>
      {saved && <p role="status">Perfil salvo!</p>}
    </form>
  );
}
