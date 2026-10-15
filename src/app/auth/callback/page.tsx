"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buscarMe, garantirOng, garantirTutor } from "@/lib/perfil";
import { alerta } from "@/lib/alerta";

// Depois do Google, o login tem duas etapas: a sessão do Supabase (rápida) e a consulta do perfil
// no back-end (pode demorar se o servidor estiver "dormindo"). Se a segunda falhar, a sessão é
// encerrada: senão a pessoa voltaria ao login parecendo deslogada e depois "logaria sozinha".
export default function CallbackPage() {
  const router = useRouter();
  const iniciou = useRef(false);

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;

    const MSG_ESPERA = "O servidor está iniciando, isso pode levar até 2 minutos.";
    alerta.carregando("Entrando...");
    // se demorar, explica o motivo (o back no Render pode estar "dormindo")
    const aviso = setTimeout(() => alerta.carregando("Entrando...", MSG_ESPERA), 3000);

    async function concluir() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) { clearTimeout(aviso); alerta.fechar(); router.push("/login"); return; }

      // perfil escolhido no cadastro com Google (vazio quando a pessoa só clicou em "entrar com Google")
      const perfilPendente = localStorage.getItem("astro_perfil_pendente");
      const nomeOngTemp = localStorage.getItem("temp_ong_nome");
      const nomePessoa = user.user_metadata?.full_name || user.email?.split('@')[0] || "";

      // tenta até dar certo ou a pessoa desistir
      for (;;) {
        try {
          const me = perfilPendente === "explorador" ? await garantirTutor(nomePessoa || "Explorador") : await buscarMe();
          const ong = me.tutor ? null : (await garantirOng(nomeOngTemp || nomePessoa || "Minha ONG", perfilPendente || undefined)).ong;

          clearTimeout(aviso);
          alerta.fechar();

          // remove só os dados temporários do cadastro com Google (não apaga o resto do localStorage)
          localStorage.removeItem("astro_perfil_pendente");
          localStorage.removeItem("temp_ong_nome");
          localStorage.setItem("ultimo_user_id", user.id);
          localStorage.setItem("pessoa_nome", nomePessoa);
          if (user.user_metadata?.avatar_url) localStorage.setItem("ong_foto", user.user_metadata.avatar_url);
          if (me.tutor) {
            localStorage.setItem("tipo_usuario", "explorador");
            router.push("/dashboard-explorador");
          } else {
            localStorage.setItem("tipo_usuario", perfilPendente || "ong");
            localStorage.setItem("ong_nome", ong?.nomeOrganizacao || nomeOngTemp || nomePessoa || "Minha ONG");
            router.push("/dashboard");
          }
          return;
        } catch (err) {
          clearTimeout(aviso);
          const tentarDeNovo = await alerta.confirmar({
            icon: "error",
            title: "Não foi possível concluir o login",
            text: err instanceof Error ? err.message : undefined,
            confirmText: "Tentar de novo",
            cancelText: "Voltar ao login",
          });
          if (!tentarDeNovo) {
            await supabase.auth.signOut();
            router.push("/login");
            return;
          }
          alerta.carregando("Tentando de novo...", MSG_ESPERA);
        }
      }
    }

    concluir().finally(() => clearTimeout(aviso));
  }, [router]);

  // o conteúdo da espera fica no alerta de carregamento
  return null;
}
