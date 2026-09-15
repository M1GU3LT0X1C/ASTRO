// src/app/dashboard/layout.tsx - VERSÃO SEGURA
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient' // vamos criar abaixo

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // aqui você já pode buscar o nome da ONG de forma segura
  const { data: ong } = await supabase.from('ongs').select('nome').eq('id', user.id).single()

  return <DashboardClient nomeOng={ong?.nome || 'Minha ONG'}>{children}</DashboardClient>
}