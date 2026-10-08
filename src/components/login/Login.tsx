"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { alerta } from "@/lib/alerta";
import { traduzirErroAuth } from "@/lib/errosAuth";
import { buscarMe, garantirOng } from "@/lib/perfil";
import styles from "./Login.module.css";

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("astro_remember_email");
    if (saved) {
      setEmail(saved);
      setLembrar(true);
    }
  }, []);

  function checkRateLimit(e: string) {
    const key = `rl_${e}`;
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    const data = JSON.parse(raw);
    if (data.count >= 5 && Date.now() - data.time < 15 * 60 * 1000) {
      alerta.aviso("Muitas tentativas", "Aguarde alguns minutos e tente novamente.");
      return false;
    }
    if (Date.now() - data.time > 15 * 60 * 1000) {
      localStorage.removeItem(key);
    }
    return true;
  }

  function addTentativa(e: string, ok: boolean) {
    const key = `rl_${e}`;
    if (ok) {
      localStorage.removeItem(key);
      return;
    }
    const raw = localStorage.getItem(key);
    const d = raw? JSON.parse(raw) : { count: 0, time: Date.now() };
    localStorage.setItem(key, JSON.stringify({ count: d.count + 1, time: Date.now() }));
  }

  async function handleLogin() {
    if (!email ||!senha) {
      alerta.aviso("Preencha e-mail e senha");
      return;
    }
    if (!checkRateLimit(email)) return;
    setLoading(true);
    const supabase = await createClient();
    if (lembrar) localStorage.setItem("astro_remember_email", email);
    else localStorage.removeItem("astro_remember_email");
    const result = await supabase.auth.signInWithPassword({ email, password: senha });
    if (result.error) {
      addTentativa(email, false);
      alerta.erro("Não foi possível entrar", traduzirErroAuth(result.error.message));
      setLoading(false);
      return;
    }
    addTentativa(email, true);
    await checkAndRedirect(result.data.user);
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const supabase = await createClient();
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" }
    });
    if (result.error) {
      alerta.erro("Não foi possível entrar", traduzirErroAuth(result.error.message));
      setLoading(false);
    }
  }

  async function checkAndRedirect(user: any) {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      if ((await buscarMe()).tutor) {
        localStorage.setItem("tipo_usuario", "explorador");
        router.push("/");
        return;
      }
      const nome = user.user_metadata?.full_name || user.email.split("@")[0] || "Minha ONG";
      const { ong } = await garantirOng(nome);
      localStorage.setItem("ong_nome", ong?.nomeOrganizacao || nome);
      router.push("/dashboard");
    } catch (err) {
      alerta.erro("Não foi possível carregar sua ONG", err instanceof Error ? err.message : undefined);
      setLoading(false);
    }
  }

  async function handleEsqueciSenha() {
    if (!email) {
      alerta.aviso("Digite seu e-mail primeiro", "Usamos ele para enviar o link de recuperação.");
      return;
    }
    const supabase = await createClient();
    const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/login?reset=true" });
    if (result.error) alerta.erro("Não foi possível enviar o link", traduzirErroAuth(result.error.message));
    else alerta.sucesso("Link enviado!", "Enviamos um link de recuperação para " + email + ".");
  }

  return (
    <main className={styles.login}>
      <section className={styles.ladoEsquerdo}>
        <img src="/gatoplaneta.png" alt="Gato planeta" className={styles.planetaImg} />
      </section>
      <section className={styles.ladoDireito}>
        <div className={styles.formulario}>
          <h1>Bem-vindo(a) de volta! Sentimos sua falta no nosso radar.</h1>
          <input type="email" placeholder="E-mail" className={styles.input} value={email} onChange={function(e){setEmail(e.target.value)}} />
          <div className={styles.inputWrap}>
            <input type={mostrarSenha? "text" : "password"} placeholder="Senha" className={styles.input} value={senha} onChange={function(e){setSenha(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter") handleLogin()}} />
            <button type="button" className={styles.olhinho} onClick={function(){setMostrarSenha(!mostrarSenha)}}>
              {mostrarSenha? "🙈" : "👁️"}
            </button>
          </div>
          <div className={styles.opcoes}>
            <label className={styles.checkbox}>
              <input type="checkbox" checked={lembrar} onChange={function(e){setLembrar(e.target.checked)}} />
              <span>Lembrar meu login</span>
            </label>
            <button type="button" className={styles.esqueci} onClick={handleEsqueciSenha}>Esqueci minha senha</button>
          </div>
          <div className={styles.botoesLinha}>
            <button className={styles.botaoPrimario} onClick={handleLogin} disabled={loading}>{loading? "Entrando..." : "Acessar Base"}</button>
            <button className={styles.botaoSecundario} onClick={function(){router.push("/cadastro")}}>Cadastre</button>
          </div>
          <div className={styles.divisor}>ou</div>
          <button className={styles.botaoGoogle} onClick={handleGoogleLogin} disabled={loading}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" width={20} alt="" />
            Continuar com Google
          </button>
        </div>
      </section>
    </main>
  );
}