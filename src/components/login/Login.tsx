"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./Login.module.css";

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("astro@astro.com");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    
    // 1. Faz login no Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Erro: " + error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      setLoading(false);
      return;
    }

    // 2. Verifica se é uma ONG (tabela ongs)
    const { data: ong } = await supabase
      .from("ongs")
      .select("id, nome_organizacao")
      .eq("usuario_id", user.id)
      .single();

    if (ong) {
      // É ONG -> vai pro dashboard da ONG
      localStorage.setItem("ong_nome", ong.nome_organizacao);
      localStorage.setItem("ong_id", ong.id);
      localStorage.setItem("tipo_usuario", "ong");
      router.push("/dashboard");
      return;
    }

    // 3. Se não é ONG, pode ser adotante / usuário comum
    // Aqui depois você cria a tabela "usuarios" ou "adotantes"
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id, nome")
      .eq("id", user.id)
      .single();

    if (usuario) {
      localStorage.setItem("tipo_usuario", "adotante");
      router.push("/"); // ou /explorar
      return;
    }

    // 4. Se não achou em nenhuma, mas logou, manda pro dashboard mesmo (seu caso agora)
    localStorage.setItem("tipo_usuario", "ong");
    router.push("/dashboard");
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

          <button className={styles.botao} onClick={handleLogin} disabled={loading}>
            {loading ? "Entrando..." : "Entrar na Órbita"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default Login;