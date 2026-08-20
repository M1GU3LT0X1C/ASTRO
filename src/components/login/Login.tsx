"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./Login.module.css";

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha invalidos.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className={styles.login}>

      <section className={styles.ladoEsquerdo}>
        <img
          src="/logo-gato.png"
          alt="Astro"
          className={styles.logo}
        />
      </section>

      <section className={styles.ladoDireito}>
        <form className={styles.formulario} onSubmit={handleSubmit}>
          <h1>
            Bem-vindo(a) de volta! Sentimos sua
            <br />
            falta no nosso radar.
          </h1>

          <input
            type="email"
            placeholder="E-mail"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className={styles.input}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {erro && <p className={styles.erro}>{erro}</p>}

          <button type="submit" className={styles.botao} disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar na Órbita"}
          </button>
        </form>
      </section>

    </main>
  );
}
