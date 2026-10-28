"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { alerta } from "@/lib/alerta";
import styles from "./Configuracoes.module.css";

type Section = "seguranca" | "preferencias" | "privacidade" | "adocao";
type Settings = {
  email: boolean; whatsapp: boolean; sms: boolean; realtime: boolean;
  mensagens: boolean; agenda: boolean; cupons: boolean; checkin: boolean;
  exibirContato: boolean; compartilharLocalizacao: boolean;
  novidadesAdocao: boolean; atualizacoesSolicitacao: boolean;
};
const initial: Settings = {
  email: true, whatsapp: true, sms: false, realtime: true,
  mensagens: true, agenda: true, cupons: true, checkin: true,
  exibirContato: false, compartilharLocalizacao: false,
  novidadesAdocao: true, atualizacoesSolicitacao: true,
};
const storageKey = "astro_explorador_configuracoes_v1";
const sections: { id: Section; title: string }[] = [
  { id: "seguranca", title: "Conta & Segurança" },
  { id: "preferencias", title: "Preferências" },
  { id: "privacidade", title: "Privacidade" },
  { id: "adocao", title: "Preferências de Adoção" },
];

export default function ConfiguracoesExplorador() {
  const [open, setOpen] = useState<Section | null>(null);
  const [settings, setSettings] = useState<Settings>(initial);
  const [emailLogin, setEmailLogin] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setSettings({ ...initial, ...JSON.parse(stored) });
    } catch { /* Armazenamento indisponível */ }
  }, []);

  const update = (key: keyof Settings, value: boolean) => {
    setSettings(previous => ({ ...previous, [key]: value }));
    setSaved(false);
  };
  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
      setSaved(true);
    } catch { alerta.erro("Não foi possível salvar", "Verifique o armazenamento do navegador."); }
  };
  const alterarEmail = async () => {
    if (!emailLogin.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alerta.erro("Entre na sua conta para alterar o e-mail."); return; }
    const { error } = await supabase.auth.updateUser({ email: emailLogin.trim() });
    if (error) alerta.erro("Não foi possível alterar o e-mail", error.message);
    else { setEmailLogin(""); window.alert("Solicitação enviada. Confira seu e-mail para confirmar."); }
  };
  const alterarSenha = async () => {
    if (novaSenha.length < 6) { alerta.erro("A senha precisa ter pelo menos 6 caracteres."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alerta.erro("Entre na sua conta para alterar a senha."); return; }
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) alerta.erro("Não foi possível alterar a senha", error.message);
    else { setNovaSenha(""); window.alert("Senha atualizada."); }
  };
  const switchRow = (label: string, key: keyof Settings) => (
    <label className={styles.switchRow} key={key}>
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={settings[key]} onChange={e => update(key, e.target.checked)} />
      <span className={styles.switch} aria-hidden="true" />
    </label>
  );

  return (
    <main className={styles.page}>
      <h1>Configurações Gerais</h1>
      <div className={styles.accordion}>
        <Link href="/perfil-explorador" className={styles.profileLink}>
          <span>Perfil</span><span aria-hidden="true">›</span>
        </Link>
        {sections.map(({ id, title }) => (
          <section className={`${styles.section} ${open === id ? styles.expanded : ""}`} key={id}>
            <button type="button" className={styles.heading} aria-expanded={open === id} onClick={() => setOpen(current => current === id ? null : id)}>
              <span>{title}</span><span className={styles.chevron} aria-hidden="true">{open === id ? "⌄" : "›"}</span>
            </button>
            {open === id && <div className={styles.content}>
              {id === "seguranca" && <div className={styles.securityGrid}>
                <div className={styles.credentials}>
                  <h2><img src="/icons-ong/cadeado.svg" alt="" className={styles.securityIcon} /> Credenciais de Acesso</h2>
                  <label className={styles.securityLabel} htmlFor="explorador-email">E-mail de Login:</label>
                  <div className={styles.inlineField}><input id="explorador-email" type="email" placeholder="Digite o novo e-mail" value={emailLogin} onChange={e => setEmailLogin(e.target.value)} /><button type="button" className={styles.primary} onClick={alterarEmail}><img src="/icons-ong/chave.svg" alt="" className={styles.buttonIcon} /> Alterar</button></div>
                  <label className={styles.securityLabel} htmlFor="explorador-senha">Alteração de Senha:</label>
                  <div className={styles.inlineField}><input id="explorador-senha" type="password" placeholder="Digite a nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} /><button type="button" className={styles.primary} onClick={alterarSenha}><img src="/icons-ong/chave.svg" alt="" className={styles.buttonIcon} /> Alterar</button></div>
                </div>
                <div className={styles.verification}>
                  <h2><img src="/icons-ong/verificacao.svg" alt="" className={styles.securityIcon} /> Segurança da Conta</h2>
                  <p className={styles.verificationSubtitle}>Proteção dos seus dados</p>
                  <p className={styles.verificationInfo}>Mantenha seu e-mail e senha atualizados. A autenticação em duas etapas deve ser configurada diretamente no serviço de autenticação quando disponível.</p>
                  <Link href="/perfil-explorador" className={styles.primaryLink}>Ver dados do perfil</Link>
                </div>
              </div>}
              {id === "preferencias" && <div className={styles.preferences}>
                <h2>Canais de Alerta:</h2>
                {switchRow("Avisos por e-mail", "email")}{switchRow("Mensagem por WhatsApp", "whatsapp")}{switchRow("SMS", "sms")}{switchRow("Avisos em tempo real na tela", "realtime")}
                <h2>Tipos de Alerta</h2>
                {switchRow("Novas mensagens de ONGs", "mensagens")}{switchRow("Lembretes de compromissos da agenda", "agenda")}{switchRow("Alerta de novos cupons", "cupons")}{switchRow("Lembrete de check-in diário", "checkin")}
              </div>}
              {id === "privacidade" && <div className={styles.preferences}>
                <h2>Visibilidade das informações</h2>
                {switchRow("Permitir exibição dos meus dados de contato", "exibirContato")}
                {switchRow("Permitir compartilhamento da minha localização", "compartilharLocalizacao")}
                <p className={styles.helperText}>Estas preferências são salvas neste navegador. A aplicação dessas permissões em outros serviços depende de integração com o backend.</p>
              </div>}
              {id === "adocao" && <div className={styles.preferences}>
                <h2>Acompanhamento das Adoções</h2>
                {switchRow("Receber novidades sobre pets disponíveis", "novidadesAdocao")}
                {switchRow("Receber atualizações das minhas solicitações", "atualizacoesSolicitacao")}
                <p className={styles.helperText}>Para atualizar suas respostas ao questionário de adoção, acesse seu perfil.</p>
                <Link href="/perfil-explorador" className={styles.primaryLink}>Editar questionário</Link>
              </div>}
              {(["preferencias", "privacidade", "adocao"] as Section[]).includes(id) && <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={save}>Salvar alterações</button>
                {saved && <span role="status">Salvo neste navegador</span>}
              </div>}
            </div>}
          </section>
        ))}
      </div>
    </main>
  );
}
