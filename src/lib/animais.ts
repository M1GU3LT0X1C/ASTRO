import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// A tabela "animais" pertence a um "parceiro" (parceiros.tipo = 'ong'), nao direto a uma ONG.
// Este modulo traduz entre os valores usados nas telas e os valores aceitos pelo banco
// (CHECKs: tipo cao/gato/outro, porte P/M/G, sexo macho/femea).

const ESPECIE_PARA_BANCO: Record<string, string> = { cachorro: "cao", gato: "gato" };
const ESPECIE_DO_BANCO: Record<string, string> = { cao: "cachorro", gato: "gato", outro: "outro" };
const PORTE_PARA_BANCO: Record<string, string> = { pequeno: "P", medio: "M", grande: "G" };
const PORTE_DO_BANCO: Record<string, string> = { P: "pequeno", M: "medio", G: "grande" };

// flags e textos livres do formulario que nao tem coluna propria vao em "caracteristicas"
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

export function paraBanco(form: AnimalForm, parceiroId: string) {
  const caracteristicas = [
    ...form.temperamentos,
    ...(form.vermifugado ? [TAG_VERMIFUGADO] : []),
    ...(form.cuidados ? [TAG_CUIDADOS] : []),
    ...(form.raca ? [PREFIXO_RACA + form.raca] : []),
  ];
  return {
    parceiro_id: parceiroId,
    nome: form.nome,
    tipo: ESPECIE_PARA_BANCO[form.especie] || "outro",
    porte: PORTE_PARA_BANCO[form.porte] || "M",
    sexo: form.sexo === "femea" ? "femea" : "macho",
    idade: form.idade,
    castrado: form.castrado,
    vacinado: form.vacinado,
    fotos: form.fotoUrl ? [form.fotoUrl] : [],
    caracteristicas,
  };
}

// linha da tabela "animais" como vem do Supabase
type LinhaAnimal = {
  id: string; nome: string; tipo: string; porte: string | null; sexo: string | null;
  idade: string | null; caracteristicas: string[] | null; fotos: string[] | null;
  status: string; castrado: boolean | null; vacinado: boolean | null; created_at: string;
};

export function doBanco(row: LinhaAnimal): AnimalTela {
  const caracteristicas: string[] = row.caracteristicas || [];
  const raca = caracteristicas.find((c) => c.startsWith(PREFIXO_RACA))?.slice(PREFIXO_RACA.length) || "";
  return {
    id: row.id,
    nome: row.nome,
    sexo: row.sexo || "",
    idade: parseInt(row.idade ?? "", 10) || 0, // texto livre no banco, ex.: "2 anos"
    raca,
    especie: ESPECIE_DO_BANCO[row.tipo] || row.tipo || "",
    porte: (row.porte && PORTE_DO_BANCO[row.porte]) || "",
    foto_url: row.fotos?.[0] || "",
    status: row.status,
    castrado: !!row.castrado,
    vacinado: !!row.vacinado,
    vermifugado: caracteristicas.includes(TAG_VERMIFUGADO),
    cuidados_especiais: caracteristicas.includes(TAG_CUIDADOS),
    temperamentos: caracteristicas.filter((c) => c !== TAG_VERMIFUGADO && c !== TAG_CUIDADOS && !c.startsWith(PREFIXO_RACA)),
    created_at: row.created_at,
  };
}

// Retorna o parceiro (tipo 'ong') do usuario logado. Se ainda nao existir, cria a partir do cadastro em "ongs".
export async function obterParceiro(user: User, criarSeFaltar = true): Promise<{ id: string; logo_url: string | null } | null> {
  const { data: parceiro } = await supabase.from("parceiros").select("id, logo_url").eq("usuario_id", user.id).maybeSingle();
  if (parceiro || !criarSeFaltar) return parceiro;

  const { data: ong } = await supabase.from("ongs").select("nome_organizacao, regiao, telefone").eq("usuario_id", user.id).maybeSingle();
  if (!ong) return null;

  const { data: novo, error } = await supabase.from("parceiros").insert({
    usuario_id: user.id,
    nome: ong.nome_organizacao,
    tipo: "ong",
    cidade: ong.regiao || "",
    whatsapp: ong.telefone || "",
    email: user.email,
  }).select("id, logo_url").single();
  if (error) throw error;
  return novo;
}

export async function listarAnimaisDoUsuario(user: User): Promise<AnimalTela[]> {
  const parceiro = await obterParceiro(user, false);
  if (!parceiro) return [];
  const { data } = await supabase.from("animais").select("*").eq("parceiro_id", parceiro.id).order("created_at", { ascending: false });
  return (data || []).map(doBanco);
}
