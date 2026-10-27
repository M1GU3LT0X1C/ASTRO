"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Header } from "@/components/layout/Header";
import { alerta } from "@/lib/alerta";
import { definirLogo } from "@/lib/perfil";
import { supabase } from "@/lib/supabase";
import styles from "./Perfil.module.css";

type StatusVagas = "com" | "lotado" | "superlotado";
type Contatos = { whatsappContato: string; instagram: string };
type PerfilSalvo = {
  nome?: string;
  bio?: string;
  endereco?: string;
  ocultarEndereco?: boolean;
  cidade?: string;
  estado?: string;
  raio?: number;
  statusVagas?: StatusVagas;
  capa?: string;
  emailPublico?: string;
  facebook?: string;
};

const CHAVE_PERFIL = "astro_ong_perfil_visual_v1";
const CHAVE_CONFIG = "astro_ong_configuracoes_v1";
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
  const [salvo, setSalvo] = useState(false);

  const inputCapaRef = useRef<HTMLInputElement>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  // Carrega os dados salvos no navegador.
  useEffect(() => {
    try {
      const perfil: PerfilSalvo = JSON.parse(localStorage.getItem(CHAVE_PERFIL) || "{}");
      const configuracoes: Partial<Contatos> = JSON.parse(localStorage.getItem(CHAVE_CONFIG) || "{}");

      setFoto(localStorage.getItem("ong_foto") || "");
      setNome(perfil.nome || "");
      setBio(perfil.bio || "");
      setEndereco(perfil.endereco || "");
      setOcultarEndereco(perfil.ocultarEndereco !== false);
      setCidade(perfil.cidade || "");
      setEstado(perfil.estado || "");
      setRaio(perfil.raio ?? 30);
      setStatusVagas(perfil.statusVagas || "com");
      setCapa(perfil.capa || "");
      setEmailPublico(perfil.emailPublico || "");
      setFacebook(perfil.facebook || "");
      setContatos({
        whatsappContato: configuracoes.whatsappContato || "",
        instagram: configuracoes.instagram || "",
      });
    } catch {
      // Mantém os valores iniciais se o armazenamento estiver inválido.
    }
  }, []);

  function atualizarContato(campo: keyof Contatos, valor: string) {
    setContatos((atual) => ({ ...atual, [campo]: valor }));
    setSalvo(false);
  }

  function salvarPerfil() {
    try {
      const perfil: PerfilSalvo = {
        nome, bio, endereco, ocultarEndereco, cidade, estado,
        raio, statusVagas, capa, emailPublico, facebook,
      };
      const configuracoes = JSON.parse(localStorage.getItem(CHAVE_CONFIG) || "{}");

      localStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil));
      localStorage.setItem(CHAVE_CONFIG, JSON.stringify({ ...configuracoes, ...contatos }));
      setSalvo(true);
    } catch {
      alerta.erro("Não foi possível salvar o perfil neste navegador.");
    }
  }

  function trocarCapa(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/") || arquivo.size > 3 * 1024 * 1024) {
      alerta.erro("Selecione uma imagem de até 3 MB.");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      if (typeof leitor.result === "string") {
        setCapa(leitor.result);
        setSalvo(false);
      }
    };
    leitor.readAsDataURL(arquivo);
    evento.target.value = "";
  }

  async function trocarFoto(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/") || arquivo.size > 5 * 1024 * 1024) {
      alerta.erro("Selecione uma imagem de até 5 MB.");
      return;
    }

    setEnviandoFoto(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alerta.erro("Login necessário", "Entre na conta da ONG para enviar a foto.");
        return;
      }

      const extensao = arquivo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const caminho = `logos/${user.id}-${Date.now()}.${extensao}`;
      const armazenamento = supabase.storage.from("animais-fotos");
      const { error } = await armazenamento.upload(caminho, arquivo, { contentType: arquivo.type });
      if (error) throw error;

      const url = armazenamento.getPublicUrl(caminho).data.publicUrl;
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

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.profilePanel}>
          <div className={styles.profileTop}>
            <h2>Configuração do Perfil da Base</h2>
            <button type="button" className={styles.primary} onClick={salvarPerfil}>
              Salvar Alterações
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
              <span>{capa ? "Alterar capa" : "Capa de Perfil"}</span>
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
                  <input placeholder="Digite aqui o nome" value={nome} onChange={(e) => setNome(e.target.value)} />
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
        {salvo && <p className={styles.saved} role="status">Alterações salvas neste navegador.</p>}
      </main>
    </>
  );
}
