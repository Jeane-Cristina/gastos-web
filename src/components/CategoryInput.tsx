import { useId } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  categories?: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
}

/** Campo de categoria com sugestões das categorias já usadas (ainda permite criar uma nova). */
export function CategoryInput({ value, onChange, categories = [], placeholder = "Categoria", required, className, autoFocus }: Props) {
  const listId = useId();

  return (
    <>
      <input
        className={className}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
      />
      <datalist id={listId}>
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
}
