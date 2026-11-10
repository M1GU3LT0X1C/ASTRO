"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Plus, Trash2, X } from "lucide-react";
import { alerta } from "@/lib/alerta";
import { listarPetsTutor } from "@/lib/explorador";
import { atualizarCompromisso, criarCompromisso, excluirCompromisso, horaCurta, listarAgenda, type Compromisso as CompromissoApi } from "@/lib/painel";
import styles from "./Agenda.module.css";

type Perfil = "ong" | "explorador";
type Compromisso = { id: string; data: string; hora: string; descricao: string; pet: string; local: string };
type Modo = "hoje" | "essa" | "proxima";
type Formulario = Omit<Compromisso, "id">;
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function iso(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}
function dataLocal(valor: string) { return new Date(`${valor}T12:00:00`); }
function inicioSemana(data: Date) {
  const inicio = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  inicio.setDate(inicio.getDate() - inicio.getDay());
  return inicio;
}
function fimSemana(data: Date) {
  const fim = inicioSemana(data);
  fim.setDate(fim.getDate() + 6);
  return fim;
}
function formato(data: Date) { return data.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }); }
// compromisso da API -> formato usado na tela
function daApi(c: CompromissoApi): Compromisso {
  return { id: c.id, data: c.data, hora: horaCurta(c.hora), descricao: c.descricao, pet: c.pet || "", local: c.local || "" };
}
const ordenar = (lista: Compromisso[]) => [...lista].sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`));

export default function Agenda({ perfil }: { perfil: Perfil }) {
  const [hoje, setHoje] = useState(() => new Date());
  const [mes, setMes] = useState(() => new Date());
  const [selecionado, setSelecionado] = useState(() => iso(new Date()));
  const [modo, setModo] = useState<Modo>("hoje");
  const [itens, setItens] = useState<Compromisso[]>([]);
  const [pets, setPets] = useState<string[]>([]);
  const [aberto, setAberto] = useState(false);
  const [editarId, setEditarId] = useState<string | null>(null);
  const [form, setForm] = useState<Formulario>({ data: iso(new Date()), hora: "09:00", descricao: "", pet: "", local: "" });
  const [erro, setErro] = useState("");

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarAgenda()
      .then(lista => { if (ativo) { setItens(ordenar(lista.map(daApi))); setHoje(new Date()); } })
      .catch(() => { if (ativo) setErro("Não foi possível carregar a agenda. Tente novamente em instantes."); });
    if (perfil === "explorador") {
      listarPetsTutor()
        .then(lista => { if (ativo) setPets(lista.map(p => p.nome).filter(Boolean)); })
        .catch(() => { if (ativo) setPets([]); });
    }
    return () => { ativo = false; };
  }, [perfil]);

  const referencia = useMemo(() => {
    const base = new Date(hoje);
    if (modo === "proxima") base.setDate(base.getDate() + 7);
    return base;
  }, [hoje, modo]);
  const inicio = inicioSemana(referencia);
  const fim = fimSemana(referencia);
  const visiveis = useMemo(() => itens.filter(item => {
    if (modo === "hoje") return item.data === selecionado;
    return item.data >= iso(inicio) && item.data <= iso(fim);
  }).sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`)), [itens, modo, selecionado, inicio, fim]);
  const proximos = useMemo(() => itens.filter(item => `${item.data}${item.hora}` >= `${iso(hoje)}00:00`)
    .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`)).slice(0, 2), [itens, hoje]);

  async function excluir(id: string) {
    try {
      await excluirCompromisso(id);
      setItens(lista => lista.filter(outro => outro.id !== id));
      setErro("");
    } catch {
      setErro("Não foi possível excluir o compromisso.");
    }
  }
  function abrirNovo(data = selecionado, item?: Compromisso) {
    setEditarId(item?.id || null);
    setForm(item ? { data: item.data, hora: item.hora, descricao: item.descricao, pet: item.pet, local: item.local } : { data, hora: "09:00", descricao: "", pet: "", local: "" });
    setAberto(true);
  }
  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!form.data || !form.hora || !form.descricao.trim() || salvando) return;
    const corpo = {
      data: form.data, hora: form.hora, descricao: form.descricao.trim(),
      pet: form.pet.trim() || undefined, local: form.local.trim() || undefined,
    };
    setSalvando(true);
    try {
      const salvo = daApi(editarId ? await atualizarCompromisso(editarId, corpo) : await criarCompromisso(corpo));
      setItens(lista => ordenar(editarId ? lista.map(item => item.id === editarId ? salvo : item) : [...lista, salvo]));
      setErro("");
      setAberto(false);
    } catch (e) {
      alerta.erro("Não foi possível salvar o compromisso", e instanceof Error ? e.message : undefined);
    } finally {
      setSalvando(false);
    }
  }
  function escolherDia(data: Date) { setSelecionado(iso(data)); setModo("hoje"); }
  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1).getDay();
  const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const tituloPeriodo = modo === "hoje" ? formato(dataLocal(selecionado)) : `${formato(inicio)} – ${formato(fim)}`;

  return (
    <main className={styles.pagina}>
      <div className={styles.grade}>
        <aside className={styles.lateral}>
          <section className={styles.rapido}>
            <h2>Reagendamento Rápido</h2>
            <p className={styles.legenda}>{formato(hoje)}</p>
            <div className={styles.rapidoLista}>
              {proximos.length ? proximos.map(item => (
                <article className={styles.rapidoItem} key={item.id}>
                  <strong>{item.descricao}</strong>
                  <small>{item.pet ? `${item.pet} · ` : ""}{formato(dataLocal(item.data))}</small>
                  {item.local && <span className={styles.local}><MapPin size={12} />{item.local}</span>}
                  <button type="button" className={styles.botaoRosa} onClick={() => abrirNovo(item.data, item)}>Remarcar evento</button>
                </article>
              )) : <p className={styles.semRapidos}>Nenhum compromisso futuro.</p>}
            </div>
          </section>

          <section className={styles.calendario} aria-label="Calendário de compromissos">
            <div className={styles.calTopo}>
              <div className={styles.calTitulo}><img src="/icons-agenda/calendario.svg" alt="" /><strong>{mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</strong></div>
              <div className={styles.navegacao}>
                <button type="button" aria-label="Mês anterior" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}><ChevronLeft size={18} /></button>
                <button type="button" aria-label="Próximo mês" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}><ChevronRight size={18} /></button>
              </div>
            </div>
            <div className={styles.filtros}>
              {([ ["hoje", "Hoje"], ["essa", "Essa semana"], ["proxima", "Próxima semana"] ] as const).map(([valor, rotulo]) => (
                <button key={valor} type="button" className={modo === valor ? styles.filtroAtivo : ""} onClick={() => {
                  setModo(valor);
                  if (valor === "hoje") { setSelecionado(iso(hoje)); setMes(hoje); }
                  else { const base = new Date(hoje); if (valor === "proxima") base.setDate(base.getDate() + 7); setMes(base); }
                }}>{rotulo}</button>
              ))}
            </div>
            <div className={styles.diasSemana}>{DIAS.map(dia => <span key={dia}>{dia}</span>)}</div>
            <div className={styles.diasMes}>
              {Array.from({ length: primeiro }, (_, i) => <span key={`vazio-${i}`} />)}
              {Array.from({ length: total }, (_, i) => {
                const data = new Date(mes.getFullYear(), mes.getMonth(), i + 1);
                const chave = iso(data);
                const temEvento = itens.some(item => item.data === chave);
                return <button type="button" key={chave} onClick={() => escolherDia(data)} className={`${selecionado === chave && modo === "hoje" ? styles.diaSelecionado : ""} ${chave === iso(hoje) ? styles.diaHoje : ""}`} aria-label={`${formato(data)}${temEvento ? ", com compromissos" : ""}`} aria-pressed={selecionado === chave && modo === "hoje"}>{i + 1}{temEvento && <span className={styles.marcador} />}</button>;
              })}
            </div>
          </section>
        </aside>

        <section className={styles.tarefas}>
          <div className={styles.tarefasTopo}>
            <div><h2>Tarefas do dia <button type="button" className={styles.adicionar} onClick={() => abrirNovo()} aria-label="Adicionar compromisso"><Plus size={18} /></button></h2><p className={styles.legenda}>{tituloPeriodo}</p></div>
          </div>
          {visiveis.length ? <div className={styles.listaTarefas}>{visiveis.map(item => (
            <article className={styles.linha} key={item.id}>
              <div className={styles.horario}><strong>{item.hora}</strong><small>{dataLocal(item.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</small></div>
              <div className={styles.cartaoTarefa}>
                <div className={styles.detalhes}><strong>{item.pet || (perfil === "ong" ? "Atividade da ONG" : "Compromisso")}</strong><span>{item.descricao}</span>{item.local && <small><MapPin size={12} />{item.local}</small>}</div>
                <div className={styles.acoes}><button type="button" onClick={() => abrirNovo(item.data, item)} aria-label="Editar compromisso">Editar</button><button type="button" onClick={() => excluir(item.id)} aria-label="Excluir compromisso"><Trash2 size={16} /></button></div>
              </div>
            </article>
          ))}</div> : <div className={styles.vazio}><CalendarDays size={30} /><strong>Nenhuma tarefa neste período</strong><p>Use o botão + para adicionar um compromisso.</p></div>}
        </section>
      </div>
      {erro && <p role="alert" className={styles.erro}>{erro}</p>}
      {aberto && <div className={styles.sobreposicao} onMouseDown={e => { if (e.target === e.currentTarget) setAberto(false); }}>
        <form className={styles.modal} onSubmit={enviar}>
          <div className={styles.modalTopo}><h2>{editarId ? "Editar compromisso" : "Novo compromisso"}</h2><button type="button" onClick={() => setAberto(false)} aria-label="Fechar"><X size={20} /></button></div>
          <label>Descrição<input required maxLength={500} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Consulta, vacina, exame..." /></label>
          {perfil === "explorador" ? <label>Pet<select value={form.pet} onChange={e => setForm(f => ({ ...f, pet: e.target.value }))}><option value="">Selecionar pet (opcional)</option>{pets.map(nome => <option key={nome} value={nome}>{nome}</option>)}</select></label> : <label>Pet (opcional)<input value={form.pet} onChange={e => setForm(f => ({ ...f, pet: e.target.value }))} placeholder="Nome do pet" /></label>}
          <div className={styles.camposDuplos}><label>Data<input type="date" required value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} /></label><label>Hora<input type="time" required value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} /></label></div>
          <label>Local (opcional)<input value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))} placeholder="Clínica ou endereço" /></label>
          <div className={styles.modalAcoes}><button type="button" onClick={() => setAberto(false)}>Cancelar</button><button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar compromisso"}</button></div>
        </form>
      </div>}
    </main>
  );
}
