"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { alerta } from "@/lib/alerta";
import { definirLogo } from "@/lib/perfil";
import { buscarMinhaOng, salvarMinhaOng, type StatusVagas } from "@/lib/ong";
import { enviarImagemPublica, validarImagem } from "@/lib/upload";
import styles from "./Perfil.module.css";

type Contatos = { whatsappContato: string; instagram: string };

const OPCOES_VAGAS: { valor: StatusVagas; texto: string }[] = [
  { valor: "com", texto: "COM VAGAS" },
  { valor: "lotado", texto: "LOTADO" },
  { valor: "superlotado", texto: "SUPERLOTADO" },
];

export default function PerfilOngPage() {
  const [foto, setFoto] = useState("");
  const [capa, setCapa] = useState("");
  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [endereco, setEndereco] = useState("");
  const [ocultarEndereco, setOcultarEndereco] = useState(true);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [raio, setRaio] = useState(30);
  const [statusVagas, setStatusVagas] = useState<StatusVagas>("com");
  const [contatos, setContatos] = useState<Contatos>({ whatsappContato: "", instagram: "" });
  const [emailPublico, setEmailPublico] = useState("");
  const [facebook, setFacebook] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [falhaCarga, setFalhaCarga] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const inputCapaRef = useRef<HTMLInputElement>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  // Carrega o perfil salvo no back-end.
  useEffect(() => {
    buscarMinhaOng()
      .then((ong) => {
        setFoto(ong.logoUrl || "");
        setCapa(ong.capaUrl || "");
        setNome(ong.nomeOrganizacao || "");
        setBio(ong.descricao || "");
        setEndereco(ong.endereco || "");
        setOcultarEndereco(ong.ocultarEndereco !== false);
        setCidade(ong.cidade || "");
        setEstado(ong.estado || "");
        setRaio(ong.raioAtuacao ?? 30);
        setStatusVagas(ong.statusVagas || "com");
        setEmailPublico(ong.emailPublico || "");
        setFacebook(ong.facebook || "");
        setContatos({ whatsappContato: ong.whatsapp || "", instagram: ong.instagram || "" });
      })
      .catch((erro) => {
        // sem os dados atuais, salvar apagaria o perfil: bloqueia ate recarregar
        setFalhaCarga(true);
        alerta.erro("Não foi possível carregar o perfil", erro instanceof Error ? erro.message : "Recarregue a página.");
      })
      .finally(() => setCarregando(false));
  }, []);

  function atualizarContato(campo: keyof Contatos, valor: string) {
    setContatos((atual) => ({ ...atual, [campo]: valor }));
    setSalvo(false);
  }

  async function salvarPerfil() {
    if (!nome.trim()) {
      alerta.aviso("Nome obrigatório", "Informe o nome da ONG ou do protetor.");
      return;
    }
    setSalvando(true);
    try {
      await salvarMinhaOng({
        nomeOrganizacao: nome.trim(), descricao: bio, capaUrl: capa, endereco, ocultarEndereco,
        cidade, estado, raioAtuacao: raio, statusVagas, emailPublico, facebook,
        whatsapp: contatos.whatsappContato, instagram: contatos.instagram,
      });
      localStorage.setItem("ong_nome", nome.trim());
      setSalvo(true);
    } catch (erro) {
      alerta.erro("Não foi possível salvar o perfil", erro instanceof Error ? erro.message : undefined);
    } finally {
      setSalvando(false);
    }
  }

  async function trocarCapa(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;
    const problema = validarImagem(arquivo, 3);
    if (problema) { alerta.erro(problema); return; }

    setEnviandoCapa(true);
    try {
      setCapa(await enviarImagemPublica(arquivo, "capas"));
      setSalvo(false);
    } catch (erro) {
      alerta.erro("Erro ao enviar a capa", erro instanceof Error ? erro.message : undefined);
    } finally {
      setEnviandoCapa(false);
    }
  }

  async function trocarFoto(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    const problema = validarImagem(arquivo, 5);
    if (problema) { alerta.erro(problema); return; }

    setEnviandoFoto(true);
    try {
      const url = await enviarImagemPublica(arquivo, "logos");
      await definirLogo(url);
      setFoto(url);
      localStorage.setItem("ong_foto", url);
    } catch (erro) {
      alerta.erro("Erro ao salvar a foto", erro instanceof Error ? erro.message : undefined);
    } finally {
      setEnviandoFoto(false);
      if (inputFotoRef.current) inputFotoRef.current.value = "";
    }
  }

  if (carregando) return <main className={styles.page}><p>Carregando perfil...</p></main>;
  if (falhaCarga) {
    return (
      <main className={styles.page}>
        <p>Não foi possível carregar o perfil agora. <button type="button" className={styles.primary} onClick={() => window.location.reload()}>Tentar novamente</button></p>
      </main>
    );
  }

  return (
    <>
      <main className={styles.page}>
        <div className={styles.profilePanel}>
          <div className={styles.profileTop}>
            <h2>Configuração do Perfil da ONG</h2>
            <button type="button" className={styles.primary} onClick={salvarPerfil} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>

          <section>
            <h3>Apresentação</h3>
            <button
              type="button"
              className={styles.cover}
              onClick={() => inputCapaRef.current?.click()}
              style={capa ? { backgroundImage: `url(${capa})` } : undefined}
            >
              <span>{enviandoCapa ? "Enviando..." : capa ? "Alterar capa" : "Capa de Perfil"}</span>
            </button>
            <input ref={inputCapaRef} className={styles.hiddenInput} type="file" accept="image/*" onChange={trocarCapa} />

            <div className={styles.profileFields}>
              <div className={styles.logoColumn}>
                <strong>Logotipo/Foto de Perfil</strong>
                <div className={styles.largeAvatar}>
                  {foto && <img src={foto} alt="Foto da ONG" />}
                </div>
                <input ref={inputFotoRef} className={styles.hiddenInput} type="file" accept="image/*" onChange={trocarFoto} />
                <button
                  type="button"
                  className={styles.pinkButton}
                  disabled={enviandoFoto}
                  onClick={() => inputFotoRef.current?.click()}
                >
                  {enviandoFoto ? "Enviando..." : "Alterar"}
                </button>
              </div>

              <div className={styles.profileText}>
                <label>
                  Nome da ONG/Protetor
                  <input placeholder="Digite aqui o nome" value={nome} onChange={(e) => { setNome(e.target.value); setSalvo(false); }} />
                </label>
                <label>
                  Biografia/História
                  <textarea placeholder="Sobre você" value={bio} onChange={(e) => setBio(e.target.value)} />
                </label>
              </div>
            </div>
          </section>

          <section>
            <h3>Localização &amp; Atendimento</h3>
            <div className={styles.profileLocation}>
              <label>
                Endereço Físico
                <input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
              </label>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={ocultarEndereco} onChange={(e) => setOcultarEndereco(e.target.checked)} />
                Ocultar endereço exato por segurança
                <span className={styles.privacyState}>{ocultarEndereco ? "Oculto" : "Exibir"}</span>
              </label>
              {ocultarEndereco && <p className={styles.locationNote}>◈ Endereço exato ocultado por segurança</p>}

              <div className={styles.twoFields}>
                <label>Cidade<input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} /></label>
                <label>Estado<input placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} /></label>
              </div>

              <label className={styles.rangeLabel}>
                <span className={styles.rangeHeading}>Raio de Atuação <span>{raio} km</span></span>
                <input type="range" min="1" max="100" value={raio} onChange={(e) => setRaio(Number(e.target.value))} />
              </label>

              <strong>Status de Vagas</strong>
              <div className={styles.vacancies}>
                <span>Selecione ao lado o Status atual em relação à quantidade de vagas disponíveis na sua ONG</span>
                <div className={styles.vacancyOptions}>
                  {OPCOES_VAGAS.map(({ valor, texto }) => (
                    <button
                      key={valor}
                      type="button"
                      className={statusVagas === valor ? styles.vacancyActive : ""}
                      onClick={() => setStatusVagas(valor)}
                    >
                      {texto}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3>Contatos de Emergência &amp; Redes</h3>
            <div className={styles.twoFields}>
              <label>WhatsApp Institucional<input placeholder="(00) 00000-0000" value={contatos.whatsappContato} onChange={(e) => atualizarContato("whatsappContato", e.target.value)} /></label>
              <label>E-mail Público<input type="email" placeholder="contato@suaong.com" value={emailPublico} onChange={(e) => setEmailPublico(e.target.value)} /></label>
              <label>Instagram<input placeholder="@seuinstagram" value={contatos.instagram} onChange={(e) => atualizarContato("instagram", e.target.value)} /></label>
              <label>Facebook<input placeholder="facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} /></label>
            </div>
          </section>
        </div>
        {salvo && <p className={styles.saved} role="status">Alterações salvas.</p>}
      </main>
    </>
  );
}
