import { supabase } from "@/lib/supabase";
import { chamarApi, montarUrl, type OpcoesApi } from "@/lib/api-base";

export { ErroApi } from "@/lib/api-base";

// Chamada ao back-end a partir do navegador, com o token da sessao atual.
export async function api<T>(caminho: string, opcoes?: OpcoesApi): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  return chamarApi<T>(process.env.NEXT_PUBLIC_API_URL!, caminho, session?.access_token, opcoes);
}

// Dispara uma chamada leve so para o back comecar a acordar (Render gratuito dorme sem uso).
// Usado no login/cadastro: enquanto a pessoa preenche ou escolhe a conta Google, o back ja vai subindo.
export function acordarServidor() {
  fetch(montarUrl(process.env.NEXT_PUBLIC_API_URL!, "/api/pets"), { method: "HEAD", mode: "no-cors" }).catch(() => {
    // so um aquecimento; erro aqui nao importa
  });
}
