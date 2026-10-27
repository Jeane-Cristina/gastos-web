import { describe, expect, it } from "vitest";
import { decodeJwtExp, isTokenExpired } from "./jwt";

function fakeJwt(payload: object): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.assinatura`;
}

describe("jwt", () => {
  const nowMs = 1_800_000_000_000;
  const nowSec = nowMs / 1000;

  it("lê o exp do payload", () => {
    expect(decodeJwtExp(fakeJwt({ exp: nowSec + 100 }))).toBe(nowSec + 100);
  });

  it("devolve null para token malformado ou sem exp", () => {
    expect(decodeJwtExp("isso-nao-e-um-jwt")).toBeNull();
    expect(decodeJwtExp(fakeJwt({ sub: "1" }))).toBeNull();
  });

  it("token válido por mais de 30 s não está expirado", () => {
    expect(isTokenExpired(fakeJwt({ exp: nowSec + 3600 }), nowMs)).toBe(false);
  });

  it("token vencido está expirado", () => {
    expect(isTokenExpired(fakeJwt({ exp: nowSec - 1 }), nowMs)).toBe(true);
  });

  it("token que vence em menos de 30 s já conta como expirado", () => {
    expect(isTokenExpired(fakeJwt({ exp: nowSec + 10 }), nowMs)).toBe(true);
  });

  it("token ilegível conta como expirado", () => {
    expect(isTokenExpired("lixo", nowMs)).toBe(true);
  });

  it("aceita nomes de usuário com acento no payload", () => {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ name: "José", exp: nowSec + 3600 }))))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(isTokenExpired(`x.${payload}.y`, nowMs)).toBe(false);
  });
});
