"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { mensagensRepository, type Contato, type Conversa, type Mensagem } from "@/lib/mensagens/repository";
import { ErroApi } from "@/lib/api";
import { Archive, ArrowLeft, CheckCheck, EllipsisVertical, Info, MessageCircle, Paperclip, Phone, Search, Send, Smile } from "lucide-react";
import styles from "./Mensagens.module.css";

type Tipo = "ong" | "explorador";
const INTERVALO_ATUALIZACAO_MS = 5000;

export default function Mensagens({ tipo }: { tipo: Tipo }) {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [resultados, setResultados] = useState<Contato[]>([]);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "naolidas" | "arquivadas">("todas");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarChatMobile, setMostrarChatMobile] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  const destinatario = params.get("destinatario");

  const carregarConversas = useCallback(async () => {
    try {
      setConversas(await mensagensRepository.listarConversas(tipo));
    } catch {
      setErro("Não foi possível carregar as conversas.");
    } finally {
      setCarregando(false);
    }
  }, [tipo]);

  const carregarMensagens = useCallback(async (id: string) => {
    try {
      setMensagens(await mensagensRepository.listarMensagens(id));
      // abrir marca como lidas no servidor
      setConversas((prev) => prev.map((c) => (c.id === id ? { ...c, naoLidas: 0 } : c)));
    } catch {
      setErro("Não foi possível carregar as mensagens.");
    }
  }, []);

  useEffect(() => {
    let ativo = true;
    mensagensRepository.listarConversas(tipo)
      .then((dados) => { if (ativo) setConversas(dados); })
      .catch(() => { if (ativo) setErro("Não foi possível carregar as conversas."); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tipo]);

  // atualizacao periodica (lista e conversa aberta) enquanto a aba estiver visivel
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      carregarConversas();
      if (selecionada) carregarMensagens(selecionada);
    }, INTERVALO_ATUALIZACAO_MS);
    return () => window.clearInterval(timer);
  }, [carregarConversas, carregarMensagens, selecionada]);

  // link vindo de um perfil: /mensagens?destinatario=<id da conta>
  const ultimoDestinatario = useRef<string | null>(null);
  useEffect(() => {
    if (!destinatario || ultimoDestinatario.current === destinatario) return;
    ultimoDestinatario.current = destinatario;
    iniciarConversa(destinatario);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinatario]);

  useEffect(() => {
    let ativo = true;
    const timer = window.setTimeout(() => {
      mensagensRepository.buscarContatos(busca, tipo)
        .then((dados) => { if (ativo) setResultados(dados); })
        .catch(() => { if (ativo) setResultados([]); });
    }, 300);
    return () => { ativo = false; window.clearTimeout(timer); };
  }, [busca, tipo]);

  useEffect(() => { fimRef.current?.scrollIntoView({ block: "end" }); }, [mensagens.length, selecionada]);

  const lista = useMemo(() => {
    const termo = busca.toLowerCase();
    return conversas.filter((c) =>
      (filtro === "arquivadas" ? c.arquivada : !c.arquivada)
      && (filtro !== "naolidas" || c.naoLidas > 0)
      && (c.nome.toLowerCase().includes(termo) || c.ultimaMensagem.toLowerCase().includes(termo)));
  }, [conversas, filtro, busca]);
  const contatosNovos = resultados.filter((r) => !conversas.some((c) => c.contatoId === r.id));
  const ativa = conversas.find((c) => c.id === selecionada);

  function abrir(id: string) {
    setSelecionada(id);
    setMensagens([]);
    carregarMensagens(id);
    setMostrarChatMobile(true);
    setMenuAberto(false);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!selecionada || !conteudo || enviando) return;
    setEnviando(true);
    try {
      const nova = await mensagensRepository.enviarMensagem(selecionada, conteudo);
      setMensagens((prev) => [...prev, nova]);
      setTexto("");
      setConversas((prev) => prev.map((c) => (c.id === selecionada
        ? { ...c, ultimaMensagem: nova.texto, hora: nova.hora, arquivada: false } : c)));
    } catch (err) {
      setErro(err instanceof ErroApi ? err.message : "Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  async function iniciarConversa(id: string) {
    try {
      const conversa = await mensagensRepository.iniciarConversa(id, tipo);
      if (conversa) {
        setConversas((prev) => (prev.some((c) => c.id === conversa.id) ? prev : [conversa, ...prev]));
        setBusca("");
        abrir(conversa.id);
      }
    } catch (err) {
      setErro(err instanceof ErroApi ? err.message : "Não foi possível iniciar a conversa.");
    }
  }

  async function arquivar() {
    if (!ativa) return;
    try {
      await mensagensRepository.arquivarConversa(ativa.id, !ativa.arquivada);
      setConversas((prev) => prev.map((c) => (c.id === ativa.id ? { ...c, arquivada: !c.arquivada } : c)));
      setMenuAberto(false);
      setMostrarChatMobile(false);
      setSelecionada(null);
    } catch {
      setErro("Não foi possível arquivar a conversa.");
    }
  }

  return (
    <section className={styles.pagina} aria-label="Caixa de mensagens">
      <header className={styles.cabecalho}>
        <div className={styles.tituloBloco}><MessageCircle size={32} strokeWidth={2.4}/><div><h1>Caixa de Entrada</h1><p>Veja as suas conversas</p></div></div>
        <label className={styles.pesquisa}><Search size={17}/><input value={busca} onChange={e => setBusca(e.target.value)} placeholder={tipo === "explorador" ? "Buscar conversas ou ONGs..." : "Buscar conversas ou contatos..."} aria-label="Buscar mensagens" /></label>
      </header>
      <div className={styles.corpo}>
        <aside className={`${styles.lista} ${mostrarChatMobile ? styles.ocultaMobile : ""}`}>
          <div className={styles.abas}>
            <button className={filtro === "todas" ? styles.abaAtiva : ""} onClick={() => setFiltro("todas")}>Todas</button>
            <button className={filtro === "naolidas" ? styles.abaAtiva : ""} onClick={() => setFiltro("naolidas")}>Não lidas</button>
            <button className={filtro === "arquivadas" ? styles.abaAtiva : ""} onClick={() => setFiltro("arquivadas")}>Arquivadas</button>
          </div>
          <div className={styles.itens}>
            {carregando ? <p className={styles.semConversas}>Carregando conversas...</p> : lista.length ? lista.map(c => (
              <button key={c.id} className={`${styles.contato} ${selecionada === c.id ? styles.contatoAtivo : ""}`} onClick={() => abrir(c.id)}>
                <span className={styles.avatar}>{c.nome.slice(0,1)}</span>
                <span className={styles.contatoTexto}><strong>{c.nome}</strong><small>{c.descricao}</small><span className={styles.resumo}>{c.ultimaMensagem}</span></span>
                <span className={styles.hora}>{c.hora}{c.naoLidas > 0 && <i className={styles.ponto} aria-label={`${c.naoLidas} não lida(s)`} />}</span>
              </button>
            )) : <p className={styles.semConversas}>{busca.trim() ? "Nenhuma conversa encontrada." : "Nenhuma conversa ainda."}</p>}
            {busca.trim().length >= 2 && contatosNovos.length > 0 && <p className={styles.semConversas}>Iniciar nova conversa:</p>}
            {busca.trim().length >= 2 && contatosNovos.map(contato => (
              <button key={contato.id} className={styles.contato} type="button" onClick={() => iniciarConversa(contato.id)}>
                <span className={styles.avatar}>{contato.nome.slice(0,1)}</span>
                <span className={styles.contatoTexto}><strong>{contato.nome}</strong><small>{contato.descricao}</small></span>
              </button>
            ))}
          </div>
        </aside>
        <div className={`${styles.chat} ${mostrarChatMobile ? styles.chatMobile : ""}`}>
          {ativa ? <>
            <div className={styles.chatTopo}>
              <button className={styles.voltarMobile} onClick={() => setMostrarChatMobile(false)} aria-label="Voltar às conversas"><ArrowLeft size={20}/></button>
              <span className={styles.avatar}>{ativa.nome.slice(0,1)}</span>
              <div className={styles.chatIdentidade}><strong>{ativa.nome}</strong><small>{ativa.descricao}</small></div>
              <div className={styles.acoes}>
                <button type="button" title="Chamada" disabled><Phone size={18}/></button>
                <button type="button" title="Informações da conversa" onClick={() => setMenuAberto(v => !v)}><Info size={18}/></button>
                <button type="button" title="Mais opções" onClick={() => setMenuAberto(v => !v)}><EllipsisVertical size={18}/></button>
                {menuAberto && <div className={styles.menu}><button onClick={arquivar}><Archive size={15}/>{ativa.arquivada ? "Desarquivar" : "Arquivar"} conversa</button></div>}
              </div>
            </div>
            <div className={styles.mensagens}>
              {mensagens.length === 0 && <p className={styles.semConversas}>Nenhuma mensagem ainda. Diga olá!</p>}
              {mensagens.map((m) => <div key={m.id} className={`${styles.balao} ${m.minha ? styles.minha : styles.outra}`}>{m.texto}<span>{m.hora} {m.minha && <CheckCheck size={12}/>}</span></div>)}
              <div ref={fimRef} />
            </div>
            <form className={styles.compositor} onSubmit={enviar}>
              <button type="button" disabled title="Anexar arquivo"><Paperclip size={19}/></button>
              <button type="button" disabled title="Emojis"><Smile size={19}/></button>
              <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Digite sua mensagem..." aria-label="Digite sua mensagem" maxLength={2000} disabled={enviando}/>
              <button type="submit" disabled={enviando || !texto.trim()} aria-label="Enviar mensagem" title="Enviar mensagem" className={styles.enviar}><Send size={22}/></button>
            </form>
          </> : <div className={styles.estadoVazio}><MessageCircle size={35}/><p>Selecione uma conversa para visualizar as mensagens.</p></div>}
        </div>
      </div>
      {erro && <p className={styles.aviso} role="alert" onClick={() => setErro("")}>{erro}</p>}
    </section>
  );
}
