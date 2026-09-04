"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // seu client do supabase
import styles from "./Cadastro.module.css";

type Perfil = "explorador" | "guardiao" | "base-estelar" | "estacao";
type DadosIniciais = { nome: string; email: string; senha: string };

export function Cadastro() {
  const router = useRouter();
  const [perfilSelecionado, setPerfilSelecionado] = useState<Perfil | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [cep, setCep] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const dadosSalvos = sessionStorage.getItem("astroCadastroInicial");
    if (!dadosSalvos) return;
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

  async function finalizarCadastro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!perfilSelecionado) {
      alert("Escolha como você pretende orbitar com a gente.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem!");
      return;
    }
    if (senha.length < 6) {
      setErroSenha("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setErroSenha("");
    setCarregando(true);

    try {
      // 1. Cria o usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome, perfil: perfilSelecionado, cep }
        }
      });

      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Não foi possível criar usuário");

      // 2. Se for Guardião / Base Estelar / Estação -> cria na tabela ONGS (nome_organizacao)
      if (perfilSelecionado === "guardiao" || perfilSelecionado === "base-estelar" || perfilSelecionado === "estacao") {
        const { error: ongError } = await supabase.from("ongs").insert({
          nome_organizacao: nome, // sua coluna
          usuario_id: userId,
          regiao: cep, // usando cep como regiao por enquanto
          descricao: `Perfil: ${perfilSelecionado}`
        });
        if (ongError) throw ongError;

        localStorage.setItem("ong_nome", nome);
        // Salva pra dashboard usar
        sessionStorage.removeItem("astroCadastroInicial");
        router.push("/dashboard");
        return;
      }

      // 3. Se for Explorador -> cria na tabela usuarios
      if (perfilSelecionado === "explorador") {
        await supabase.from("usuarios").insert({
          id: userId, // se sua tabela usuarios usa uuid igual do auth
          nome,
          email
        });
        sessionStorage.removeItem("astroCadastroInicial");
        router.push("/"); // explorador vai pro site
        return;
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro ao cadastrar");
    } finally {
      setCarregando(false);
    }
  }

  const IconeOlhoAberto = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e63d68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );
  const IconeOlhoFechado = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e63d68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.53 9.53a3 3 0 1 0 4.24 4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  );

  return (
    <main className={styles.cadastro}>
      <section className={styles.conteudo}>
        <div className={styles.introducao}>
          <h1>Que bom ter você por aqui! Agradecemos imensamente por escolher o Astro para fazer parte da sua jornada e iluminar ainda mais a causa animal.</h1>
          <p>Para começarmos, como você pretende orbitar com a gente?</p>
        </div>

        <div className={styles.perfis}>
          <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "explorador" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("explorador")}>
            <img src={perfilSelecionado === "explorador" ? "/cadastro/explorador-rosa.svg" : "/cadastro/explorador-azul.svg"} alt="" className={styles.perfilIcone} />
            <h2>Explorador</h2><p>Quero adotar um pet ou encontrar clínicas parceiras para o meu companheiro.</p>
          </button>
          <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "guardiao" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("guardiao")}>
            <img src={perfilSelecionado === "guardiao" ? "/cadastro/guardiao-rosa.svg" : "/cadastro/guardiao-azul.svg"} alt="" className={styles.perfilIcone} />
            <h2>Guardião de<br/>Órbita</h2><p>Sou protetor(a) independente e realizo resgates e lares temporários.</p>
          </button>
          <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "base-estelar" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("base-estelar")}>
            <img src={perfilSelecionado === "base-estelar" ? "/cadastro/base-estelar-rosa.svg" : "/cadastro/base-estelar-azul.svg"} alt="" className={styles.perfilIcone} />
            <h2>Base Estelar</h2><p>Sou uma ONG ou abrigo estruturado de proteção animal.</p>
          </button>
          <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "estacao" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("estacao")}>
            <img src={perfilSelecionado === "estacao" ? "/cadastro/estacao-rosa.svg" : "/cadastro/estacao-azul.svg"} alt="" className={styles.perfilIcone} />
            <h2>Estação de<br/>Cuidado</h2><p>Sou uma clínica, hospital veterinário ou profissional de saúde animal.</p>
          </button>
        </div>

        <form className={styles.formulario} onSubmit={finalizarCadastro}>
          <input type="text" placeholder="Seu nome ou nome da instituição" className={styles.inputGrande} value={nome} onChange={(e) => setNome(e.target.value)} required />
          <input type="email" placeholder="E-mail" className={styles.inputGrande} value={email} onChange={(e) => setEmail(e.target.value)} required />

          <div className={styles.linhaInputs}>
            <div className={styles.inputComOlho}>
              <input type={mostrarSenha ? "text" : "password"} placeholder="Senha" className={styles.inputSenha} value={senha} onChange={(e) => { setSenha(e.target.value); setErroSenha(""); }} required />
              <button type="button" className={styles.botaoOlho} onClick={() => setMostrarSenha(!mostrarSenha)}>
                {mostrarSenha ? <IconeOlhoAberto /> : <IconeOlhoFechado />}
              </button>
            </div>
            <div className={styles.inputComOlho}>
              <input type={mostrarConfirmar ? "text" : "password"} placeholder="Confirmar senha" className={styles.inputSenha} value={confirmarSenha} onChange={(e) => { setConfirmarSenha(e.target.value); setErroSenha(""); }} required />
              <button type="button" className={styles.botaoOlho} onClick={() => setMostrarConfirmar(!mostrarConfirmar)}>
                {mostrarConfirmar ? <IconeOlhoAberto /> : <IconeOlhoFechado />}
              </button>
            </div>
          </div>

          {erroSenha && <span className={styles.erroSenha}>{erroSenha}</span>}
          <input type="text" placeholder="CEP" className={styles.inputGrande} value={cep} onChange={(e) => setCep(e.target.value)} required />
          <button type="submit" className={styles.botaoContinuar} disabled={carregando}>
            {carregando ? "Criando..." : "Continuar"}
          </button>
        </form>
      </section>
    </main>
  );
}