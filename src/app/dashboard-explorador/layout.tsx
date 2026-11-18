import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
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

  // Autenticação já validada pelo middleware; lê sessão do cookie sem bloquear a renderização
  const supabase = await createServerSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user =
    session?.user ??
    (await supabase.auth.getUser().then((r) => r.data.user).catch(() => null));

  if (!user) {
    redirect("/login");
  }

  const nome =
    user.user_metadata?.nome ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Explorador";

  return (
    <DashboardExploradorClient nomeExplorador={nome}>
      {children}
    </DashboardExploradorClient>
  );
}
