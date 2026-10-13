import { supabase } from "@/lib/supabase";
import { chamarApi, type OpcoesApi } from "@/lib/api-base";

export { ErroApi } from "@/lib/api-base";

// Chamada ao back-end a partir do navegador, com o token da sessao atual.
export async function api<T>(caminho: string, opcoes?: OpcoesApi): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  return chamarApi<T>(process.env.NEXT_PUBLIC_API_URL!, caminho, session?.access_token, opcoes);
}
