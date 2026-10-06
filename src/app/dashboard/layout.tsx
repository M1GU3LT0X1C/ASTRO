// src/app/dashboard/layout.tsx - VERSÃO SEGURA
import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // o dashboard é só para ONGs; tutor volta para a home
  const { data: perfil } = await supabase.from('usuarios').select('tipo').eq('id', user.id).maybeSingle()
  if (perfil?.tipo === 'TUTOR') {
    redirect('/')
  }

  const { data: ong } = await supabase.from('ongs').select('nome_organizacao').eq('usuario_id', user.id).maybeSingle()

  return <DashboardClient nomeOng={ong?.nome_organizacao || 'Minha ONG'}>{children}</DashboardClient>
}
