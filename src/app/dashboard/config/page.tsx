"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { definirLogo } from "@/lib/perfil";
import { alerta } from "@/lib/alerta";
import styles from "./Configuracoes.module.css";
import Link from "next/link";

type Section = "seguranca" | "preferencias" | "colaboradores" | "integracoes" | "adocao";
type Settings = {
  email: boolean; whatsapp: boolean; sms: boolean; realtime: boolean;
  mensagens: boolean; agenda: boolean; cupons: boolean; checkin: boolean;
  site: string; instagram: string; whatsappContato: string;
  idadeMinima: string; moradia: string; entrevista: boolean; visita: boolean; termo: boolean;
};
const initial: Settings = {
  email: true, whatsapp: true, sms: false, realtime: true,
  mensagens: true, agenda: true, cupons: true, checkin: true,
  site: "", instagram: "", whatsappContato: "",
  idadeMinima: "18", moradia: "qualquer", entrevista: true, visita: false, termo: true,
};
const storageKey = "astro_ong_configuracoes_v1";

export default function Page() {
  const [open, setOpen] = useState<Section | null>(null);
  const [settings, setSettings] = useState<Settings>(initial);
  const [foto, setFoto] = useState("");
  const [capa, setCapa] = useState("");
  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [endereco, setEndereco] = useState("");
  const [ocultarEndereco, setOcultarEndereco] = useState(false);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [raio, setRaio] = useState(30);
  const [statusVagas, setStatusVagas] = useState("com");
  const [emailLogin, setEmailLogin] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [twoFactor, setTwoFactor] = useState<boolean | null>(null);
  const [documento, setDocumento] = useState<File | null>(null);
  const documentoRef = useRef<HTMLInputElement>(null);
  const capaRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [colaborador, setColaborador] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [nivelAcesso, setNivelAcesso] = useState<"administrador" | "voluntario" | "clinica">("voluntario");
  const [convites, setConvites] = useState<{ email: string; nivel: string; status: "rascunho" | "email" }[]>([]);
  const [integracaoEditando, setIntegracaoEditando] = useState<string | null>(null);
  const [integracaoValor, setIntegracaoValor] = useState("");
  const [integracaoAviso, setIntegracaoAviso] = useState("");

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(storageKey);
      if (savedSettings) setSettings({ ...initial, ...JSON.parse(savedSettings) });
      const draftInvites = localStorage.getItem("astro_ong_convites_rascunho_v1");
      if (draftInvites) setConvites(JSON.parse(draftInvites));
      setFoto(localStorage.getItem("ong_foto") || "");
      const perfil = JSON.parse(localStorage.getItem("astro_ong_perfil_visual_v1") || "{}");
      setNome(perfil.nome || ""); setBio(perfil.bio || ""); setEndereco(perfil.endereco || "");
      setCidade(perfil.cidade || ""); setEstado(perfil.estado || "");
      setOcultarEndereco(Boolean(perfil.ocultarEndereco)); setRaio(perfil.raio ?? 30);
      setStatusVagas(perfil.statusVagas || "com"); setCapa(perfil.capa || "");
    } catch { /* Storage indisponível ou inválido */ }
  }, []);

  const salvarPerfil = () => {
    try {
      localStorage.setItem("astro_ong_perfil_visual_v1", JSON.stringify({ nome, bio, endereco, cidade, estado, ocultarEndereco, raio, statusVagas, capa }));
      setSaved(true);
    } catch { alerta.erro("Não foi possível salvar o perfil neste navegador."); }
  };
  const trocarCapa = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 3 * 1024 * 1024) { alerta.erro("Selecione uma imagem de até 3 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setCapa(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };
  const alterarEmail = async () => {
    if (!emailLogin.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alerta.erro("Entre na sua conta para alterar o e-mail."); return; }
    const { error } = await supabase.auth.updateUser({ email: emailLogin.trim() });
    if (error) alerta.erro("Não foi possível alterar o e-mail", error.message);
    else { setEmailLogin(""); window.alert("Solicitação enviada. Verifique seu e-mail para confirmar a alteração."); }
  };
  const alterarSenha = async () => {
    if (novaSenha.length < 6) { alerta.erro("A senha precisa ter pelo menos 6 caracteres."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alerta.erro("Entre na sua conta para alterar a senha."); return; }
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) alerta.erro("Não foi possível alterar a senha", error.message);
    else { setNovaSenha(""); window.alert("Senha atualizada."); }
  };
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  };
  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
      setSaved(true);
    } catch { alerta.erro("Não foi possível salvar", "Verifique as permissões de armazenamento do navegador."); }
  };
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alerta.erro("Arquivo inválido", "Selecione uma imagem."); return; }
    if (file.size > 5 * 1024 * 1024) { alerta.erro("Imagem muito grande", "O limite é de 5 MB."); return; }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alerta.erro("Login necessário", "Entre na conta da ONG para enviar a foto."); return; }
      const ext = file.name.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, "") || "jpg";
      const name = `logos/${user.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("animais-fotos").upload(name, file, { contentType: file.type });
      if (error) throw error;
      const url = supabase.storage.from("animais-fotos").getPublicUrl(name).data.publicUrl;
      await definirLogo(url);
      setFoto(url);
      localStorage.setItem("ong_foto", url);
    } catch (error) {
      alerta.erro("Erro ao salvar a foto", error instanceof Error ? error.message : undefined);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const niveis = [
    { id: "administrador", titulo: "Administrador", descricao: "Gerenciamento administrativo da ONG", icon: "administrador.svg" },
    { id: "voluntario", titulo: "Voluntário/Atendente", descricao: "Atendimento e apoio às ONGs", icon: "maocoracoa.svg" },
    { id: "clinica", titulo: "Clínica Veterinária", descricao: "Integração de exames e informações vet", icon: "estetoscopio.svg" },
  ] as const;
  const canais = [
    { id: "whatsapp", nome: "WhatsApp", icon: "whatsapp.svg", campo: "whatsappContato" as const },
    { id: "instagram", nome: "Instagram", icon: "instagram.svg", campo: "instagram" as const },
    { id: "facebook", nome: "Facebook", icon: "facebook.svg" },
    { id: "email", nome: "E-mail", icon: "email.svg" },
  ];
  const servicos = [
    { id: "agenda", nome: "Agendamento", icon: "agenda-icon.svg" },
    { id: "local", nome: "Localização", icon: "local-icon.svg" },
    { id: "armazenamento", nome: "Armazenamento", icon: "armazenamento-nuvem.svg" },
    { id: "api", nome: "API e serviços", icon: "integracao-api.svg" },
  ];
  const iconeConfig = (nome: string) => `/icons-config/${nome}`;
  const guardarConvites = (novos: typeof convites) => {
    setConvites(novos);
    try { localStorage.setItem("astro_ong_convites_rascunho_v1", JSON.stringify(novos)); }
    catch { alerta.erro("Não foi possível guardar os convites neste navegador."); }
  };
  const prepararConvite = () => {
    const email = colaborador.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    const nivel = niveis.find(n => n.id === nivelAcesso)?.titulo || "Voluntário/Atendente";
    guardarConvites([{ email, nivel, status: "email" }, ...convites.filter(c => c.email.toLowerCase() !== email.toLowerCase())]);
    setColaborador("");
    const subject = "Convite para colaborar com nossa ONG no ASTRO";
    const body = `Olá! Gostaríamos de convidar você para colaborar com nossa ONG no ASTRO.\nNível de acesso proposto: ${nivel}.\n\nEste é um convite por e-mail; o acesso à plataforma ainda precisa ser cadastrado por um administrador.`;
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  const salvarIntegracaoLocal = () => {
    if (!integracaoEditando) return;
    const id = integracaoEditando;
    if (id === "whatsapp" || id === "instagram") update(id === "whatsapp" ? "whatsappContato" : "instagram", integracaoValor);
    try {
      if (id === "whatsapp" || id === "instagram") {
        localStorage.setItem(storageKey, JSON.stringify({ ...settings, [id === "whatsapp" ? "whatsappContato" : "instagram"]: integracaoValor }));
      }
      setIntegracaoAviso("Dados salvos neste navegador. A conexão com o serviço ainda não foi verificada.");
    } catch { alerta.erro("Não foi possível salvar neste navegador."); }
    setIntegracaoEditando(null);
  };
  const sections: { id: Section; title: string }[] = [
    { id: "seguranca", title: "Conta & Segurança" },
    { id: "preferencias", title: "Preferências" },
    { id: "colaboradores", title: "Convidar colaboradores" },
    { id: "integracoes", title: "Integrações e canais externos" },
    { id: "adocao", title: "Critérios & Formulários de Adoção" },
  ];
  const toggle = (id: Section) => setOpen((current) => current === id ? null : id);
  const switchRow = (label: string, key: keyof Pick<Settings, "email" | "whatsapp" | "sms" | "realtime" | "mensagens" | "agenda" | "cupons" | "checkin" | "entrevista" | "visita" | "termo">) => (
    <label className={styles.switchRow} key={key}>
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={settings[key]} onChange={(e) => update(key, e.target.checked)} />
      <span className={styles.switch} aria-hidden="true" />
    </label>
  );

  return (
    <main className={styles.page}>
      <h1>Configurações Gerais</h1>
      <div className={styles.accordion}>
        <Link href="/dashboard/perfil" className={styles.profileLink}><span>Perfil</span><span aria-hidden="true">›</span></Link>
        {sections.map(({ id, title }) => (
          <section className={`${styles.section} ${open === id ? styles.expanded : ""}`} key={id}>
            <button type="button" className={styles.heading} aria-expanded={open === id} onClick={() => toggle(id)}>
              <span>{title}</span><span className={styles.chevron}>{open === id ? "⌄" : "›"}</span>
            </button>
            {open === id && <div className={styles.content}>
              {id === "seguranca" && <div className={styles.securityGrid}>
                <div className={styles.credentials}><h2><img src="/icons-ong/cadeado.svg" alt="" className={styles.securityIcon}/> Credenciais de Acesso</h2>
                  <label className={styles.securityLabel}>E-mail de Login:</label><div className={styles.inlineField}><input type="email" placeholder="e-mail atual da conta/digite novo e-mail" value={emailLogin} onChange={e=>setEmailLogin(e.target.value)}/><button type="button" className={styles.primary} onClick={alterarEmail}><img src="/icons-ong/chave.svg" alt="" className={styles.buttonIcon}/> alterar</button></div>
                  <label className={styles.securityLabel}>Alteração de Senha:</label><div className={styles.inlineField}><input type="password" placeholder="digite nova senha" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)}/><button type="button" className={styles.primary} onClick={alterarSenha}><img src="/icons-ong/chave.svg" alt="" className={styles.buttonIcon}/> alterar</button></div>
                  <label className={styles.securityLabel}>Autenticação em Duas Etapas (2FA)</label><div className={styles.twoFactor}><button type="button" role="switch" aria-checked={twoFactor===true} className={`${styles.twoFactorSwitch} ${twoFactor===true?styles.isOn:""}`} onClick={()=>window.alert("A ativação do 2FA deve ser concluída com verificação na conta. Não é possível ativá-lo apenas por este botão.")}>✓</button><span>Status: {twoFactor===null?"Não verificado":twoFactor?"Ativado":"Desativado"}</span></div>
                </div>
                <div className={styles.verification}><h2><img src="/icons-ong/verificacao.svg" alt="" className={styles.securityIcon}/> Documentação & Verificação</h2><p className={styles.verificationSubtitle}>(Selo de Confiança)</p>
                  <p className={styles.verificationInfo}>Upload/status de verificação de CNPJ (Para ONGs) ou CPF + comprovante (para protetores independentes) que concede o selo oficial de verificação na plataforma.</p>
                  <input className={styles.hiddenInput} ref={documentoRef} type="file" accept=".pdf,image/*" onChange={e=>setDocumento(e.target.files?.[0]||null)}/>
                  <button type="button" className={styles.primary} onClick={()=>documentoRef.current?.click()}><img src="/icons-ong/anexo-documento.svg" alt="" className={styles.buttonIcon}/> enviar documentos</button>
                  {documento&&<p className={styles.fileName}>Arquivo selecionado: {documento.name}. O envio para análise ainda depende da integração com o backend.</p>}
                  <h2 className={styles.verificationStatus}>Status da Verificação <img src="/icons-ong/interrogacao.svg" alt="" className={styles.securityIcon}/></h2><p>Status: Pendente</p>
                </div>
              </div>}
              {id === "preferencias" && <div className={styles.preferences}>
                <h2>Canais de Alerta:</h2>
                {switchRow("Avisos por e-mail", "email")}{switchRow("Mensagem por Whatsapp", "whatsapp")}{switchRow("SMS", "sms")}{switchRow("Avisos em tempo real na tela", "realtime")}
                <h2>Tipos de Alerta</h2>
                {switchRow("Novas mensagens de exploradores", "mensagens")}{switchRow("Lembretes de compromissos da agenda", "agenda")}{switchRow("Alerta de novos cupons", "cupons")}{switchRow("Lembrete de check-in diário", "checkin")}
              </div>}
              {id === "colaboradores" && <div className={styles.colaboradoresGrid}>
                <div className={styles.conviteColuna}>
                  <h2>Convidar colaboradores</h2>
                  <label className={styles.configLabel} htmlFor="colaborador">E-mail:</label>
                  <input className={styles.conviteEmail} id="colaborador" type="email" value={colaborador} onChange={e => setColaborador(e.target.value)} placeholder="endereço de e-mail" />
                  <label className={styles.configLabel} htmlFor="nivel-colaborador">Nível de Acesso:</label>
                  <div className={styles.niveisLista} id="nivel-colaborador" role="radiogroup" aria-label="Nível de acesso">
                    {niveis.map(n => <label key={n.id} className={`${styles.nivelOpcao} ${nivelAcesso === n.id ? styles.nivelSelecionado : ""}`}>
                      <input type="radio" name="nivel-acesso" value={n.id} checked={nivelAcesso === n.id} onChange={() => setNivelAcesso(n.id)} />
                      <img src={iconeConfig(n.icon)} alt="" /><span><strong>{n.titulo}</strong><small>{n.descricao}</small></span>
                    </label>)}
                  </div>
                  <button type="button" className={styles.conviteBotao} disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(colaborador.trim())} onClick={prepararConvite}>Preparar convite por e-mail</button>
                </div>
                <div className={styles.colaboradoresColuna}>
                  <h2>Colaboradores:</h2>
                  {convites.length === 0 ? <p className={styles.vazioColaboradores}>Nenhum colaborador cadastrado ou convite preparado neste navegador.</p> :
                    <div className={styles.colaboradoresLista}>{convites.map(c => <div className={styles.colaboradorCard} key={c.email}>
                      <div>
                         <strong>{c.email}</strong>
                         <span className={styles.colaboradorTipo}>
                           {niveis.find(n => n.titulo === c.nivel) && (
                             <img
                               src={iconeConfig(niveis.find(n => n.titulo === c.nivel)!.icon)}
                               alt=""
                               aria-hidden="true"
                               className={styles.colaboradorTipoIcone}
                             />
                           )}
                           <small>{c.nivel}</small>
                         </span>
                       </div><span className={styles.statusPendente}>E-mail preparado</span>
                      <button type="button" className={styles.removerConvite} onClick={() => guardarConvites(convites.filter(v => v.email !== c.email))} aria-label={`Remover rascunho de ${c.email}`}>×</button>
                    </div>)}</div>}
                </div>
              </div>}
              {id === "integracoes" && <div className={styles.integracoesGrid}>
                <div className={styles.integracoesColuna}>
                  <h3>Gerencie os canais externos:</h3>
                  <div className={styles.integracoesLista}>{canais.map(c => <div className={styles.integracaoCard} key={c.id}>
                    <img src={iconeConfig(c.icon)} alt="" className={styles.integracaoIcone}/><strong>{c.nome}</strong>
                    <span className={styles.statusDesconectado}><i />Não conectado</span>
                    <button type="button" className={styles.gerenciar} onClick={() => {setIntegracaoEditando(c.id);setIntegracaoValor(c.campo ? settings[c.campo] : "");setIntegracaoAviso("");}}>Gerenciar</button>
                  </div>)}</div>
                </div>
                <div className={styles.integracoesColuna}>
                  <h3 className={styles.servicosTitulo}>Gerencie os serviços vinculados:</h3>
                  <div className={styles.integracoesLista}>{servicos.map(c => <div className={styles.integracaoCard} key={c.id}>
                    <img src={iconeConfig(c.icon)} alt="" className={styles.integracaoIcone}/><strong>{c.nome}</strong>
                    <span className={styles.statusDesconectado}><i />Não conectado</span>
                    <button type="button" className={styles.gerenciar} onClick={() => {setIntegracaoEditando(c.id);setIntegracaoValor("");setIntegracaoAviso("");}}>Gerenciar</button>
                  </div>)}</div>
                </div>
                {integracaoEditando && <div className={styles.editarIntegracao}>
                  <label htmlFor="config-integracao">Configurar {([...canais, ...servicos].find(c => c.id === integracaoEditando)?.nome || "serviço")}</label>
                  <input id="config-integracao" value={integracaoValor} onChange={e => setIntegracaoValor(e.target.value)} placeholder="Informe o endereço ou identificador do serviço" />
                  <div className={styles.editarAcoes}><button type="button" className={styles.primary} onClick={salvarIntegracaoLocal}>Salvar dados locais</button><button type="button" onClick={() => setIntegracaoEditando(null)}>Cancelar</button></div>
                </div>}
                {integracaoAviso && <p className={styles.notaIntegracao} role="status">{integracaoAviso}</p>}
              </div>}
              {id === "adocao" && <div className={styles.formArea}><h2>Critérios para adoção</h2>
                <label className={styles.fieldLabel} htmlFor="idade">Idade mínima do adotante</label><input id="idade" type="number" min="18" max="100" value={settings.idadeMinima} onChange={(e) => update("idadeMinima", e.target.value)} />
                <label className={styles.fieldLabel} htmlFor="moradia">Tipo de moradia aceito</label><select id="moradia" value={settings.moradia} onChange={(e) => update("moradia", e.target.value)}><option value="qualquer">Casa ou apartamento</option><option value="casa">Somente casa</option><option value="apartamento">Somente apartamento</option></select>
                <h2>Etapas do formulário</h2>{switchRow("Entrevista com o adotante", "entrevista")}{switchRow("Visita ao lar", "visita")}{switchRow("Termo de responsabilidade", "termo")}
              </div>}
              {(["preferencias", "integracoes", "adocao"] as Section[]).includes(id) && <div className={styles.actions}><button type="button" className={styles.primary} onClick={save}>Salvar alterações</button>{saved && <span role="status">Salvo neste navegador</span>}</div>}
            </div>}
          </section>
        ))}
      </div>
    </main>
  );
}
