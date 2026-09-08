"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CallbackPage() {
  const router = useRouter()
  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        const code = new URL(window.location.href).searchParams.get("code")
        if (code) await supabase.auth.exchangeCodeForSession(code)
      }
      router.replace("/dashboard")
    }
    run()
  }, [router])
  return <p>Conectando...</p>
}