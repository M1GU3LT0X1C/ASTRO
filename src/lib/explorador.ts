import { api } from "@/lib/api";

// Dados do Explorador: perfil, questionario de adocao e prontuario dos pets dele.

export type PerfilExplorador = {
  nome: string;
  email: string;
  telefone: string | null;
  nascimento: string | null; // yyyy-mm-dd
  endereco: string | null;
  biografia: string | null;
  fotoUrl: string | null;
};

export type Questionario = {
  moradia: string; condicao: string; redes: string; quintal: string; acessoRua: string;
  modeloTrabalho: string; tempoSozinho: string; pessoasCasa: string; moradoresConcordam: string;
  petsResidencia: string; tiposPets: string[]; atualizadoEm?: string | null;
};

export type RegistroSaude = { id: string; descricao: string; criadoEm: string };

export type PetExplorador = {
  id: string; nome: string; microchip: string | null; peso: string | null; castrado: string;
  alergias: string | null; condicao: string | null; foto: string | null;
  vacinas: RegistroSaude[]; exames: RegistroSaude[];
};

export type PetExploradorForm = {
  nome: string; microchip: string; peso: string; castrado: string; alergias: string; condicao: string; fotoUrl: string;
};

export const buscarPerfil = () => api<PerfilExplorador>("/api/me/perfil");
export const salvarPerfil = (perfil: Omit<PerfilExplorador, "email">) =>
  api<PerfilExplorador>("/api/me/perfil", { method: "PUT", body: perfil });

export const buscarQuestionario = () => api<Questionario>("/api/me/questionario");
export const salvarQuestionario = (q: Questionario) =>
  api<Questionario>("/api/me/questionario", { method: "PUT", body: q });

/** O questionario esta completo quando todas as perguntas obrigatorias tem resposta. */
export function questionarioCompleto(q: Questionario | null) {
  if (!q) return false;
  const obrigatorias: (keyof Questionario)[] = ["moradia", "condicao", "redes", "quintal", "acessoRua",
    "modeloTrabalho", "tempoSozinho", "pessoasCasa", "moradoresConcordam", "petsResidencia"];
  return obrigatorias.every((campo) => !!q[campo]);
}

export const listarPetsTutor = () => api<PetExplorador[]>("/api/tutor/pets");
export const cadastrarPetTutor = (form: PetExploradorForm) =>
  api<PetExplorador>("/api/tutor/pets", { method: "POST", body: form });
export const atualizarPetTutor = (id: string, form: PetExploradorForm) =>
  api<PetExplorador>(`/api/tutor/pets/${encodeURIComponent(id)}`, { method: "PUT", body: form });
export const excluirPetTutor = (id: string) =>
  api<void>(`/api/tutor/pets/${encodeURIComponent(id)}`, { method: "DELETE" });
export const adicionarRegistroSaude = (petId: string, tipo: "vacina" | "exame", descricao: string) =>
  api<PetExplorador>(`/api/tutor/pets/${encodeURIComponent(petId)}/registros`, { method: "POST", body: { tipo, descricao } });
export const removerRegistroSaude = (petId: string, registroId: string) =>
  api<PetExplorador>(`/api/tutor/pets/${encodeURIComponent(petId)}/registros/${encodeURIComponent(registroId)}`, { method: "DELETE" });
