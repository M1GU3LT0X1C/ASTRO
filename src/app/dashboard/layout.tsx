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

  const perfilMeta = user.user_metadata?.perfil as string | undefined
  const me = await apiServidor<Me>('/api/me').catch(() => null)

  // O dashboard é exclusivo para ONGs/Guardiões/Estações; contas Explorador/Tutor usam o próprio painel.
  const contaEhExplorador = me
    ? Boolean((me.tutor || me.tipo === 'EXPLORADOR') && !me.ong)
    : perfilMeta === 'explorador'

  if (contaEhExplorador) {
    redirect('/dashboard-explorador')
  }

  const contaEhClinica = me
    ? Boolean(me.tipo === 'ESTACAO' || me.ong?.tipoPerfil === 'estacao')
    : perfilMeta === 'estacao'

  if (contaEhClinica) {
    redirect('/dashboard-clinica')
  }

  const nomeFallback =
    user.user_metadata?.nome ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Minha ONG'

  return <DashboardClient nomeOng={me?.ong?.nomeOrganizacao || nomeFallback}>{children}</DashboardClient>
}
