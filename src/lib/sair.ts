import { supabase } from "@/lib/supabase";
import { alerta } from "@/lib/alerta";

// chaves do localStorage que sobrevivem ao logout (preferencias do aparelho, nao da conta)
const MANTER = ["astro_remember_email"];

export async function sair() {
  const confirmou = await alerta.confirmar({ title: "Sair da conta?", confirmText: "Sair", cancelText: "Ficar" });
  if (!confirmou) return;

  await supabase.auth.signOut();
  Object.keys(localStorage).filter((chave) => !MANTER.includes(chave)).forEach((chave) => localStorage.removeItem(chave));
  // recarrega a pagina inteira para o header, a sidebar e o middleware verem a sessao encerrada
  window.location.href = "/";
}
