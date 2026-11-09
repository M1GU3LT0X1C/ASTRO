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
  perfilVisivelOngs: boolean; permitirContatoOngs: boolean;
  mostrarPetsPerfil: boolean; compartilharPreferencias: boolean;
  especies: string[]; portes: string[]; idades: string[];
  temperamentos: string[]; distancia: string;
};
const initial: Settings = {
  email: true, whatsapp: true, sms: false, realtime: true,
  mensagens: true, agenda: true, cupons: true, checkin: true,
  exibirContato: false, compartilharLocalizacao: false,
  novidadesAdocao: true, atualizacoesSolicitacao: true,
  perfilVisivelOngs: true, permitirContatoOngs: true,
  mostrarPetsPerfil: false, compartilharPreferencias: false,
  especies: [], portes: [], idades: [], temperamentos: [],
  distancia: "sem-limite",
};
const storageKey = "astro_explorador_configuracoes_v1";

const OPCOES_ADOCAO = {
  especies: ["Cachorro", "Gato", "Outro"],
  portes: ["Pequeno", "Médio", "Grande"],
  idades: ["Filhote", "Jovem", "Adulto", "Idoso"],
  temperamentos: [
    "Sociável", "Calmo", "Brincalhão", "Independente",
    "Carinhoso", "Apegado", "Curioso", "Protetor",
    "Energético", "Tímido", "Preguiçoso", "Medroso",
  ],
} as const;

