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

  // Garante o registro de tutor caso ainda não exista, sem redirecionar para /dashboard
  const me = await apiServidor<Me>("/api/me").catch(() => null);

  if (!me || !me.tutor) {
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
