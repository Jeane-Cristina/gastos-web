import { useState, useEffect } from "react";
import "./ColdStartBanner.css";

interface Props {
  loading: boolean;
}

export function ColdStartBanner({ loading }: Props) {
  const [showBanner, setShowBanner] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) {
      setShowBanner(false);
      setElapsed(0);
      return;
    }

    const delayTimer = setTimeout(() => setShowBanner(true), 2000);
    const tickTimer = setInterval(() => setElapsed((e) => e + 1), 1000);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(tickTimer);
    };
  }, [loading]);

  if (!showBanner) return null;

  return (
    <div className="cold-start-banner">
      <span className="cold-start-banner__spinner" />
      {elapsed < 20
        ? "Conectando ao servidor..."
        : "O servidor estava inativo e está iniciando — pode levar até 1 minuto na primeira vez do dia."}
    </div>
  );
}