type FiltroAdocao = keyof typeof OPCOES_ADOCAO;
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
  const [mostrarTodasPersonalidades, setMostrarTodasPersonalidades] = useState(false);

  const alternarFiltro = (campo: FiltroAdocao, opcao: string) => {
    setSettings(anterior => {
      const selecionadas = Array.isArray(anterior[campo]) ? anterior[campo] : [];
      return {
        ...anterior,
        [campo]: selecionadas.includes(opcao)
          ? selecionadas.filter(item => item !== opcao)
          : [...selecionadas, opcao],
      };
    });
    setSaved(false);
  };

  const filtroAdocao = (campo: FiltroAdocao, titulo: string, descricao: string) => (
    <fieldset className={styles.settingsFieldset}>
      <legend>{titulo}</legend>
      <p className={styles.settingsHint}>{descricao}</p>
      {campo === "temperamentos" && (
        <button
          type="button"
          aria-expanded={mostrarTodasPersonalidades}
          aria-controls="explorador-lista-personalidades"
          onClick={() => setMostrarTodasPersonalidades(anterior => !anterior)}
          style={{
            marginTop: 12,
            marginBottom: mostrarTodasPersonalidades ? 14 : 0,
            padding: "9px 16px",
            border: "1px solid #13065f",
            borderRadius: 18,
            background: "white",
            color: "#13065f",
            font: "inherit",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {mostrarTodasPersonalidades ? "Ocultar personalidades" : "Ver todas as personalidades"}
        </button>
      )}
      {(campo !== "temperamentos" || mostrarTodasPersonalidades) && (
        <div
          className={styles.choiceGrid}
          id={campo === "temperamentos" ? "explorador-lista-personalidades" : undefined}
        >
          {OPCOES_ADOCAO[campo].map(opcao => {
            const selecionado = settings[campo].includes(opcao);
            return (
              <label key={opcao} className={`${styles.choice} ${selecionado ? styles.choiceSelected : ""}`}>
                <input
                  type="checkbox"
                  checked={selecionado}
                  onChange={() => alternarFiltro(campo, opcao)}
                />
                <span
                  className={styles.choiceIndicator}
                  aria-hidden="true"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    minWidth: 16,
                    minHeight: 16,
                    boxSizing: "border-box",
                    padding: 0,
                    lineHeight: 0,
                  }}
                >
                  {selecionado ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span>{opcao}</span>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Settings>;
        setSettings({
          ...initial,
          ...parsed,
          especies: Array.isArray(parsed.especies) ? parsed.especies : [],
          portes: Array.isArray(parsed.portes) ? parsed.portes : [],
          idades: Array.isArray(parsed.idades) ? parsed.idades : [],
          temperamentos: Array.isArray(parsed.temperamentos) ? parsed.temperamentos : [],
          distancia: typeof parsed.distancia === "string" ? parsed.distancia : "sem-limite",
        });
      }
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
              {id === "privacidade" && (
                <div className={styles.settingsPanel}>
                  <div className={styles.settingsGroup}>
                    <h3>Visibilidade e contato</h3>
                    <p className={styles.settingsHint}>Controle a exposição das suas informações pessoais.</p>
                    {[
                      ["Perfil visível para ONGs", "Permite que instituições encontrem seu perfil.", "perfilVisivelOngs"],
                      ["Exibir meus dados de contato", "Autoriza a exibição dos dados de contato no perfil.", "exibirContato"],
                      ["Permitir contato de ONGs", "Registra sua preferência por receber contato das instituições.", "permitirContatoOngs"],
                      ["Exibir meus pets no perfil", "Registra sua preferência de visibilidade dos pets.", "mostrarPetsPerfil"],
                    ].map(([titulo, descricao, chave]) => (
                      <div className={styles.settingItem} key={chave}>
                        <div className={styles.settingDescription}>
                          <strong>{titulo}</strong>
                          <span>{descricao}</span>
                        </div>
                        <label className={styles.compactSwitch}>
                          <input
                            type="checkbox"
                            role="switch"
                            aria-label={titulo}
                            checked={Boolean(settings[chave as keyof Settings])}
                            onChange={evento => update(chave as keyof Settings, evento.target.checked)}
                          />
                          <span className={styles.switch} aria-hidden="true" />
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className={styles.settingsGroup}>
                    <h3>Localização e preferências</h3>
                    <div className={styles.settingItem}>
                      <div className={styles.settingDescription}>
                        <strong>Compartilhar minha localização</strong>
                        <span>Registra sua autorização para compartilhar a localização.</span>
                      </div>
                      <label className={styles.compactSwitch}>
                        <input
                          type="checkbox"
                          role="switch"
                          aria-label="Compartilhar minha localização"
                          checked={settings.compartilharLocalizacao}
                          onChange={evento => update("compartilharLocalizacao", evento.target.checked)}
                        />
                        <span className={styles.switch} aria-hidden="true" />
                      </label>
                    </div>
                    <div className={styles.settingItem}>
                      <div className={styles.settingDescription}>
                        <strong>Compartilhar preferências de adoção</strong>
                        <span>Registra se suas preferências podem ser compartilhadas com ONGs.</span>
                      </div>
                      <label className={styles.compactSwitch}>
                        <input
                          type="checkbox"
                          role="switch"
                          aria-label="Compartilhar preferências de adoção"
                          checked={settings.compartilharPreferencias}
                          onChange={evento => update("compartilharPreferencias", evento.target.checked)}
                        />
                        <span className={styles.switch} aria-hidden="true" />
                      </label>
                    </div>
                  </div>

                </div>
              )}

              {id === "adocao" && (
                <div className={styles.settingsPanel}>
                  <div className={styles.settingsIntro}>
                    <h2>Encontre um pet que combine com você</h2>
                    <p>Defina suas preferências para organizar a busca por um novo companheiro.</p>
                  </div>

                  <div className={styles.settingsGroup}>
                    {filtroAdocao("especies", "Espécie", "Você pode selecionar mais de uma opção.")}
                    {filtroAdocao("portes", "Porte", "Selecione os tamanhos que considera adotar.")}
                    {filtroAdocao("idades", "Faixa etária", "Quais idades você prefere?")}
                    {filtroAdocao("temperamentos", "Personalidade", "Quais características combinam com sua rotina?")}

                    <div className={styles.distanceField}>
                      <label htmlFor="explorador-distancia">Distância para adoção</label>
                      <p className={styles.settingsHint}>Escolha a distância que você prefere considerar.</p>
                      <select
                        id="explorador-distancia"
                        value={settings.distancia}
                        onChange={evento => {
                          setSettings(anterior => ({ ...anterior, distancia: evento.target.value }));
                          setSaved(false);
                        }}
                      >
                        <option value="sem-limite">Sem preferência</option>
                        <option value="10">Até 10 km</option>
                        <option value="25">Até 25 km</option>
                        <option value="50">Até 50 km</option>
                        <option value="100">Até 100 km</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.settingsGroup}>
                    <h3>Notificações de adoção</h3>
                    <p className={styles.settingsHint}>Escolha quais avisos você gostaria de receber.</p>
                    <div className={styles.settingItem}>
                      <div className={styles.settingDescription}>
                        <strong>Novos pets disponíveis</strong>
                        <span>Preferência para avisos sobre animais para adoção.</span>
                      </div>
                      <label className={styles.compactSwitch}>
                        <input
                          type="checkbox"
                          role="switch"
                          aria-label="Novos pets disponíveis"
                          checked={settings.novidadesAdocao}
                          onChange={evento => update("novidadesAdocao", evento.target.checked)}
                        />
                        <span className={styles.switch} aria-hidden="true" />
                      </label>
                    </div>
                    <div className={styles.settingItem}>
                      <div className={styles.settingDescription}>
                        <strong>Atualizações das solicitações</strong>
                        <span>Preferência para acompanhar o andamento de adoções.</span>
                      </div>
                      <label className={styles.compactSwitch}>
                        <input
                          type="checkbox"
                          role="switch"
                          aria-label="Atualizações das solicitações"
                          checked={settings.atualizacoesSolicitacao}
                          onChange={evento => update("atualizacoesSolicitacao", evento.target.checked)}
                        />
                        <span className={styles.switch} aria-hidden="true" />
                      </label>
                    </div>
                  </div>

                  <div className={styles.questionnaireCard}>
                    <div>
                      <h3>Questionário de adoção</h3>
                      <p>Atualize suas respostas sobre rotina, moradia e cuidados com o pet.</p>
                    </div>
                    <Link href="/perfil-explorador" className={styles.primaryLink}>Editar questionário</Link>
                  </div>
                </div>
              )}
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
