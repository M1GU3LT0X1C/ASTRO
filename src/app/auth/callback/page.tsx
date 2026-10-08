"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buscarMe, garantirOng, garantirTutor } from "@/lib/perfil";
import { alerta } from "@/lib/alerta";

export default function CallbackPage() {
  const router = useRouter();
  useEffect(() => {
    const handleCallback = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) { router.push("/login"); return; }

      // perfil escolhido no cadastro com Google (vazio quando a pessoa só clicou em "entrar com Google")
      const perfilPendente = localStorage.getItem("astro_perfil_pendente");
      const nomeOngTemp = localStorage.getItem("temp_ong_nome");
      localStorage.clear();
      localStorage.setItem("ultimo_user_id", user.id);

      const nomePessoa = user.user_metadata?.full_name || user.email?.split('@')[0] || "";
      localStorage.setItem("pessoa_nome", nomePessoa);
      if (user.user_metadata?.avatar_url) localStorage.setItem("ong_foto", user.user_metadata.avatar_url);

      const me = perfilPendente === "explorador" ? await garantirTutor(nomePessoa || "Explorador") : await buscarMe();
      if (me.tutor) {
        localStorage.setItem("tipo_usuario", "explorador");
        router.push("/");
        return;
      }

      const nomeOng = nomeOngTemp || nomePessoa || "Minha ONG";
      const { ong } = await garantirOng(nomeOng, perfilPendente || undefined);
      localStorage.setItem("tipo_usuario", perfilPendente || "ong");
      localStorage.setItem("ong_nome", ong?.nomeOrganizacao || nomeOng);
      router.push("/dashboard");
    };
    handleCallback().catch(async (err) => {
      await alerta.erro("Não foi possível concluir o login", err?.message);
      router.push("/login");
    });
  }, [router]);
  return <p>Entrando...</p>;
}