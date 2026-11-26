import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { apiServidor } from "@/lib/api-servidor";
import type { Me } from "@/lib/perfil";
import DashboardExploradorClient from "./DashboardExploradorClient";

export default async function DashboardExploradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modoTesteExplorador =
    process.env.NODE_ENV === "development" &&
    process.env.MODO_TESTE_EXPLORADOR === "true";

  // Acesso temporário para desenvolvimento
  if (modoTesteExplorador) {
    return (
      <DashboardExploradorClient nomeExplorador="Explorador Teste">
        {children}
      </DashboardExploradorClient>
    );
  }

  // Autenticação normal
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const nome =
    user.user_metadata?.nome ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Explorador";

  const perfilMeta = user.user_metadata?.perfil as string | undefined;
  const me = await apiServidor<Me>("/api/me").catch(() => null);

  const contaEhClinica = me
    ? Boolean(me.tipo === "ESTACAO" || me.ong?.tipoPerfil === "estacao")
    : perfilMeta === "estacao";

  if (contaEhClinica) {
    redirect("/dashboard-clinica");
  }

  // Conta institucional/Guardião não pode acessar o painel do Explorador nem criar perfil duplicado de tutor.
  const contaEhOng = me
    ? Boolean(me.ong || (me.tipo && me.tipo !== "EXPLORADOR"))
    : perfilMeta === "guardiao" ||
      perfilMeta === "base-estelar" ||
      perfilMeta === "ong";

  if (contaEhOng) {
    redirect("/dashboard");
  }

  if (me && !me.tutor) {
    await apiServidor<Me>("/api/me/tutor", {
      method: "POST",
      body: { nome },
    }).catch(() => null);
  }

  return (
    <DashboardExploradorClient nomeExplorador={nome}>
      {children}
    </DashboardExploradorClient>
  );
}
