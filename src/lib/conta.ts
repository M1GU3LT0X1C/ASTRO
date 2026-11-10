"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { buscarMe, type Me } from "@/lib/perfil";

export type Conta = { carregando: boolean; logado: boolean; me: Me | null };

/** Quem esta vendo a pagina publica: visitante, Explorador ou ONG. */
export function useConta(): Conta {
  const [conta, setConta] = useState<Conta>({ carregando: true, logado: false, me: null });

  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        if (ativo) setConta({ carregando: false, logado: false, me: null });
        return;
      }
      const me = await buscarMe().catch(() => null);
      if (ativo) setConta({ carregando: false, logado: true, me });
    });
    return () => { ativo = false; };
  }, []);

  return conta;
}
