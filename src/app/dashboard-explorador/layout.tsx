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

  // Verificar se o usuário é explorador
  const me = await apiServidor<Me>("/api/me").catch(
    () => null
  );

  if (me && !me.tutor) {
    redirect("/dashboard");
  }

  const nome =
    user.user_metadata?.nome ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Explorador";

  return (
    <DashboardExploradorClient nomeExplorador={nome}>
      {children}
    </DashboardExploradorClient>
  );
}
