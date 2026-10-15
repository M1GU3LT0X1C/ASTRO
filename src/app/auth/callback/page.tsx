"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buscarMe, garantirOng, garantirTutor } from "@/lib/perfil";
import { alerta } from "@/lib/alerta";

// Depois do Google, o login tem duas etapas: a sessão do Supabase (rápida) e a consulta do perfil
// no back-end (pode demorar se o servidor estiver "dormindo"). Se a segunda falhar, a sessão é
// encerrada: senão a pessoa voltaria ao login parecendo deslogada e depois "logaria sozinha".
export default function CallbackPage() {
  const router = useRouter();
  const [mensagem, setMensagem] = useState("Entrando...");
  const iniciou = useRef(false);

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;

    const aviso = setTimeout(() => setMensagem("O servidor está iniciando, isso pode levar até 2 minutos..."), 5000);

    async function concluir() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) { router.push("/login"); return; }

      // perfil escolhido no cadastro com Google (vazio quando a pessoa só clicou em "entrar com Google")
      const perfilPendente = localStorage.getItem("astro_perfil_pendente");
      const nomeOngTemp = localStorage.getItem("temp_ong_nome");
      const nomePessoa = user.user_metadata?.full_name || user.email?.split('@')[0] || "";

      // tenta até dar certo ou a pessoa desistir
      for (;;) {
        try {
          const me = perfilPendente === "explorador" ? await garantirTutor(nomePessoa || "Explorador") : await buscarMe();
          const ong = me.tutor ? null : (await garantirOng(nomeOngTemp || nomePessoa || "Minha ONG", perfilPendente || undefined)).ong;

          localStorage.clear();
          localStorage.setItem("ultimo_user_id", user.id);
          localStorage.setItem("pessoa_nome", nomePessoa);
          if (user.user_metadata?.avatar_url) localStorage.setItem("ong_foto", user.user_metadata.avatar_url);
          if (me.tutor) {
            localStorage.setItem("tipo_usuario", "explorador");
            router.push("/");
          } else {
            localStorage.setItem("tipo_usuario", perfilPendente || "ong");
            localStorage.setItem("ong_nome", ong?.nomeOrganizacao || nomeOngTemp || nomePessoa || "Minha ONG");
            router.push("/dashboard");
          }
          return;
        } catch (err) {
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
          setMensagem("Tentando de novo...");
        }
      }
    }

    concluir().finally(() => clearTimeout(aviso));
  }, [router]);

  return <p style={{ padding: 24, textAlign: "center" }}>{mensagem}</p>;
}
