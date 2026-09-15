"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase"; // NOVO
import styles from "./Login.module.css";

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailSalvo = localStorage.getItem("astro_remember_email");
    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrar(true);
    }
  }, []);

  // RATE LIMIT - 5 tentativas bloqueia 15 min
  function checkRateLimit(email: string): boolean {
    const key = `rl_${email}`;
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    const { count, time } = JSON.parse(raw);
    if (count >= 5 && Date.now() - time < 15 * 60 * 1000) {
      const falta = Math.ceil((15*60*1000 - (Date.now() - time)) / 60000);
      alert(`Muitas tentativas. Tente em ${falta} minutos.`);
      return false;
    }
    if (Date.now() - time > 15 * 60 * 1000) {
      localStorage.removeItem(key);
    }
    return true;
  }

  function addTentativa(email: string, sucesso: boolean) {
    const key = `rl_${email}`;
    if (sucesso) {
      localStorage.removeItem(key);
      return;
    }
    const raw = localStorage.getItem(key);
    const data = raw? JSON.parse(raw) : { count: 0, time: Date.now() };
    localStorage.setItem(key, JSON.stringify({ count: data.count + 1, time: Date.now() }));
  }

  async function handleLogin() {
    if (!checkRateLimit(email)) return;
    setLoading(true);

    const supabase = await createClient();

    if (lembrar) localStorage.setItem("astro_remember_email", email);
    else localStorage.removeItem("astro_remember_email");

    const { data, error } = await supabase.auth.signInWithPassword({
      email, password: senha,
    });

    if (error) {
      addTentativa(email, false);
      alert("Erro: " + error.message);
      setLoading(false);
      return;
    }

    addTentativa(email, true);
    await checkAndRedirect(data.user);
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) {
      alert("Erro no Google: " + error.message);
      setLoading(false);
    }
  }

  async function checkAndRedirect(user: any) {
    if (!user) { setLoading(false); return; }
    const supabase = await createClient();

    const { data: ong } = await supabase
     .from("ongs")
     .select("id, nome_organizacao")
     .eq("usuario_id", user.id)
     .single();

    if (ong) {
      localStorage.setItem("ong_nome", ong.nome_organizacao);
      router.push("/dashboard");
      return;
    }

    //... resto do seu código continua igual...
    const nomeOng = user.user_metadata?.full_name || user.email?.split('@')[0] || "Minha ONG";
    const { data: novaOng } = await supabase
     .from("ongs")
     .insert({ usuario_id: user.id, nome_organizacao: nomeOng, email: user.email })
     .select("id, nome_organizacao")
     .single();

    if (novaOng) {
      localStorage.setItem("ong_nome", novaOng.nome_organizacao);
      router.push("/dashboard");
    }
  }

  async function handleEsqueciSenha() {
    if (!email) { alert("Digite seu e-mail primeiro"); return; }
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });
    if (error) alert("Erro: " + error.message);
    else alert(`Enviamos link para ${email}`);
  }

  return (
    // SEU JSX CONTINUA IGUAL
    <main className={styles.login}>
      <section className={styles.ladoEsquerdo}>
        <img src="/logo-gato.png" alt="Astro" className={styles.logo} />
      </section>
      <section className={styles.ladoDireito}>
        <div className={styles.formulario}>
          <h1>Bem-vindo(a) de volta! Sentimos sua<br/>falta no nosso radar.</h1>
          <input type="email" placeholder="E-mail" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" className={styles.input} value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <div className={styles.opcoes}>
            <label className={styles.checkbox}>
              <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
              <span>Lembrar meu login</span>
            </label>
            <button type="button" className={styles.esqueci} onClick={handleEsqueciSenha}>Esqueci minha senha</button>
          </div>
          <button className={styles.botao} onClick={handleLogin} disabled={loading}>{loading? "Entrando..." : "Entrar na Órbita"}</button>
          <div style={{ textAlign: 'center', margin: '15px 0', color: 'white', opacity: 0.9, fontSize: '14px' }}>ou</div>
          <button className={styles.botao} onClick={handleGoogleLogin} disabled={loading} style={{ background: 'white', color: 'black', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="20" alt="" /> Continuar com Google
          </button>
        </div>
      </section>
    </main>
  );
}