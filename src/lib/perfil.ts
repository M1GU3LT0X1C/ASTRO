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

export const buscarMe = () => api<Me>("/api/me");

// Cria a ONG da conta se ainda nao existir (o back recusa para tutores).
export const garantirOng = (nome: string, tipoPerfil?: string) =>
  api<Me>("/api/me/ong", { method: "POST", body: { nome, tipoPerfil } });

// Tutor que entra pelo Google nao passa pelo trigger do cadastro (o Google nao envia o perfil).
export const garantirTutor = (nome: string) =>
  api<Me>("/api/me/tutor", { method: "POST", body: { nome } });

export const definirLogo = (url: string) =>
  api<Me>("/api/me/logo", { method: "PUT", body: { url } });
