import { createServerSupabase } from "@/lib/supabase-server";
import { chamarApi, type OpcoesApi } from "@/lib/api-base";

// Chamada ao back-end a partir de Server Components, com o token lido dos cookies.
// API_URL_SERVIDOR existe porque, dentro do Docker, "localhost" e o proprio container do front.
export async function apiServidor<T>(caminho: string, opcoes?: OpcoesApi): Promise<T> {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const baseUrl = process.env.API_URL_SERVIDOR || process.env.NEXT_PUBLIC_API_URL!;
  return chamarApi<T>(baseUrl, caminho, session?.access_token, opcoes);
}
