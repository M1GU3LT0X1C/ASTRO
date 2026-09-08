"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

  async function handleLogin() {
    setLoading(true);
    
    if (lembrar) {
      localStorage.setItem("astro_remember_email", email);
    } else {
      localStorage.removeItem("astro_remember_email");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Erro: " + error.message);
      setLoading(false);
      return;
    }

    await checkAndRedirect(data.user);
  }

  // NOVA FUNÇÃO GOOGLE
  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      alert("Erro no Google: " + error.message);
      setLoading(false);
    }
  }

  async function checkAndRedirect(user: any) {
    if (!user) {
      setLoading(false);
      return;
    }

    // Salva o email se marcou lembrar
    if (lembrar) {
      localStorage.setItem("astro_remember_email", user.email || email);
    }

    const { data: ong } = await supabase
      .from("ongs")
      .select("id, nome_organizacao")
      .eq("usuario_id", user.id)
      .single();

    if (ong) {
      localStorage.setItem("ong_nome", ong.nome_organizacao);
      localStorage.setItem("ong_id", ong.id);
      localStorage.setItem("tipo_usuario", "ong");
      router.push("/dashboard");
      return;
    }

    // SE NÃO TEM ONG, CRIA AUTOMATICAMENTE NO PRIMEIRO LOGIN COM GOOGLE
    const nomeOng = user.user_metadata?.full_name || user.email?.split('@')[0] || "Minha ONG";
    
    const { data: novaOng, error: erroOng } = await supabase
      .from("ongs")
      .insert({
        usuario_id: user.id,
        nome_organizacao: nomeOng,
        email: user.email,
        telefone: "",
        cidade: "",
        descricao: ""
      })
      .select("id, nome_organizacao")
      .single();

    if (novaOng) {
      localStorage.setItem("ong_nome", novaOng.nome_organizacao);
      localStorage.setItem("ong_id", novaOng.id);
      localStorage.setItem("tipo_usuario", "ong");
      router.push("/dashboard");
      return;
    }

    // Fallback adotante
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id, nome")
      .eq("id", user.id)
      .single();

    if (usuario) {
      localStorage.setItem("tipo_usuario", "adotante");
      router.push("/");
      return;
    }

    localStorage.setItem("tipo_usuario", "ong");
    router.push("/dashboard");
  }

  async function handleEsqueciSenha() {
    if (!email) {
      alert("Digite seu e-mail primeiro no campo acima");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });
    if (error) {
      alert("Erro ao enviar: " + error.message);
    } else {
      alert(`Enviamos um link de recuperação para ${email}. Checa seu e-mail!`);
    }
  }

  return (
    <main className={styles.login}>
      <section className={styles.ladoEsquerdo}>
        <img src="/logo-gato.png" alt="Astro" className={styles.logo} />
      </section>

      <section className={styles.ladoDireito}>
        <div className={styles.formulario}>
          <h1>Bem-vindo(a) de volta! Sentimos sua<br/>falta no nosso radar.</h1>

          <input
            type="email"
            placeholder="E-mail"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className={styles.input}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          <div className={styles.opcoes}>
            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
              />
              <span>Lembrar meu login</span>
            </label>
            <button type="button" className={styles.esqueci} onClick={handleEsqueciSenha}>
              Esqueci minha senha
            </button>
          </div>

          <button className={styles.botao} onClick={handleLogin} disabled={loading}>
            {loading ? "Entrando..." : "Entrar na Órbita"}
          </button>

          <div style={{ 
            textAlign: 'center', 
            margin: '15px 0', 
            color: 'white', 
            opacity: 0.9,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>ou</div>

          <button 
            className={styles.botao} 
            onClick={handleGoogleLogin} 
            disabled={loading}
            style={{ background: 'white', color: 'black', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="20" /> 
            Continuar com Google
          </button>
        </div>
      </section>
    </main>
  );
}

export default Login;