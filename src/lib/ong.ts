import { api } from "@/lib/api";

// Perfil da ONG (/api/ongs) como o back devolve (OngResponse).
export type StatusVagas = "com" | "lotado" | "superlotado";

export type Ong = {
  id: string;
  usuarioId: string | null;
  nomeOrganizacao: string;
  tipoPerfil: string | null;
  descricao: string | null;
  logoUrl: string | null;
  capaUrl: string | null;
  endereco: string | null;
  ocultarEndereco: boolean;
  cidade: string | null;
  estado: string | null;
  regiao: string | null;
  raioAtuacao: number | null;
  statusVagas: StatusVagas;
  capacidade: number | null;
  emailPublico: string | null;
  instagram: string | null;
  facebook: string | null;
  site: string | null;
  whatsapp: string | null;
  idadeMinima: number | null;
  moradiaAceita: "qualquer" | "casa" | "apartamento";
  exigeEntrevista: boolean;
  exigeVisita: boolean;
  exigeTermo: boolean;
  verificada: boolean;
  statusVerificacao: "nao_enviado" | "pendente" | "aprovado" | "reprovado" | null;
  mediaAvaliacao: number;
  totalAvaliacoes: number;
  visualizacoes: number;
};

// Campos aceitos no PUT /api/ongs/me (nulos/ausentes mantem o valor atual)
export type OngEdicao = Partial<Omit<Ong, "id" | "usuarioId" | "tipoPerfil" | "logoUrl" | "regiao" | "verificada"
  | "statusVerificacao" | "mediaAvaliacao" | "totalAvaliacoes" | "visualizacoes">> & { nomeOrganizacao: string };

export type Avaliacao = { id: string; autor: string; nota: number; comentario: string | null; criadoEm: string };

export type Metricas = {
  totalPets: number; disponiveis: number; reservados: number; adotados: number;
  capacidade: number; statusVagas: StatusVagas;
  visualizacoesTotal: number; visualizacoesMes: number; visualizacoesMesAnterior: number;
  alcance: { data: string; total: number }[];
  adocoesConcluidas: number; solicitacoesPendentes: number; interessesSemana: number;
  pets: { id: string; nome: string; foto: string | null; status: string; visualizacoes: number; favoritos: number; solicitacoes: number }[];
};

export const buscarMinhaOng = () => api<Ong>("/api/ongs/me");
export const salvarMinhaOng = (dados: OngEdicao) => api<Ong>("/api/ongs/me", { method: "PUT", body: dados });
export const registrarDocumento = (caminho: string) =>
  api<Ong>("/api/ongs/me/documento", { method: "PUT", body: { caminho } });
export const buscarMetricas = () => api<Metricas>("/api/ongs/me/metricas");

export function listarOngs(filtros: { tipo?: "bases" | "clinicas"; endereco?: string; ordem?: "visitas" | "avaliacao"; limite?: number }) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== "") params.set(chave, String(valor));
  });
  return api<Ong[]>(`/api/ongs?${params}`);
}

export const buscarOng = (id: string) => api<Ong>(`/api/ongs/${encodeURIComponent(id)}`);
export const listarAvaliacoes = (id: string) => api<Avaliacao[]>(`/api/ongs/${encodeURIComponent(id)}/avaliacoes`);
export const avaliarOng = (id: string, nota: number, comentario?: string) =>
  api<void>(`/api/ongs/${encodeURIComponent(id)}/avaliacoes`, { method: "POST", body: { nota, comentario } });

/** Conta uma visita a pagina publica de um pet ou ONG (falha silenciosa). */
export function registrarVisualizacao(tipo: "pet" | "ong", alvoId: string) {
  api<void>("/api/visualizacoes", { method: "POST", body: { tipo, alvoId } }).catch(() => {});
}

export const ROTULO_TIPO_PERFIL: Record<string, string> = {
  guardiao: "Guardião de Órbita",
  "base-estelar": "Base Estelar",
  estacao: "Estação de Cuidado",
};

export function localizacaoOng(ong: Pick<Ong, "cidade" | "estado" | "regiao">) {
  const cidade = ong.cidade || (ong.regiao && !/^[\d-]+$/.test(ong.regiao) ? ong.regiao : "");
  return [cidade, ong.estado].filter(Boolean).join(" - ") || "Localização não informada";
}
