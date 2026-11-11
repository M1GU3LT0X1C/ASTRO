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

  // Verificar se o usuário é explorador ou garantir criação do registro de tutor
  const me = await apiServidor<Me>("/api/me").catch(() => null);

  if (me && !me.tutor) {
    const ehOng = Boolean(me.ong || (me.tipo && me.tipo !== "EXPLORADOR"));
    if (ehOng && perfilMeta !== "explorador") {
      redirect("/dashboard");
    }
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
