import { api } from "@/lib/api";

// Conta logada, como o back-end devolve em /api/me.
// tipo = null: conta sem perfil (antiga ou via Google), tratada como ONG.
export type Me = {
  id: string;
  tipo: "EXPLORADOR" | "GUARDIAO" | "BASE_ESTELAR" | "ESTACAO" | null;
  tutor: boolean;
  ong: { id: string; nomeOrganizacao: string; tipoPerfil: string | null } | null;
  parceiro: { id: string; logoUrl: string | null } | null;
};

let promessaMeEmAndamento: Promise<Me> | null = null;
let cacheMeRecente: { valor: Me; expiraEm: number } | null = null;

export function limparCacheMe() {
  promessaMeEmAndamento = null;
  cacheMeRecente = null;
}

export const buscarMe = (opcoes?: { timeoutMs?: number; forcar?: boolean }): Promise<Me> => {
  if (!opcoes?.forcar && cacheMeRecente && Date.now() < cacheMeRecente.expiraEm) {
    return Promise.resolve(cacheMeRecente.valor);
  }
  if (!opcoes?.forcar && !opcoes?.timeoutMs && promessaMeEmAndamento) {
    return promessaMeEmAndamento;
  }

  const requisicao = api<Me>("/api/me", opcoes?.timeoutMs ? { timeoutMs: opcoes.timeoutMs } : undefined)
    .then((me) => {
      cacheMeRecente = { valor: me, expiraEm: Date.now() + 5000 };
      return me;
    })
    .finally(() => {
      if (promessaMeEmAndamento === requisicao) {
        promessaMeEmAndamento = null;
      }
    });

  if (!opcoes?.timeoutMs) {
    promessaMeEmAndamento = requisicao;
  }
  return requisicao;
};

// Cria a ONG da conta se ainda nao existir (o back recusa para tutores).
export const garantirOng = (nome: string, tipoPerfil?: string) =>
  api<Me>("/api/me/ong", { method: "POST", body: { nome, tipoPerfil } }).then((me) => {
    cacheMeRecente = { valor: me, expiraEm: Date.now() + 5000 };
    return me;
  });

// Tutor que entra pelo Google nao passa pelo trigger do cadastro (o Google nao envia o perfil).
export const garantirTutor = (nome: string) =>
  api<Me>("/api/me/tutor", { method: "POST", body: { nome } }).then((me) => {
    cacheMeRecente = { valor: me, expiraEm: Date.now() + 5000 };
    return me;
  });

export const definirLogo = (url: string) =>
  api<Me>("/api/me/logo", { method: "PUT", body: { url } }).then((me) => {
    cacheMeRecente = { valor: me, expiraEm: Date.now() + 5000 };
    return me;
  });
