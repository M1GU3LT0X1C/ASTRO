import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { apiServidor } from "@/lib/api-servidor";
import type { Me } from "@/lib/perfil";
import DashboardClinicaClient from "./DashboardClinicaClient";

export default async function DashboardClinicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modoTesteClinica =
    process.env.NODE_ENV === "development" &&
    process.env.MODO_TESTE_CLINICA === "true";

  if (modoTesteClinica) {
    return (
      <DashboardClinicaClient nomeClinica="Clínica Teste">
        {children}
      </DashboardClinicaClient>
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const perfilMeta = user.user_metadata?.perfil as string | undefined;
  const me = await apiServidor<Me>("/api/me").catch(() => null);

  const contaEhExplorador = me
    ? Boolean((me.tutor || me.tipo === "EXPLORADOR") && !me.ong)
    : perfilMeta === "explorador";

  if (contaEhExplorador) {
    redirect("/dashboard-explorador");
  }

  const contaEhClinica = me
    ? Boolean(me.tipo === "ESTACAO" || me.ong?.tipoPerfil === "estacao")
    : perfilMeta === "estacao";

  if (!contaEhClinica) {
    redirect("/dashboard");
  }

  const nomeFallback =
    user.user_metadata?.nome ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Clínica";

  return (
    <DashboardClinicaClient
      nomeClinica={me?.ong?.nomeOrganizacao || nomeFallback}
    >
      {children}
    </DashboardClinicaClient>
  );
}
