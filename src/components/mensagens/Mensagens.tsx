"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { mensagensRepository, type Conversa } from "@/lib/mensagens/repository";
import { Archive, ArrowLeft, CheckCheck, EllipsisVertical, Info, MessageCircle, Paperclip, Phone, Search, Send, Smile } from "lucide-react";
import styles from "./Mensagens.module.css";

type Tipo = "ong" | "explorador";
export default function Mensagens({ tipo }: { tipo: Tipo }) {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [resultados, setResultados] = useState<{ id: string; nome: string; descricao: string }[]>([]);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "naolidas" | "arquivadas">("todas");
  const params = useSearchParams();
  const destinatario = params.get("destinatario");
  useEffect(() => {
    let ativo = true;
    mensagensRepository.listarConversas(tipo).then(dados => { if (ativo) setConversas(dados); }).catch(() => { if (ativo) setErro("Não foi possível carregar as conversas."); }).finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tipo]);
  useEffect(() => {
    let ativo = true;
    if (!busca.trim()) { setResultados([]); return; }
    mensagensRepository.buscarContatos(busca, tipo).then(dados => { if (ativo) setResultados(dados); }).catch(() => { if (ativo) setResultados([]); });
    return () => { ativo = false; };
  }, [busca, tipo]);
  const [naoLidas, setNaoLidas] = useState<string[]>([]);
  const [texto, setTexto] = useState("");
  const [mostrarChatMobile, setMostrarChatMobile] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const lista = useMemo(() => conversas.filter(c => (filtro === "arquivadas" ? c.arquivada : !c.arquivada) && (filtro !== "naolidas" || naoLidas.includes(c.id)) && (c.nome.toLowerCase().includes(busca.toLowerCase()) || c.mensagens.some(m => m.texto.toLowerCase().includes(busca.toLowerCase())))), [conversas, filtro, busca, naoLidas]);
  const ativa = conversas.find(c => c.id === selecionada);

  function abrir(id: string) { setSelecionada(id); setNaoLidas(prev => prev.filter(n => n !== id)); setMostrarChatMobile(true); setMenuAberto(false); }
  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    // O envio será ativado quando o repositório estiver conectado ao backend.
  }
  async function iniciarConversa(id: string) {
    try {
      const conversa = await mensagensRepository.iniciarConversa(id, tipo);
      if (conversa) { setConversas(prev => prev.some(c => c.id === conversa.id) ? prev : [conversa, ...prev]); abrir(conversa.id); }
    } catch { setErro("Não foi possível iniciar a conversa."); }
  }
  function arquivar() {
    if (selecionada === null) return;
    setConversas(prev => prev.map(c => c.id === selecionada ? { ...c, arquivada: !c.arquivada } : c));
    setMenuAberto(false);
    setMostrarChatMobile(false);
    setSelecionada(null);
  }
  return (
    <section className={styles.pagina} aria-label="Caixa de mensagens">
      <header className={styles.cabecalho}>
        <div className={styles.tituloBloco}><MessageCircle size={32} strokeWidth={2.4}/><div><h1>Caixa de Entrada</h1><p>Veja as suas conversas</p></div></div>
        <label className={styles.pesquisa}><Search size={17}/><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar mensagens..." aria-label="Buscar mensagens" /></label>
      </header>
      <div className={styles.corpo}>
        <aside className={`${styles.lista} ${mostrarChatMobile ? styles.ocultaMobile : ""}`}>
          <div className={styles.abas}>
            <button className={filtro === "todas" ? styles.abaAtiva : ""} onClick={() => setFiltro("todas")}>Todas</button>
            <button className={filtro === "naolidas" ? styles.abaAtiva : ""} onClick={() => setFiltro("naolidas")}>Não lidas</button>
            <button className={filtro === "arquivadas" ? styles.abaAtiva : ""} onClick={() => setFiltro("arquivadas")}>Arquivadas</button>
          </div>
          <div className={styles.itens}>{carregando ? <p className={styles.semConversas}>Carregando conversas...</p> : lista.length ? lista.map(c => <button key={c.id} className={`${styles.contato} ${selecionada === c.id ? styles.contatoAtivo : ""}`} onClick={() => abrir(c.id)}>
            <span className={styles.avatar}>{c.nome.slice(0,1)}</span><span className={styles.contatoTexto}><strong>{c.nome}</strong><small>{c.descricao}</small><span className={styles.resumo}>{c.mensagens.at(-1)?.texto}</span></span><span className={styles.hora}>{c.hora}{naoLidas.includes(c.id) && <i className={styles.ponto} />}</span>
          </button>) : <p className={styles.semConversas}>Nenhuma conversa ainda.</p>}{busca.trim() && resultados.map(contato => <button key={contato.id} className={styles.contato} type="button" onClick={() => iniciarConversa(contato.id)}><span className={styles.avatar}>{contato.nome.slice(0,1)}</span><span className={styles.contatoTexto}><strong>{contato.nome}</strong><small>{contato.descricao}</small></span></button>)}</div>
        </aside>
        <div className={`${styles.chat} ${mostrarChatMobile ? styles.chatMobile : ""}`}>
          {ativa ? <>
            <div className={styles.chatTopo}><button className={styles.voltarMobile} onClick={() => setMostrarChatMobile(false)} aria-label="Voltar às conversas"><ArrowLeft size={20}/></button><span className={styles.avatar}>{ativa.nome.slice(0,1)}</span><div className={styles.chatIdentidade}><strong>{ativa.nome}</strong><small>{ativa.descricao}</small></div><div className={styles.acoes}><button type="button" title="Chamada" disabled><Phone size={18}/></button><button type="button" title="Informações da conversa" onClick={() => setMenuAberto(v => !v)}><Info size={18}/></button><button type="button" title="Mais opções" onClick={() => setMenuAberto(v => !v)}><EllipsisVertical size={18}/></button>{menuAberto && <div className={styles.menu}><button onClick={arquivar}><Archive size={15}/>{ativa.arquivada ? "Desarquivar" : "Arquivar"} conversa</button></div>}</div></div>
            <div className={styles.mensagens}>{ativa.mensagens.map((m,i) => <div key={`${ativa.id}-${i}`} className={`${styles.balao} ${m.minha ? styles.minha : styles.outra}`}>{m.texto}<span>{m.hora} {m.minha && <CheckCheck size={12}/>}</span></div>)}</div>
            <form className={styles.compositor} onSubmit={enviar}><button type="button" disabled title="Anexar arquivo"><Paperclip size={19}/></button><button type="button" disabled title="Emojis"><Smile size={19}/></button><input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Digite sua mensagem..." aria-label="Digite sua mensagem" disabled/><button type="submit" disabled aria-label="Enviar mensagem" title="Enviar mensagem" className={styles.enviar}><Send size={22}/></button></form>
          </> : <div className={styles.estadoVazio}><MessageCircle size={35}/><p>Selecione uma conversa para visualizar as mensagens.</p></div>}
        </div>
      </div>
      {erro && <p className={styles.aviso} role="alert">{erro}</p>}
    </section>
  );
}
