import { api } from "@/lib/api";

// Pets passam pelo back-end (/api/pets). Este modulo traduz entre os valores usados nas telas
// (cachorro, pequeno, macho...) e os da API (CAO, PEQUENO, MACHO...).

const ESPECIE_PARA_API: Record<string, string> = { cachorro: "CAO", gato: "GATO" };
const ESPECIE_DA_API: Record<string, string> = { CAO: "cachorro", GATO: "gato", OUTRO: "outro" };
const PORTE_PARA_API: Record<string, string> = { pequeno: "PEQUENO", medio: "MEDIO", grande: "GRANDE" };
const PORTE_DA_API: Record<string, string> = { PEQUENO: "pequeno", MEDIO: "medio", GRANDE: "grande" };

// flags e textos livres do formulario que nao tem campo proprio vao em "caracteristicas"
const TAG_VERMIFUGADO = "vermifugado";
const TAG_CUIDADOS = "cuidados_especiais";
const PREFIXO_RACA = "raca:";
const PREFIXO_CONVIVENCIA = "convive:";

/** Temperamentos do formulario de Novo Pet -> rotulos dos filtros da busca publica. */
export const TEMPERAMENTOS: Record<string, string> = {
  energetico: "Energético", timido: "Tímido", preguicoso: "Preguiçoso", medroso: "Medroso",
  sociavel: "Sociável", afetivo: "Carinhoso", apegado: "Apegado", curioso: "Curioso",
  protetor: "Protetor", independente: "Independente",
};

/** Convivencia (tags "convive:*") -> rotulos dos filtros da busca publica. */
export const CONVIVENCIAS: Record<string, string> = {
  caes: "Se dá bem com cães",
  gatos: "Se dá bem com gatos",
  criancas: "Se dá bem com crianças",
  unico: "Precisa ser o único pet da casa",
};

export const STATUS_PET: Record<string, string> = {
  disponivel: "Disponível", reservado: "Reservado", em_tratamento: "Em tratamento", adotado: "Adotado",
};

export type AnimalForm = {
  nome: string; idade: string; raca: string;
  porte: string; sexo: string; especie: string;
  castrado: boolean; vacinado: boolean; vermifugado: boolean; cuidados: boolean;
  temperamentos: string[]; fotoUrl: string;
  convivencia?: string[]; historia?: string;
  microchip?: string; tempoAbrigo?: string; detalhesCuidados?: string; recomendacoes?: string;
  urgencia?: Urgencia;
};

export type Urgencia = "normal" | "prioritaria" | "critica";
export const URGENCIAS: Record<Urgencia, string> = {
  normal: "Normal", prioritaria: "Adoção prioritária", critica: "Caso crítico",
};

export type AnimalTela = {
  id: string; nome: string; sexo: string; idade: number; raca: string;
  especie: string; porte: string; foto_url: string; status: string;
  castrado: boolean; vacinado: boolean; vermifugado: boolean;
  cuidados_especiais: boolean; temperamentos: string[]; convivencia: string[];
  historia: string; created_at: string;
  ong_id: string | null; ong_usuario_id: string | null; nome_ong: string; logo_ong: string;
  cidade: string; estado: string;
  microchip: string; tempo_abrigo: string; detalhes_cuidados: string; recomendacoes: string; urgencia: Urgencia;
};

// PetResponse do back-end
type PetApi = {
  id: string; parceiroId: string; nomeParceiro: string; logoParceiro: string | null;
  ongId: string | null; ongUsuarioId: string | null; cidade: string | null; estado: string | null;
  nome: string; especie: string; idade: string | null; porte: string | null; sexo: string | null; historia: string | null;
  caracteristicas: string[] | null; vacinado: boolean | null; castrado: boolean | null;
  fotos: string[] | null; status: string; criadoEm: string;
  microchip: string | null; tempoAbrigo: string | null; detalhesCuidados: string | null;
  recomendacoes: string | null; urgencia: string | null;
};

function paraApi(form: AnimalForm) {
  return {
    nome: form.nome,
    especie: ESPECIE_PARA_API[form.especie] || "OUTRO",
    porte: PORTE_PARA_API[form.porte] || "MEDIO",
    sexo: form.sexo === "femea" ? "FEMEA" : "MACHO",
    idade: form.idade,
    historia: form.historia?.trim() || null,
    castrado: form.castrado,
    vacinado: form.vacinado,
    fotos: form.fotoUrl ? [form.fotoUrl] : [],
    microchip: form.microchip?.trim() || null,
    tempoAbrigo: form.tempoAbrigo?.trim() || null,
    detalhesCuidados: form.detalhesCuidados?.trim() || null,
    recomendacoes: form.recomendacoes?.trim() || null,
    urgencia: form.urgencia || "normal",
    caracteristicas: [
      ...form.temperamentos,
      ...(form.convivencia || []).map((c) => PREFIXO_CONVIVENCIA + c),
      ...(form.vermifugado ? [TAG_VERMIFUGADO] : []),
      ...(form.cuidados ? [TAG_CUIDADOS] : []),
      ...(form.raca ? [PREFIXO_RACA + form.raca] : []),
    ],
  };
}

