import styles from "./Login.module.css";

export function Login() {
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
        <div className={styles.formulario}>
          <h1>
            Bem-vindo(a) de volta! Sentimos sua
            <br />
            falta no nosso radar.
          </h1>

          <input
            type="email"
            placeholder="E-mail"
            className={styles.input}
          />

          <input
            type="password"
            placeholder="Senha"
            className={styles.input}
          />

          <button className={styles.botao}>
            Entrar na Órbita
          </button>
        </div>
      </section>

    </main>
  );
}