// Chamada HTTP ao back-end Java, usada tanto no navegador (api.ts) quanto no servidor (api-servidor.ts).
// O back identifica o usuario pelo token de login do Supabase, enviado como Bearer.

export class ErroApi extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type OpcoesApi = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown };

// No plano gratuito do Render o back "dorme" e leva ate ~2 min para acordar;
// sem limite, a tela ficaria esperando para sempre.
const TEMPO_LIMITE_MS = 150_000;

// tira a barra final da URL base: "https://x.com/" + "/api/me" viraria "//api/me", que o Spring recusa (400)
export const montarUrl = (baseUrl: string, caminho: string) => baseUrl.replace(/\/+$/, "") + caminho;

export async function chamarApi<T>(baseUrl: string, caminho: string, token: string | undefined, opcoes: OpcoesApi = {}): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(montarUrl(baseUrl, caminho), {
      method: opcoes.method ?? "GET",
      headers: {
        ...(opcoes.body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
  } catch (err) {
    const tempoEsgotado = err instanceof DOMException && err.name === "TimeoutError";
    throw new ErroApi(0, tempoEsgotado
      ? "O servidor demorou demais para responder. Tente novamente em instantes."
      : "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.");
  }

  if (!resposta.ok) {
    let mensagem = `Erro ${resposta.status} ao falar com o servidor`;
    try {
      const corpo = await resposta.json();
      mensagem = corpo.message || corpo.error || mensagem;
    } catch {
      // resposta sem JSON: fica a mensagem padrao
    }
    throw new ErroApi(resposta.status, mensagem);
  }
  return (resposta.status === 204 ? undefined : await resposta.json()) as T;
}
