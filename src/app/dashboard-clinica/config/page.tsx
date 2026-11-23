"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { alerta } from "@/lib/alerta";
import styles from "./Configuracoes.module.css";

type Secao = "seguranca" | "preferencias" | "colaboradores" | "integracoes" | "atendimento";
type Ajustes = {
  email: boolean; whatsapp: boolean; sms: boolean; realtime: boolean;
  mensagens: boolean; agenda: boolean; cupons: boolean; checkin: boolean;
  instagram: string; whatsappContato: string; facebook: string; emailPublico: string;
  horarioInicio: string; horarioFim: string; atendimentoEmergencia: boolean;
  agendamentoOnline: boolean; lembreteConsulta: boolean;
};
const inicial: Ajustes = {
  email: true, whatsapp: true, sms: false, realtime: true,
  mensagens: true, agenda: true, cupons: true, checkin: false,
  instagram: "", whatsappContato: "", facebook: "", emailPublico: "",
  horarioInicio: "08:00", horarioFim: "18:00", atendimentoEmergencia: false,
  agendamentoOnline: true, lembreteConsulta: true,
};
const chave = "astro_clinica_configuracoes_v1";
const chaveConvites = "astro_clinica_convites_v1";
const icone = (nome: string) => `/icons-config/${nome}`;
const niveis = [
  { id: "administrador", titulo: "Administrador", descricao: "Gerencia os dados e configurações da clínica", icon: "administrador.svg" },
  { id: "atendente", titulo: "Atendente", descricao: "Organização de consultas e atendimento", icon: "maocoracoa.svg" },
  { id: "veterinario", titulo: "Veterinário", descricao: "Atendimento e serviços veterinários", icon: "estetoscopio.svg" },
] as const;
type Convite = { email: string; nivel: string; status: "email" };

