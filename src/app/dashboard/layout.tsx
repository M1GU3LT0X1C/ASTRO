// src/app/dashboard/layout.tsx
import { createServerSupabase } from '@/lib/supabase-server'
import { apiServidor } from '@/lib/api-servidor'
import type { Me } from '@/lib/perfil'
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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const me = await apiServidor<Me>('/api/me').catch(() => null)

  // O dashboard é exclusivo para ONGs; exploradores usam seu próprio painel.
  if (me?.tutor) {
    redirect('/dashboard-explorador')
  }

  return <DashboardClient nomeOng={me?.ong?.nomeOrganizacao || 'Minha ONG'}>{children}</DashboardClient>
}
