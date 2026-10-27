/** Lê o campo "exp" (segundos desde 1970) do payload de um JWT, sem validar a assinatura. */
export function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const exp = JSON.parse(atob(padded)).exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

/** True se o token já expirou (ou expira em até `skewSeconds`) ou se não dá para ler. A validade real é sempre decidida pelo servidor. */
export function isTokenExpired(token: string, nowMs: number = Date.now(), skewSeconds: number = 30): boolean {
  const exp = decodeJwtExp(token);
  if (exp === null) return true;
  return exp * 1000 <= nowMs + skewSeconds * 1000;
}
