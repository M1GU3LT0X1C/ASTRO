"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./Cadastro.module.css";

type Perfil = "explorador" | "guardiao" | "base-estelar" | "estacao";
type DadosIniciais = { nome: string; email: string; senha: string };

export function Cadastro() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [perfilSelecionado, setPerfilSelecionado] = useState<Perfil | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [cep, setCep] = useState("");
  const [telefone, setTelefone] = useState("");
  const [documento, setDocumento] = useState("");
  const [moradia, setMoradia] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [instagram, setInstagram] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function maskCPF(v: string) {
    return v.replace(/\D/g, "").slice(0,11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  function maskCNPJ(v: string) {
    return v.replace(/\D/g, "").slice(0,14)
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  function maskPhone(v: string) {
    const nums = v.replace(/\D/g, "").slice(0,11);
    if (nums.length <= 10) return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  }
  function maskCEP(v: string) {
    return v.replace(/\D/g, "").slice(0,8).replace(/(\d{5})(\d)/, "$1-$2");
  }
  function handleDocumento(v: string) {
    const clean = v.replace(/\D/g, "");
    if (perfilSelecionado === "base-estelar" || perfilSelecionado === "estacao") {
      setDocumento(clean.length <= 11 ? maskCPF(v) : maskCNPJ(v));
    } else {
      setDocumento(maskCPF(v));
    }
  }

  const checks = {
    length: senha.length >= 8 && senha.length <= 18,
    upper: /[A-Z]/.test(senha),
    lower: /[a-z]/.test(senha),
    number: /[0-9]/.test(senha),
    special: /[@$!%*?&._-]/.test(senha),
  };
  const senhaForca = Object.values(checks).filter(Boolean).length;
  const senhaOk = senhaForca === 5;
  const confirmOk = confirmarSenha !== "" && senha === confirmarSenha && senha.length <= 18;

  useEffect(() => {
    const dadosSalvos = sessionStorage.getItem("astroCadastroInicial");
    if (!dadosSalvos) return;
    try {
      const dados: DadosIniciais = JSON.parse(dadosSalvos);
      setNome(dados.nome ?? "");
      setEmail(dados.email ?? "");
      setSenha(dados.senha ?? "");
    } catch { sessionStorage.removeItem("astroCadastroInicial"); }
  }, []);

  function selecionarPerfil(perfil: Perfil) {
    setPerfilSelecionado(perfil);
    setEtapa(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finalizarCadastro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!perfilSelecionado) return;
    if (!senhaOk) { setErroSenha("Sua senha precisa cumprir todos os requisitos"); return; }
    if (senha !== confirmarSenha) { setErroSenha("As senhas não coincidem!"); return; }
    setCarregando(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password: senha, options: { data: { nome, perfil: perfilSelecionado } }
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Erro ao criar usuário");
      if (perfilSelecionado !== "explorador") {
        const { error } = await supabase.from("ongs").insert({
          usuario_id: userId,
          nome_organizacao: nome,
          tipo_perfil: perfilSelecionado,
          documento: documento,
          telefone: telefone,
          cep: cep,
          regiao: cep,
          descricao: `${perfilSelecionado} ${responsavel ? '| Resp:'+responsavel : ''} ${instagram ? '| IG:'+instagram : ''}`.trim()
        });
        if (error) throw error;
        localStorage.setItem("ong_nome", nome);
        localStorage.setItem("tipo_usuario", perfilSelecionado);
        sessionStorage.removeItem("astroCadastroInicial");
        router.push("/dashboard");
        return;
      }
      const { error } = await supabase.from("usuarios").insert({ id: userId, nome, email, telefone, cidade: cep });
      if (error) throw error;
      localStorage.setItem("tipo_usuario", "explorador");
      sessionStorage.removeItem("astroCadastroInicial");
      router.push("/");
    } catch (err: any) { alert(err.message || "Erro ao cadastrar"); }
    finally { setCarregando(false); }
  }

  async function handleGoogleCadastro() {
    if (!perfilSelecionado) { alert("Escolhe um perfil primeiro"); return; }
    localStorage.setItem("astro_perfil_pendente", perfilSelecionado);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } });
    if (error) alert(error.message);
  }

  const IconeOlhoAberto = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a0b5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
  const IconeOlhoFechado = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a0b5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.53 9.53a3 3 0 1 0 4.24 4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>);

  const isOng = perfilSelecionado === "base-estelar";
  const isGuardiao = perfilSelecionado === "guardiao";
  const isEstacao = perfilSelecionado === "estacao";
  const isExplorador = perfilSelecionado === "explorador";
  const placeholderDoc = isOng ? "CNPJ - 00.000.000/0000-00" : isEstacao ? "CNPJ ou CPF" : isGuardiao ? "CPF - 000.000.000-00" : "";

  return (
    <main className={styles.cadastro}>
      <section className={styles.conteudo}>
        {etapa === 1 && (
          <>
            <div className={styles.introducao}>
              <h1>Que bom ter você por aqui! Agradecemos imensamente por escolher o Astro para fazer parte da sua jornada e iluminar ainda mais a causa animal.</h1>
              <p>Para começarmos, como você pretende orbitar com a gente?</p>
              <span className={styles.dicaScroll}>Arraste para o lado →</span>
            </div>
            <div className={styles.perfis}>
              <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "explorador" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("explorador")}><img src={perfilSelecionado === "explorador" ? "/cadastro/explorador-rosa.svg" : "/cadastro/explorador-azul.svg"} alt="" className={styles.perfilIcone} /><h2>Explorador</h2><p>Quero <strong>adotar</strong> um pet ou encontrar clínicas parceiras.</p><span className={styles.tag}>Tutor / Adotante</span></button>
              <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "guardiao" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("guardiao")}><img src={perfilSelecionado === "guardiao" ? "/cadastro/guardiao-rosa.svg" : "/cadastro/guardiao-azul.svg"} alt="" className={styles.perfilIcone} /><h2>Guardião de Órbita</h2><p>Sou protetor(a) independente e realizo resgates e lares temporários.</p><span className={styles.tag}>Protetor Independente</span></button>
              <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "base-estelar" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("base-estelar")}><img src={perfilSelecionado === "base-estelar" ? "/cadastro/base-estelar-rosa.svg" : "/cadastro/base-estelar-azul.svg"} alt="" className={styles.perfilIcone} /><h2>Base Estelar</h2><p>Sou uma <strong>ONG ou abrigo</strong> estruturado de proteção animal.</p><span className={styles.tag}>ONG / Abrigo</span></button>
              <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "estacao" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("estacao")}><img src={perfilSelecionado === "estacao" ? "/cadastro/estacao-rosa.svg" : "/cadastro/estacao-azul.svg"} alt="" className={styles.perfilIcone} /><h2>Estação de Cuidado</h2><p>Sou uma <strong>clínica, hospital</strong> ou profissional de saúde animal.</p><span className={styles.tag}>Clínica / Vet</span></button>
            </div>
            <div className={styles.dots}><span></span><span></span><span></span><span></span></div>
          </>
        )}

        {etapa === 2 && perfilSelecionado && (
          <>
            <button className={styles.voltar} onClick={() => setEtapa(1)}>← Voltar</button>
            <div className={styles.introducao}>
              <h1>Criando sua conta de <span style={{color:'#e63d68'}}>{perfilSelecionado}</span></h1>
              <p>{isExplorador ? "Você poderá adotar e salvar pets favoritos" : "Você poderá cadastrar pets para adoção e gerenciar sua base"}</p>
            </div>

            <form className={styles.formulario} onSubmit={finalizarCadastro}>
              <input type="text" placeholder={isOng ? "Nome da ONG / Abrigo" : isEstacao ? "Nome da Clínica" : "Seu nome completo"} className={styles.inputGrande} value={nome} onChange={(e) => setNome(e.target.value)} required />
              <input type="email" placeholder="E-mail principal" className={styles.inputGrande} value={email} onChange={(e) => setEmail(e.target.value)} required />

              <div className={styles.linhaInputs}>
                {!isExplorador && <input type="text" placeholder={placeholderDoc} className={styles.inputMetade} value={documento} onChange={(e) => handleDocumento(e.target.value)} />}
                <input type="text" placeholder="Telefone (11) 99999-9999" className={styles.inputMetade} value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} required />
              </div>

              {isOng && <><input type="text" placeholder="Nome do responsável" className={styles.inputGrande} value={responsavel} onChange={(e) => setResponsavel(e.target.value)} required /><input type="text" placeholder="Instagram da ONG @" className={styles.inputGrande} value={instagram} onChange={(e) => setInstagram(e.target.value)} /></>}

              <div className={styles.linhaInputs}>
                <div className={styles.inputComOlho}>
                  <input type={mostrarSenha ? "text" : "password"} placeholder="Senha" maxLength={18} className={`${styles.inputSenha} ${senha.length > 0 ? (senhaOk ? styles.inputOk : styles.inputErro) : ''}`} value={senha} onChange={(e) => { setSenha(e.target.value); setErroSenha(""); }} required />
                  <button type="button" className={styles.botaoOlho} onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? <IconeOlhoAberto /> : <IconeOlhoFechado />}</button>
                </div>
                <div className={styles.inputComOlho}>
                  <input type={mostrarConfirmar ? "text" : "password"} placeholder="Confirmar senha" maxLength={18} className={`${styles.inputSenha} ${confirmarSenha.length > 0 ? (confirmOk ? styles.inputOk : styles.inputErro) : ''}`} value={confirmarSenha} onChange={(e) => { setConfirmarSenha(e.target.value); setErroSenha(""); }} required />
                  <button type="button" className={styles.botaoOlho} onClick={() => setMostrarConfirmar(!mostrarConfirmar)}>{mostrarConfirmar ? <IconeOlhoAberto /> : <IconeOlhoFechado />}</button>
                </div>
              </div>

              {(senha.length > 0 || confirmarSenha.length > 0) && (
                <div className={styles.senhaChecklist}>
                  <div className={styles.forcaBarra}><div className={styles.forcaPreenchimento} style={{ width: `${senhaForca * 20}%`, background: senhaForca < 3 ? '#e63d68' : senhaForca < 5 ? '#f0a500' : '#1ab86e' }}></div></div>
                  <p className={checks.length ? styles.checkOk : styles.checkErro}>• 8 a 18 caracteres</p>
                  <p className={checks.upper ? styles.checkOk : styles.checkErro}>• Letra maiúscula (A-Z)</p>
                  <p className={checks.lower ? styles.checkOk : styles.checkErro}>• Letra minúscula (a-z)</p>
                  <p className={checks.number ? styles.checkOk : styles.checkErro}>• Número (0-9)</p>
                  <p className={checks.special ? styles.checkOk : styles.checkErro}>• Caractere especial (@ $ ! % * ? &)</p>
                  {confirmarSenha.length > 0 && <p className={confirmOk ? styles.checkOk : styles.checkErro}>• {confirmOk ? "Senhas iguais ✓" : "Senhas não coincidem"}</p>}
                </div>
              )}

              {erroSenha && <span className={styles.erroSenha}>{erroSenha}</span>}
              <input type="text" placeholder="CEP - 00000-000" className={styles.inputGrande} value={cep} onChange={(e) => setCep(maskCEP(e.target.value))} required />

              <button type="submit" className={styles.botaoContinuar} disabled={carregando || !senhaOk || !confirmOk}>
                {carregando ? "Criando..." : `Criar conta de ${perfilSelecionado}`}
              </button>

              <div className={styles.divisor}>ou</div>
              <button type="button" className={styles.botaoGoogle} onClick={handleGoogleCadastro}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="20" alt="" /> Continuar com Google
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}