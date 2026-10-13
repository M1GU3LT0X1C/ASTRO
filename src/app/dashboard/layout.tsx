// src/app/dashboard/layout.tsx - VERSÃO SEGURA
import { createServerSupabase } from '@/lib/supabase-server'
import { apiServidor } from '@/lib/api-servidor'
import type { Me } from '@/lib/perfil'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const me = await apiServidor<Me>('/api/me').catch(() => null)

  // o dashboard é só para ONGs; tutor volta para a home
  if (me?.tutor) {
    redirect('/')
  }

  return <DashboardClient nomeOng={me?.ong?.nomeOrganizacao || 'Minha ONG'}>{children}</DashboardClient>
}
