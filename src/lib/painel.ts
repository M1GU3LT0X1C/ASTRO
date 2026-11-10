import { api } from "@/lib/api";

// Recursos compartilhados pelos paineis da ONG e do Explorador: agenda, favoritos,
// recompensas e preferencias.

// ===== Agenda =====
export type Compromisso = { id: string; pet: string | null; descricao: string; local: string | null; data: string; hora: string | null };
export type NovoCompromisso = { pet?: string; descricao: string; local?: string; data: string; hora?: string };

/** "09:00:00" -> "09:00" */
export const horaCurta = (hora: string | null) => (hora || "").slice(0, 5);

export const listarAgenda = () => api<Compromisso[]>("/api/agenda");
export const criarCompromisso = (c: NovoCompromisso) => api<Compromisso>("/api/agenda", { method: "POST", body: c });
export const excluirCompromisso = (id: string) => api<void>(`/api/agenda/${encodeURIComponent(id)}`, { method: "DELETE" });

/** Compromissos de hoje em diante, do mais proximo ao mais distante. */
export function proximosCompromissos(itens: Compromisso[]) {
  const agora = new Date();
  return itens
    .filter((c) => new Date(`${c.data}T${horaCurta(c.hora) || "23:59"}`) >= agora)
    .sort((a, b) => (a.data + horaCurta(a.hora)).localeCompare(b.data + horaCurta(b.hora)));
}

// ===== Favoritos =====
export type Favorito = {
  tipo: "pet" | "ong"; alvoId: string; categoria: "pet" | "base" | "clinica";
  nome: string; descricao: string | null; foto: string | null;
};

export const listarFavoritos = () => api<Favorito[]>("/api/favoritos");
export const adicionarFavorito = (tipo: "pet" | "ong", alvoId: string) =>
  api<void>("/api/favoritos", { method: "POST", body: { tipo, alvoId } });
export const removerFavorito = (tipo: "pet" | "ong", alvoId: string) =>
  api<void>(`/api/favoritos/${tipo}/${encodeURIComponent(alvoId)}`, { method: "DELETE" });

// ===== Recompensas =====
export type Cupom = { id: string; titulo: string; descricao: string | null; custo: number };
export type Resgate = { titulo: string; codigo: string; data: string };
export type EstadoRecompensas = {
  pontos: number; checkinHoje: boolean; checkinsSemana: string[]; tarefas: string[];
  cupons: Cupom[]; resgates: Resgate[]; hoje: string;
};

export const buscarRecompensas = () => api<EstadoRecompensas>("/api/recompensas");
export const fazerCheckin = () => api<EstadoRecompensas>("/api/recompensas/checkin", { method: "POST" });
export const concluirTarefa = (codigo: string) =>
  api<EstadoRecompensas>(`/api/recompensas/tarefas/${encodeURIComponent(codigo)}`, { method: "POST" });
export const resgatarCupom = (id: string) =>
  api<Resgate>(`/api/recompensas/cupons/${encodeURIComponent(id)}/resgatar`, { method: "POST" });

// ===== Preferencias (pares chave/valor; booleanos viram "true"/"false") =====
export async function buscarPreferencias<T extends Record<string, boolean | string>>(padrao: T): Promise<T> {
  const salvas = await api<Record<string, string>>("/api/me/preferencias");
  const resultado = { ...padrao };
  (Object.keys(padrao) as (keyof T)[]).forEach((chave) => {
    const valor = salvas[chave as string];
    if (valor === undefined || valor === null) return;
    resultado[chave] = (typeof padrao[chave] === "boolean" ? valor === "true" : valor) as T[keyof T];
  });
  return resultado;
}

export function salvarPreferencias(valores: Record<string, boolean | string>) {
  const corpo = Object.fromEntries(Object.entries(valores).map(([chave, valor]) => [chave, String(valor)]));
  return api<Record<string, string>>("/api/me/preferencias", { method: "PUT", body: corpo });
}
