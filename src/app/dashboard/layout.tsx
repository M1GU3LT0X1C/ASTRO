// src/app/dashboard/layout.tsx
import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const modoTesteONG =
    process.env.NODE_ENV === 'development' &&
    process.env.MODO_TESTE_ONG === 'true'

  // Permite visualizar o dashboard sem login apenas no ambiente de desenvolvimento.
  if (modoTesteONG) {
    return <DashboardClient nomeOng="ONG Teste">{children}</DashboardClient>
  }

  const supabase = await createServerSupabase()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user =
    session?.user ??
    (await supabase.auth.getUser().then((r) => r.data.user).catch(() => null))

  if (!user) {
    redirect('/login')
  }

  const perfilMeta = user.user_metadata?.perfil as string | undefined

  // O dashboard é exclusivo para ONGs; exploradores usam seu próprio painel.
  if (perfilMeta === 'explorador') {
    redirect('/dashboard-explorador')
  }

  const nomeFallback =
    user.user_metadata?.nome ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Minha ONG'

  return <DashboardClient nomeOng={nomeFallback}>{children}</DashboardClient>
}
