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

export type AnimalForm = {
  nome: string; idade: string; raca: string;
  porte: string; sexo: string; especie: string;
  castrado: boolean; vacinado: boolean; vermifugado: boolean; cuidados: boolean;
  temperamentos: string[]; fotoUrl: string;
};

export type AnimalTela = {
  id: string; nome: string; sexo: string; idade: number; raca: string;
  especie: string; porte: string; foto_url: string; status: string;
  castrado: boolean; vacinado: boolean; vermifugado: boolean;
  cuidados_especiais: boolean; temperamentos: string[]; created_at: string;
};

// PetResponse do back-end
type PetApi = {
  id: string; parceiroId: string; nomeParceiro: string; nome: string;
  especie: string; idade: string | null; porte: string | null; sexo: string | null; historia: string | null;
  caracteristicas: string[] | null; vacinado: boolean | null; castrado: boolean | null;
  fotos: string[] | null; status: string; criadoEm: string;
};

function paraApi(form: AnimalForm) {
  return {
    nome: form.nome,
    especie: ESPECIE_PARA_API[form.especie] || "OUTRO",
    porte: PORTE_PARA_API[form.porte] || "MEDIO",
    sexo: form.sexo === "femea" ? "FEMEA" : "MACHO",
    idade: form.idade,
    castrado: form.castrado,
    vacinado: form.vacinado,
    fotos: form.fotoUrl ? [form.fotoUrl] : [],
    caracteristicas: [
      ...form.temperamentos,
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
    temperamentos: caracteristicas.filter((c) => c !== TAG_VERMIFUGADO && c !== TAG_CUIDADOS && !c.startsWith(PREFIXO_RACA)),
    created_at: pet.criadoEm,
  };
}

// O back cria o parceiro (dono dos animais no banco) da ONG na primeira vez.
export const cadastrarAnimal = (form: AnimalForm) =>
  api<PetApi>("/api/pets", { method: "POST", body: paraApi(form) });

export async function listarMeusAnimais(): Promise<AnimalTela[]> {
  const pets = await api<PetApi[]>("/api/pets/meus");
  return pets.map(daApi);
}
