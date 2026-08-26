"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Footer.module.css";

export function Footer() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function continuarCadastro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    sessionStorage.setItem(
      "astroCadastroInicial",
      JSON.stringify({
        nome,
        email,
        senha,
      })
    );

    router.push("/cadastro");
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.topo}>
        <h2 className={styles.titulo}>
          Pronto para entrar na órbita do Astro?
        </h2>

        <p className={styles.descricao}>
          O cadastro no Astro é 100% gratuito para tutores, ONGs e clínicas.
          Junte-se a nós para transformar o cuidado animal e aproximar quem
          ama, quem resgata e quem cuida!
        </p>

        <div className={styles.lista}>
          <div className={styles.item}>
            <img
              src="/icone-ong.svg"
              alt=""
              className={styles.icone}
            />

            <div>
              <h3 className={styles.itemTitulo}>
                É uma ONG?
              </h3>

              <p className={styles.itemTexto}>
                Cadastre seus bichinhos na nossa vitrine e amplie seu alcance
                de adoções.
              </p>
            </div>
          </div>

          <div className={styles.item}>
            <img
              src="/icone-tutor.svg"
              alt=""
              className={styles.icone}
            />

            <div>
              <h3 className={styles.itemTitulo}>
                É um tutor?
              </h3>

              <p className={styles.itemTexto}>
                Encontre seu novo amigo e cuide da saúde dele com descontos e
                praticidade.
              </p>
            </div>
          </div>

          <div className={styles.item}>
            <img
              src="/icone-clinica.svg"
              alt=""
              className={styles.icone}
            />

            <div>
              <h3 className={styles.itemTitulo}>
                É uma clínica?
              </h3>

              <p className={styles.itemTexto}>
                Conecte-se a tutores da sua região e mostre seu trabalho na
                comunidade.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitulo}>
          Crie sua conta Astro
        </h3>

        <form
          className={styles.formulario}
          onSubmit={continuarCadastro}
        >
          <input
            className={styles.input}
            placeholder="Nome"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
          />

          <input
            className={styles.input}
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            className={styles.input}
            placeholder="Senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
          />

          <button
            type="submit"
            className={styles.botao}
          >
            Continuar
          </button>
        </form>
      </div>
    </footer>
  );
}