"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { alerta } from "@/lib/alerta";
import { buscarMinhaOng, registrarDocumento, salvarMinhaOng, type Ong } from "@/lib/ong";
import { buscarPreferencias, salvarPreferencias } from "@/lib/painel";
import { enviarDocumentoPrivado } from "@/lib/upload";
import styles from "./Configuracoes.module.css";
import Link from "next/link";

type Section = "seguranca" | "preferencias" | "colaboradores" | "integracoes" | "adocao";
// Preferencias de notificacao (guardadas em /api/me/preferencias)
type Preferencias = {
  email: boolean; whatsapp: boolean; sms: boolean; realtime: boolean;
  mensagens: boolean; agenda: boolean; cupons: boolean; checkin: boolean;
};
// Integracoes e criterios de adocao (guardados no perfil da ONG, /api/ongs/me)
type Settings = Preferencias & {
  site: string; instagram: string; whatsappContato: string;
  idadeMinima: string; moradia: string; entrevista: boolean; visita: boolean; termo: boolean;
};
const preferenciasIniciais: Preferencias = {
  email: true, whatsapp: true, sms: false, realtime: true,
  mensagens: true, agenda: true, cupons: true, checkin: true,
};
const initial: Settings = {
  ...preferenciasIniciais,
  site: "", instagram: "", whatsappContato: "",
  idadeMinima: "18", moradia: "qualquer", entrevista: true, visita: false, termo: true,
};
const STATUS_VERIFICACAO: Record<string, string> = {
  nao_enviado: "Nenhum documento enviado",
  pendente: "Pendente (em análise)",
  aprovado: "Verificada ✓",
  reprovado: "Reprovada: envie um novo documento",
};

