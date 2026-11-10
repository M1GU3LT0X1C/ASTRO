import { api } from "@/lib/api";
import type { Questionario } from "@/lib/explorador";

export type StatusAdocao = "PENDENTE" | "EM_ANALISE" | "ENTREVISTA" | "APROVADA" | "REPROVADA" | "ADOCAO_CONCLUIDA" | "CANCELADA";

export type Solicitacao = {
  id: string;
  petId: string;
  nomePet: string;
  fotoPet: string | null;
  parceiroId: string;
  nomeOng: string;
  ongUsuarioId: string | null;
  tutorId: string;
  nomeTutor: string;
  emailTutor: string | null;
  telefoneTutor: string | null;
  mensagem: string | null;
  status: StatusAdocao;
  criadoEm: string;
  questionario: Questionario | null;
};

export const ROTULO_STATUS: Record<StatusAdocao, string> = {
  PENDENTE: "Solicitação enviada",
  EM_ANALISE: "Em análise",
  ENTREVISTA: "Entrevista",
  APROVADA: "Aprovada",
  REPROVADA: "Não aprovada",
  ADOCAO_CONCLUIDA: "Adoção concluída",
  CANCELADA: "Cancelada",
};

export const EM_ANDAMENTO: StatusAdocao[] = ["PENDENTE", "EM_ANALISE", "ENTREVISTA", "APROVADA"];

export const solicitarAdocao = (petId: string, mensagem?: string) =>
  api<Solicitacao>("/api/adocoes", { method: "POST", body: { petId, mensagem } });

export const minhasSolicitacoes = () => api<Solicitacao[]>("/api/adocoes/minhas");
export const solicitacoesRecebidas = () => api<Solicitacao[]>("/api/adocoes/recebidas");

export const decidirSolicitacao = (id: string, decisao: Exclude<StatusAdocao, "PENDENTE" | "CANCELADA">) =>
  api<Solicitacao>(`/api/adocoes/${encodeURIComponent(id)}?decisao=${decisao}`, { method: "PATCH" });

export const cancelarSolicitacao = (id: string) =>
  api<Solicitacao>(`/api/adocoes/${encodeURIComponent(id)}/cancelar`, { method: "PATCH" });
