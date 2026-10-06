import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Regra: e tutor so quem tem usuarios.tipo = 'TUTOR' (criado pelo trigger do cadastro).
// Contas sem perfil (antigas ou via Google) continuam sendo tratadas como ONG.
export async function ehTutor(userId: string) {
  const { data } = await supabase.from("usuarios").select("tipo").eq("id", userId).maybeSingle();
  return data?.tipo === "TUTOR";
}

// Retorna a ONG do usuario, criando uma se ainda nao existir.
export async function garantirOng(user: User, nome: string, tipoPerfil?: string) {
  const { data: existe } = await supabase.from("ongs").select("id, nome_organizacao").eq("usuario_id", user.id).maybeSingle();
  if (existe) return existe;

  const { data, error } = await supabase.from("ongs")
    .insert({ usuario_id: user.id, nome_organizacao: nome, regiao: "", ...(tipoPerfil && { tipo_perfil: tipoPerfil }) })
    .select("id, nome_organizacao")
    .single();
  if (error) throw error;
  return data;
}

// Tutor que entra pelo Google nao passa pelo trigger (o Google nao envia o perfil), entao o registro e criado aqui.
export async function garantirTutor(user: User, nome: string) {
  const { error } = await supabase.from("usuarios").upsert(
    { id: user.id, nome, email: user.email, tipo: "TUTOR", criado_em: new Date().toISOString() },
    { onConflict: "id", ignoreDuplicates: true }
  );
  if (error) throw error;
}