export default function Page() {
  const [open, setOpen] = useState<Section | null>(null);
  const [settings, setSettings] = useState<Settings>(initial);
  const [ong, setOng] = useState<Ong | null>(null);
  const [emailLogin, setEmailLogin] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [twoFactor] = useState<boolean | null>(null);
  const [documento, setDocumento] = useState<File | null>(null);
  const [enviandoDocumento, setEnviandoDocumento] = useState(false);
  const documentoRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [colaborador, setColaborador] = useState("");
  const [falhaCarga, setFalhaCarga] = useState(false);

  useEffect(() => {
    Promise.all([buscarMinhaOng(), buscarPreferencias(preferenciasIniciais)])
      .then(([dadosOng, preferencias]) => {
        setOng(dadosOng);
        setSettings({
          ...initial,
          ...preferencias,
          site: dadosOng.site || "",
          instagram: dadosOng.instagram || "",
          whatsappContato: dadosOng.whatsapp || "",
          idadeMinima: String(dadosOng.idadeMinima ?? 18),
          moradia: dadosOng.moradiaAceita || "qualquer",
          entrevista: dadosOng.exigeEntrevista,
          visita: dadosOng.exigeVisita,
          termo: dadosOng.exigeTermo,
        });
      })
      .catch(() => {
        setFalhaCarga(true);
        alerta.erro("Não foi possível carregar as configurações", "Recarregue a página em instantes.");
      });
  }, []);

  const alterarEmail = async () => {
    if (!emailLogin.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alerta.erro("Entre na sua conta para alterar o e-mail."); return; }
    const { error } = await supabase.auth.updateUser({ email: emailLogin.trim() });
    if (error) alerta.erro("Não foi possível alterar o e-mail", error.message);
    else { setEmailLogin(""); alerta.sucesso("Solicitação enviada", "Verifique seu e-mail para confirmar a alteração."); }
  };
  const alterarSenha = async () => {
    if (novaSenha.length < 6) { alerta.erro("A senha precisa ter pelo menos 6 caracteres."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alerta.erro("Entre na sua conta para alterar a senha."); return; }
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) alerta.erro("Não foi possível alterar a senha", error.message);
    else { setNovaSenha(""); alerta.sucesso("Senha atualizada."); }
  };
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  };
  const save = async (secao: Section) => {
    // sem os valores atuais, salvar sobrescreveria o que esta no banco com os padroes
    if (falhaCarga || (secao !== "preferencias" && !ong)) {
      alerta.erro("Não foi possível salvar", "As configurações não foram carregadas. Recarregue a página.");
      return;
    }
    setSalvando(true);
    try {
      if (secao === "preferencias") {
        const { email, whatsapp, sms, realtime, mensagens, agenda, cupons, checkin } = settings;
        await salvarPreferencias({ email, whatsapp, sms, realtime, mensagens, agenda, cupons, checkin });
      } else if (ong) {
        const atualizada = await salvarMinhaOng({
          nomeOrganizacao: ong.nomeOrganizacao,
          site: settings.site, instagram: settings.instagram, whatsapp: settings.whatsappContato,
          idadeMinima: Math.max(18, Number(settings.idadeMinima) || 18),
          moradiaAceita: settings.moradia as Ong["moradiaAceita"],
          exigeEntrevista: settings.entrevista, exigeVisita: settings.visita, exigeTermo: settings.termo,
        });
        setOng(atualizada);
      }
      setSaved(true);
    } catch (error) {
      alerta.erro("Não foi possível salvar", error instanceof Error ? error.message : undefined);
    } finally {
      setSalvando(false);
    }
  };
  const enviarDocumento = async (arquivo: File | null) => {
    setDocumento(arquivo);
    if (!arquivo) return;
    if (arquivo.size > 10 * 1024 * 1024) { alerta.erro("Arquivo muito grande", "O limite é de 10 MB."); return; }
    setEnviandoDocumento(true);
    try {
      const caminho = await enviarDocumentoPrivado(arquivo);
      setOng(await registrarDocumento(caminho));
      alerta.sucesso("Documento enviado", "Ele será analisado pela equipe Astro.");
    } catch (error) {
      alerta.erro("Não foi possível enviar o documento", error instanceof Error ? error.message : undefined);
    } finally {
      setEnviandoDocumento(false);
      if (documentoRef.current) documentoRef.current.value = "";
    }
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
                  <label className={styles.securityLabel}>Autenticação em Duas Etapas (2FA)</label><div className={styles.twoFactor}><button type="button" role="switch" aria-checked={twoFactor===true} className={`${styles.twoFactorSwitch} ${twoFactor===true?styles.isOn:""}`} onClick={()=>alerta.info("A ativação do 2FA deve ser concluída com verificação na conta. Não é possível ativá-lo apenas por este botão.")}>✓</button><span>Status: {twoFactor===null?"Não verificado":twoFactor?"Ativado":"Desativado"}</span></div>
                </div>
                <div className={styles.verification}><h2><img src="/icons-ong/verificacao.svg" alt="" className={styles.securityIcon}/> Documentação & Verificação</h2><p className={styles.verificationSubtitle}>(Selo de Confiança)</p>
                  <p className={styles.verificationInfo}>Upload/status de verificação de CNPJ (Para ONGs) ou CPF + comprovante (para protetores independentes) que concede o selo oficial de verificação na plataforma.</p>
                  <input className={styles.hiddenInput} ref={documentoRef} type="file" accept=".pdf,image/*" onChange={e=>enviarDocumento(e.target.files?.[0]||null)}/>
                  <button type="button" className={styles.primary} onClick={()=>documentoRef.current?.click()} disabled={enviandoDocumento}><img src="/icons-ong/anexo-documento.svg" alt="" className={styles.buttonIcon}/> {enviandoDocumento?"enviando...":"enviar documentos"}</button>
                  {documento&&<p className={styles.fileName}>Arquivo: {documento.name}</p>}
                  <h2 className={styles.verificationStatus}>Status da Verificação <img src="/icons-ong/interrogacao.svg" alt="" className={styles.securityIcon}/></h2><p>Status: {STATUS_VERIFICACAO[ong?.statusVerificacao || "nao_enviado"]}</p>
                </div>
              </div>}
              {id === "preferencias" && <div className={styles.preferences}>
                <h2>Canais de Alerta:</h2>
                {switchRow("Avisos por e-mail", "email")}{switchRow("Mensagem por Whatsapp", "whatsapp")}{switchRow("SMS", "sms")}{switchRow("Avisos em tempo real na tela", "realtime")}
                <h2>Tipos de Alerta</h2>
                {switchRow("Novas mensagens de exploradores", "mensagens")}{switchRow("Lembretes de compromissos da agenda", "agenda")}{switchRow("Alerta de novos cupons", "cupons")}{switchRow("Lembrete de check-in diário", "checkin")}
              </div>}
              {id === "colaboradores" && <div className={styles.formArea}><h2>Convidar colaboradores</h2>
                <p>Prepare um convite para um colaborador da ONG.</p>
                <label className={styles.fieldLabel} htmlFor="colaborador">E-mail do colaborador</label>
                <div className={styles.inlineField}><input id="colaborador" type="email" value={colaborador} onChange={(e) => setColaborador(e.target.value)} placeholder="colaborador@exemplo.com" />
                  <button type="button" className={styles.primary} disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(colaborador)} onClick={() => { window.location.href = `mailto:${encodeURIComponent(colaborador)}?subject=${encodeURIComponent("Convite para colaborar com nossa ONG no ASTRO")}`; }}>Preparar e-mail</button></div>
              </div>}
              {id === "integracoes" && <div className={styles.formArea}><h2>Canais externos</h2>
                <label className={styles.fieldLabel} htmlFor="site">Site da ONG</label><input id="site" value={settings.site} onChange={(e) => update("site", e.target.value)} placeholder="https://..." />
                <label className={styles.fieldLabel} htmlFor="instagram">Instagram</label><input id="instagram" value={settings.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@suaong" />
                <label className={styles.fieldLabel} htmlFor="whatsapp">WhatsApp de contato</label><input id="whatsapp" value={settings.whatsappContato} onChange={(e) => update("whatsappContato", e.target.value)} placeholder="(00) 00000-0000" />
              </div>}
              {id === "adocao" && <div className={styles.formArea}><h2>Critérios para adoção</h2>
                <label className={styles.fieldLabel} htmlFor="idade">Idade mínima do adotante</label><input id="idade" type="number" min="18" max="100" value={settings.idadeMinima} onChange={(e) => update("idadeMinima", e.target.value)} />
                <label className={styles.fieldLabel} htmlFor="moradia">Tipo de moradia aceito</label><select id="moradia" value={settings.moradia} onChange={(e) => update("moradia", e.target.value)}><option value="qualquer">Casa ou apartamento</option><option value="casa">Somente casa</option><option value="apartamento">Somente apartamento</option></select>
                <h2>Etapas do formulário</h2>{switchRow("Entrevista com o adotante", "entrevista")}{switchRow("Visita ao lar", "visita")}{switchRow("Termo de responsabilidade", "termo")}
              </div>}
              {(["preferencias", "integracoes", "adocao"] as Section[]).includes(id) && <div className={styles.actions}><button type="button" className={styles.primary} onClick={()=>save(id)} disabled={salvando}>{salvando?"Salvando...":"Salvar alterações"}</button>{saved && <span role="status">Alterações salvas</span>}</div>}
            </div>}
          </section>
        ))}
      </div>
    </main>
  );
}