export default function ConfiguracoesClinica() {
  const [aberta, setAberta] = useState<Secao | null>(null);
  const [ajustes, setAjustes] = useState<Ajustes>(inicial);
  const [salvo, setSalvo] = useState(false);
  const [emailLogin, setEmailLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [documento, setDocumento] = useState<File | null>(null);
  const documentoRef = useRef<HTMLInputElement>(null);
  const [colaborador, setColaborador] = useState("");
  const [nivel, setNivel] = useState<(typeof niveis)[number]["id"]>("atendente");
  const [convites, setConvites] = useState<Convite[]>([]);
  const [integracao, setIntegracao] = useState<keyof Pick<Ajustes, "whatsappContato" | "instagram" | "facebook" | "emailPublico"> | null>(null);
  const [valorIntegracao, setValorIntegracao] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    try {
      const dados = localStorage.getItem(chave);
      if (dados) setAjustes({ ...inicial, ...JSON.parse(dados) });
      const convitesSalvos = JSON.parse(localStorage.getItem(chaveConvites) || "[]");
      if (Array.isArray(convitesSalvos)) setConvites(convitesSalvos);
    } catch { /* armazenamento não disponível */ }
  }, []);
  function mudar<K extends keyof Ajustes>(campo: K, valor: Ajustes[K]) {
    setAjustes(prev => ({ ...prev, [campo]: valor }));
    setSalvo(false);
  }
  function salvar() {
    try { localStorage.setItem(chave, JSON.stringify(ajustes)); setSalvo(true); }
    catch { alerta.erro("Não foi possível salvar as configurações neste navegador."); }
  }
  async function alterarEmail() {
    if (!emailLogin.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alerta.erro("Entre na conta para alterar o e-mail."); return; }
    const { error } = await supabase.auth.updateUser({ email: emailLogin.trim() });
    if (error) alerta.erro("Não foi possível alterar o e-mail", error.message);
    else { setEmailLogin(""); window.alert("Verifique seu e-mail para confirmar a alteração."); }
  }
  async function alterarSenha() {
    if (senha.length < 6) { alerta.erro("A senha deve ter pelo menos 6 caracteres."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alerta.erro("Entre na conta para alterar a senha."); return; }
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) alerta.erro("Não foi possível alterar a senha", error.message);
    else { setSenha(""); window.alert("Senha atualizada."); }
  }
  function guardarConvites(lista: Convite[]) {
    try { localStorage.setItem(chaveConvites, JSON.stringify(lista)); setConvites(lista); }
    catch { alerta.erro("Não foi possível salvar os convites."); }
  }
  function prepararConvite() {
    const email = colaborador.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    const descricao = niveis.find(n => n.id === nivel)?.titulo || "Atendente";
    guardarConvites([{ email, nivel: descricao, status: "email" }, ...convites.filter(c => c.email.toLowerCase() !== email.toLowerCase())]);
    setColaborador("");
    const assunto = "Convite para colaborar com nossa clínica no ASTRO";
    const corpo = `Olá! Gostaríamos de convidar você para colaborar com nossa clínica no ASTRO.\nNível de acesso proposto: ${descricao}.\n\nEste e-mail não cria uma conta ou permissão automaticamente.`;
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  }
  function salvarIntegracao() {
    if (!integracao) return;
    const novos = { ...ajustes, [integracao]: valorIntegracao };
    try {
      localStorage.setItem(chave, JSON.stringify(novos));
      setAjustes(novos); setIntegracao(null); setAviso("Contato salvo localmente. Nenhuma integração externa foi conectada.");
    } catch { alerta.erro("Não foi possível salvar o contato."); }
  }
  const switchRow = (titulo: string, campo: keyof Pick<Ajustes, "email" | "whatsapp" | "sms" | "realtime" | "mensagens" | "agenda" | "cupons" | "checkin" | "atendimentoEmergencia" | "agendamentoOnline" | "lembreteConsulta">) => (
    <label key={campo} className={styles.switchRow}><span>{titulo}</span>
      <input type="checkbox" role="switch" checked={ajustes[campo]} onChange={e => mudar(campo, e.target.checked)} />
      <span className={styles.switch} aria-hidden="true" />
    </label>
  );
  const secoes: { id: Secao; title: string }[] = [
    { id: "seguranca", title: "Conta & Segurança" },
    { id: "preferencias", title: "Preferências" },
    { id: "colaboradores", title: "Convidar colaboradores" },
    { id: "integracoes", title: "Integrações e canais externos" },
    { id: "atendimento", title: "Atendimento & Agendamentos" },
  ];
  const canais = [
    { id: "whatsappContato", nome: "WhatsApp", icon: "whatsapp.svg" },
    { id: "instagram", nome: "Instagram", icon: "instagram.svg" },
    { id: "facebook", nome: "Facebook", icon: "facebook.svg" },
    { id: "emailPublico", nome: "E-mail público", icon: "email.svg" },
  ] as const;
  const servicos = [
    { nome: "Agendamento", icon: "agenda-icon.svg" },
    { nome: "Localização", icon: "local-icon.svg" },
    { nome: "Armazenamento", icon: "armazenamento-nuvem.svg" },
    { nome: "API e serviços", icon: "integracao-api.svg" },
  ];
  return <main className={styles.page}>
    <h1>Configurações Gerais</h1>
    <div className={styles.accordion}>
      <Link href="/dashboard-clinica/config/perfil" className={styles.profileLink}><span>Perfil da Clínica</span><span aria-hidden="true">›</span></Link>
      {secoes.map(({ id, title }) => <section key={id} className={`${styles.section} ${aberta === id ? styles.expanded : ""}`}>
        <button type="button" className={styles.heading} aria-expanded={aberta === id} onClick={() => setAberta(aberta === id ? null : id)}><span>{title}</span><span className={styles.chevron}>{aberta === id ? "⌄" : "›"}</span></button>
        {aberta === id && <div className={styles.content}>
          {id === "seguranca" && <div className={styles.securityGrid}>
            <div className={styles.credentials}><h2><img src="/icons-ong/cadeado.svg" alt="" className={styles.securityIcon}/> Credenciais de Acesso</h2>
              <label className={styles.securityLabel} htmlFor="clinica-email-login">E-mail de Login:</label>
              <div className={styles.inlineField}><input id="clinica-email-login" type="email" placeholder="novo e-mail" value={emailLogin} onChange={e => setEmailLogin(e.target.value)}/><button type="button" className={styles.primary} onClick={alterarEmail}>Alterar</button></div>
              <label className={styles.securityLabel} htmlFor="clinica-senha">Alteração de Senha:</label>
              <div className={styles.inlineField}><input id="clinica-senha" type="password" placeholder="nova senha" value={senha} onChange={e => setSenha(e.target.value)}/><button type="button" className={styles.primary} onClick={alterarSenha}>Alterar</button></div>
              <label className={styles.securityLabel}>Autenticação em Duas Etapas (2FA)</label><p>A ativação e o status do 2FA devem ser verificados nas configurações da conta autenticada.</p>
            </div>
            <div className={styles.verification}><h2><img src="/icons-ong/verificacao.svg" alt="" className={styles.securityIcon}/> Documentação & Verificação</h2><p className={styles.verificationSubtitle}>(Selo de Confiança)</p>
              <p className={styles.verificationInfo}>Documentação de CNPJ e registro profissional, quando aplicável. O envio para análise depende da integração com o sistema.</p>
              <input className={styles.hiddenInput} ref={documentoRef} type="file" accept=".pdf,image/*" onChange={e => setDocumento(e.target.files?.[0] || null)}/>
              <button type="button" className={styles.primary} onClick={() => documentoRef.current?.click()}>Selecionar documentos</button>
              {documento && <p className={styles.fileName}>Selecionado: {documento.name}. Ainda não enviado para análise.</p>}
              <h2 className={styles.verificationStatus}>Status da Verificação</h2><p>Status: Não verificado</p>
            </div>
          </div>}
          {id === "preferencias" && <div className={styles.preferences}>
            <h2>Canais de Alerta:</h2>
            {switchRow("Avisos por e-mail", "email")}{switchRow("Mensagens por WhatsApp", "whatsapp")}{switchRow("SMS", "sms")}{switchRow("Avisos em tempo real na tela", "realtime")}
            <h2>Tipos de Alerta</h2>
            {switchRow("Novas mensagens de clientes", "mensagens")}{switchRow("Lembretes de consultas e compromissos", "agenda")}{switchRow("Avisos sobre resgates de cupons", "cupons")}{switchRow("Lembrete de check-in diário", "checkin")}
          </div>}
          {id === "colaboradores" && <div className={styles.colaboradoresGrid}>
            <div className={styles.conviteColuna}><h2>Convidar colaboradores</h2>
              <label className={styles.configLabel} htmlFor="colaborador-clinica">E-mail:</label>
              <input id="colaborador-clinica" className={styles.conviteEmail} type="email" placeholder="endereço de e-mail" value={colaborador} onChange={e => setColaborador(e.target.value)}/>
              <label className={styles.configLabel}>Nível de Acesso:</label>
              <div className={styles.niveisLista} role="radiogroup" aria-label="Nível de acesso">
                {niveis.map(n => <label key={n.id} className={`${styles.nivelOpcao} ${nivel === n.id ? styles.nivelSelecionado : ""}`}>
                  <input type="radio" name="nivel-acesso-clinica" value={n.id} checked={nivel === n.id} onChange={() => setNivel(n.id)}/>
                  <img src={icone(n.icon)} alt=""/><span><strong>{n.titulo}</strong><small>{n.descricao}</small></span>
                </label>)}
              </div>
              <button type="button" className={styles.conviteBotao} disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(colaborador.trim())} onClick={prepararConvite}>Preparar convite por e-mail</button>
            </div>
            <div className={styles.colaboradoresColuna}><h2>Colaboradores:</h2>
              {convites.length === 0 ? <p className={styles.vazioColaboradores}>Nenhum convite preparado neste navegador.</p> : <div className={styles.colaboradoresLista}>
                {convites.map(c => <div key={c.email} className={styles.colaboradorCard}><div><strong>{c.email}</strong><span className={styles.colaboradorTipo}><small>{c.nivel}</small></span></div><span className={styles.statusPendente}>E-mail preparado</span><button type="button" className={styles.removerConvite} aria-label={`Remover convite de ${c.email}`} onClick={() => guardarConvites(convites.filter(x => x.email !== c.email))}>×</button></div>)}
              </div>}
            </div>
          </div>}
          {id === "integracoes" && <div className={styles.integracoesGrid}>
            <div className={styles.integracoesColuna}><h3>Gerencie os canais externos:</h3><div className={styles.integracoesLista}>
              {canais.map(c => <div className={styles.integracaoCard} key={c.id}><img src={icone(c.icon)} alt="" className={styles.integracaoIcone}/><strong>{c.nome}</strong><span className={styles.statusDesconectado}><i/>Não conectado</span><button type="button" className={styles.gerenciar} onClick={() => { setIntegracao(c.id); setValorIntegracao(ajustes[c.id]); setAviso(""); }}>Gerenciar</button></div>)}
            </div></div>
            <div className={styles.integracoesColuna}><h3 className={styles.servicosTitulo}>Gerencie os serviços vinculados:</h3><div className={styles.integracoesLista}>
              {servicos.map(c => <div className={styles.integracaoCard} key={c.nome}><img src={icone(c.icon)} alt="" className={styles.integracaoIcone}/><strong>{c.nome}</strong><span className={styles.statusDesconectado}><i/>Não conectado</span><span className={styles.gerenciar} aria-label="Requer integração com o backend">Indisponível</span></div>)}
            </div></div>
            {integracao && <div className={styles.editarIntegracao}><label htmlFor="clinica-integracao">Contato: {canais.find(c => c.id === integracao)?.nome}</label><input id="clinica-integracao" value={valorIntegracao} onChange={e => setValorIntegracao(e.target.value)} placeholder="Informe o contato"/><div className={styles.editarAcoes}><button type="button" className={styles.primary} onClick={salvarIntegracao}>Salvar contato</button><button type="button" onClick={() => setIntegracao(null)}>Cancelar</button></div></div>}
            {aviso && <p role="status" className={styles.notaIntegracao}>{aviso}</p>}
          </div>}
          {id === "atendimento" && <div className={styles.formArea}>
            <h2>Horários de atendimento</h2>
            <label className={styles.fieldLabel} htmlFor="inicio-clinica">Abertura</label><input id="inicio-clinica" type="time" value={ajustes.horarioInicio} onChange={e => mudar("horarioInicio", e.target.value)}/>
            <label className={styles.fieldLabel} htmlFor="fim-clinica">Encerramento</label><input id="fim-clinica" type="time" value={ajustes.horarioFim} onChange={e => mudar("horarioFim", e.target.value)}/>
            <h2>Preferências de atendimento</h2>
            {switchRow("Atendimento de emergência", "atendimentoEmergencia")}{switchRow("Permitir solicitação de agendamento online", "agendamentoOnline")}{switchRow("Lembretes de consulta", "lembreteConsulta")}
          </div>}
          {(["preferencias", "atendimento"] as Secao[]).includes(id) && <div className={styles.actions}><button type="button" className={styles.primary} onClick={salvar}>Salvar alterações</button>{salvo && <span role="status">Salvo neste navegador</span>}</div>}
        </div>}
      </section>)}
    </div>
  </main>;
}
