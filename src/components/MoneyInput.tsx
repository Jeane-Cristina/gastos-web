import { useId, useState } from "react";
import { formatBRL } from "../utils/formatBRL";
import { parseMoney } from "../utils/parseMoney";

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}

/** Campo de valor em reais com rótulo visível: mostra "R$ 1.500,00" ao sair do campo e o número cru ao editar. */
export function MoneyInput({ label, value, onChange, hint }: Props) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");

  const display = focused ? text : value ? formatBRL(value) : "";

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode="decimal"
        value={display}
        placeholder="R$ 0,00"
        onFocus={() => {
          setText(value ? String(value).replace(".", ",") : "");
          setFocused(true);
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseMoney(e.target.value));
        }}
      />
      {hint && <small className="field__hint">{hint}</small>}
    </div>
  );
}