function daApi(pet: PetApi): AnimalTela {
  const caracteristicas = pet.caracteristicas || [];
  const raca = caracteristicas.find((c) => c.startsWith(PREFIXO_RACA))?.slice(PREFIXO_RACA.length) || "";
  return {
    id: pet.id,
    nome: pet.nome,
    sexo: (pet.sexo || "").toLowerCase(),
    idade: parseInt(pet.idade ?? "", 10) || 0, // texto livre no banco, ex.: "2 anos"
    raca,
    especie: ESPECIE_DA_API[pet.especie] || "",
    porte: (pet.porte && PORTE_DA_API[pet.porte]) || "",
    foto_url: pet.fotos?.[0] || "",
    status: pet.status.toLowerCase(),
    castrado: !!pet.castrado,
    vacinado: !!pet.vacinado,
    vermifugado: caracteristicas.includes(TAG_VERMIFUGADO),
    cuidados_especiais: caracteristicas.includes(TAG_CUIDADOS),
    temperamentos: caracteristicas.filter((c) => c !== TAG_VERMIFUGADO && c !== TAG_CUIDADOS
      && !c.startsWith(PREFIXO_RACA) && !c.startsWith(PREFIXO_CONVIVENCIA)),
    convivencia: caracteristicas.filter((c) => c.startsWith(PREFIXO_CONVIVENCIA)).map((c) => c.slice(PREFIXO_CONVIVENCIA.length)),
    historia: pet.historia || "",
    created_at: pet.criadoEm,
    ong_id: pet.ongId,
    ong_usuario_id: pet.ongUsuarioId,
    nome_ong: pet.nomeParceiro,
    logo_ong: pet.logoParceiro || "",
    cidade: pet.cidade && !/^[\d-]+$/.test(pet.cidade) ? pet.cidade : "",
    estado: pet.estado || "",
    microchip: pet.microchip || "",
    tempo_abrigo: pet.tempoAbrigo || "",
    detalhes_cuidados: pet.detalhesCuidados || "",
    recomendacoes: pet.recomendacoes || "",
    urgencia: (pet.urgencia as Urgencia) || "normal",
  };
}

/** Formulario a partir de um pet ja cadastrado (edicao). */
export function paraFormulario(pet: AnimalTela): AnimalForm {
  return {
    nome: pet.nome, idade: String(pet.idade || ""), raca: pet.raca,
    porte: pet.porte, sexo: pet.sexo, especie: pet.especie,
    castrado: pet.castrado, vacinado: pet.vacinado, vermifugado: pet.vermifugado, cuidados: pet.cuidados_especiais,
    temperamentos: pet.temperamentos, fotoUrl: pet.foto_url, convivencia: pet.convivencia, historia: pet.historia,
    microchip: pet.microchip, tempoAbrigo: pet.tempo_abrigo, detalhesCuidados: pet.detalhes_cuidados,
    recomendacoes: pet.recomendacoes, urgencia: pet.urgencia,
  };
}

// O back cria o parceiro (dono dos animais no banco) da ONG na primeira vez.
export const cadastrarAnimal = (form: AnimalForm) =>
  api<PetApi>("/api/pets", { method: "POST", body: paraApi(form) });

export const atualizarAnimal = (id: string, form: AnimalForm) =>
  api<PetApi>(`/api/pets/${encodeURIComponent(id)}`, { method: "PUT", body: paraApi(form) });

export const excluirAnimal = (id: string) =>
  api<void>(`/api/pets/${encodeURIComponent(id)}`, { method: "DELETE" });

export async function alterarStatusAnimal(id: string, status: "disponivel" | "reservado" | "em_tratamento" | "adotado") {
  return daApi(await api<PetApi>(`/api/pets/${encodeURIComponent(id)}/status?status=${status.toUpperCase()}`, { method: "PATCH" }));
}

export async function buscarAnimal(id: string): Promise<AnimalTela> {
  return daApi(await api<PetApi>(`/api/pets/${encodeURIComponent(id)}`));
}

export async function listarMeusAnimais(): Promise<AnimalTela[]> {
  const pets = await api<PetApi[]>("/api/pets/meus");
  return pets.map(daApi);
}

/** Pets disponiveis para adocao perto do endereco (ou CEP) digitado na busca publica. */
export async function listarDisponiveis(endereco?: string): Promise<AnimalTela[]> {
  const params = endereco?.trim() ? `?endereco=${encodeURIComponent(endereco.trim())}` : "";
  const pets = await api<PetApi[]>(`/api/pets${params}`);
  return pets.map(daApi);
}
