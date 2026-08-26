"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./Cadastro.module.css";

type Perfil =
  | "explorador"
  | "guardiao"
  | "base-estelar"
  | "estacao";

type DadosIniciais = {
  nome: string;
  email: string;
  senha: string;
};

export function Cadastro() {
  const [perfilSelecionado, setPerfilSelecionado] =
    useState<Perfil | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cep, setCep] = useState("");

  useEffect(() => {
    const dadosSalvos = sessionStorage.getItem(
      "astroCadastroInicial"
    );

    if (!dadosSalvos) {
      return;
    }

    try {
      const dados: DadosIniciais = JSON.parse(dadosSalvos);

      setNome(dados.nome ?? "");
      setEmail(dados.email ?? "");
      setSenha(dados.senha ?? "");
    } catch {
      sessionStorage.removeItem("astroCadastroInicial");
    }
  }, []);

  function selecionarPerfil(perfil: Perfil) {
    setPerfilSelecionado(perfil);
  }

  function finalizarCadastro(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!perfilSelecionado) {
      alert("Escolha como você pretende orbitar com a gente.");
      return;
    }

    const dadosCadastro = {
      perfil: perfilSelecionado,
      nome,
      email,
      senha,
      cep,
    };

    console.log("Cadastro:", dadosCadastro);

    sessionStorage.removeItem("astroCadastroInicial");
  }

  return (
    <main className={styles.cadastro}>
      <section className={styles.conteudo}>

        {/* INTRODUÇÃO */}

        <div className={styles.introducao}>
          <h1>
            Que bom ter você por aqui! Agradecemos imensamente por escolher o
            Astro para fazer parte da sua jornada e iluminar ainda mais a causa
            animal.
          </h1>

          <p>
            Para começarmos, como você pretende orbitar com a gente?
          </p>
        </div>


        {/* PERFIS */}

        <div className={styles.perfis}>

          {/* EXPLORADOR */}

          <button
            type="button"
            className={`${styles.perfilCard} ${
              perfilSelecionado === "explorador"
                ? styles.perfilSelecionado
                : ""
            }`}
            onClick={() => selecionarPerfil("explorador")}
          >
            <img
              src={
                perfilSelecionado === "explorador"
                  ? "/cadastro/explorador-rosa.svg"
                  : "/cadastro/explorador-azul.svg"
              }
              alt=""
              className={styles.perfilIcone}
            />

            <h2>Explorador</h2>

            <p>
              Quero adotar um pet ou encontrar clínicas parceiras para o meu
              companheiro.
            </p>
          </button>


          {/* GUARDIÃO */}

          <button
            type="button"
            className={`${styles.perfilCard} ${
              perfilSelecionado === "guardiao"
                ? styles.perfilSelecionado
                : ""
            }`}
            onClick={() => selecionarPerfil("guardiao")}
          >
            <img
              src={
                perfilSelecionado === "guardiao"
                  ? "/cadastro/guardiao-rosa.svg"
                  : "/cadastro/guardiao-azul.svg"
              }
              alt=""
              className={styles.perfilIcone}
            />

            <h2>
              Guardião de
              <br />
              Órbita
            </h2>

            <p>
              Sou protetor(a) independente e realizo resgates e lares
              temporários.
            </p>
          </button>


          {/* BASE ESTELAR */}

          <button
            type="button"
            className={`${styles.perfilCard} ${
              perfilSelecionado === "base-estelar"
                ? styles.perfilSelecionado
                : ""
            }`}
            onClick={() => selecionarPerfil("base-estelar")}
          >
            <img
              src={
                perfilSelecionado === "base-estelar"
                  ? "/cadastro/base-estelar-rosa.svg"
                  : "/cadastro/base-estelar-azul.svg"
              }
              alt=""
              className={styles.perfilIcone}
            />

            <h2>
              Base Estelar
            </h2>

            <p>
              Sou uma ONG ou abrigo estruturado de proteção animal.
            </p>
          </button>


          {/* ESTAÇÃO */}

          <button
            type="button"
            className={`${styles.perfilCard} ${
              perfilSelecionado === "estacao"
                ? styles.perfilSelecionado
                : ""
            }`}
            onClick={() => selecionarPerfil("estacao")}
          >
            <img
              src={
                perfilSelecionado === "estacao"
                  ? "/cadastro/estacao-rosa.svg"
                  : "/cadastro/estacao-azul.svg"
              }
              alt=""
              className={styles.perfilIcone}
            />

            <h2>
              Estação de
              <br />
              Cuidado
            </h2>

            <p>
              Sou uma clínica, hospital veterinário ou profissional de saúde
              animal.
            </p>
          </button>

        </div>


        {/* FORMULÁRIO */}

        <form
          className={styles.formulario}
          onSubmit={finalizarCadastro}
        >
          <input
            type="text"
            placeholder="Seu nome ou nome da instituição"
            className={styles.inputGrande}
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
          />

          <input
            type="email"
            placeholder="E-mail"
            className={styles.inputGrande}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <div className={styles.linhaInputs}>
            <input
              type="password"
              placeholder="Senha"
              className={styles.inputMetade}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />

            <input
              type="text"
              placeholder="CEP"
              className={styles.inputMetade}
              value={cep}
              onChange={(event) => setCep(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.botaoContinuar}
          >
            Continuar
          </button>
        </form>

      </section>
    </main>
  );
}