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
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // painel só para exploradores (tutores); ONGs vão para o painel delas.
  // Se o back não responder (me = null), deixa entrar em vez de mandar para o lugar errado.
  const me = await apiServidor<Me>("/api/me").catch(() => null);
  if (me && !me.tutor) {
    redirect("/dashboard");
  }

  // "nome" vem do cadastro por e-mail; "full_name", do login com Google
  const nome = user.user_metadata?.nome || user.user_metadata?.full_name || user.email?.split("@")[0] || "Explorador";

  return (
    <DashboardExploradorClient nomeExplorador={nome}>
      {children}
    </DashboardExploradorClient>
  );
}
