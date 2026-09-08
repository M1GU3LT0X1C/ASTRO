"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CallbackPage() {
  const router = useRouter();
  useEffect(() => {
    const handleCallback = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) { router.push("/login"); return; }

      const tipo = localStorage.getItem("tipo_usuario") || "explorador";
      localStorage.clear();
      localStorage.setItem("ultimo_user_id", user.id);
      localStorage.setItem("tipo_usuario", tipo);

      const nomePessoa = user.user_metadata?.full_name || user.email?.split('@')[0] || "";
      localStorage.setItem("pessoa_nome", nomePessoa);
      if (user.user_metadata?.avatar_url) localStorage.setItem("ong_foto", user.user_metadata.avatar_url);

      if (tipo === "ong") {
        const nomeOng = localStorage.getItem("temp_ong_nome") || nomePessoa || "Minha ONG";
        const { data: existe } = await supabase.from("ongs").select("id").eq("usuario_id", user.id).maybeSingle();
        if (!existe) {
          await supabase.from("ongs").insert({ usuario_id: user.id, nome_organizacao: nomeOng, email: user.email });
        }
        localStorage.setItem("ong_nome", nomeOng);
        localStorage.removeItem("temp_ong_nome");
      } else {
        localStorage.setItem("ong_nome", nomePessoa);
      }
      router.push("/dashboard");
    };
    handleCallback();
  }, [router]);
  return <p>Entrando...</p>;
}