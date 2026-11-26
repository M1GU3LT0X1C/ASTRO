"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";
import { useClinica } from "../useClinica";
import { cupomValido, type Cupom } from "../dados";
import styles from "./Cupons.module.css";

const TAMANHO_PAGINA = 6;
const categorias = ["Consulta", "Cirurgia", "Imunização", "Estética", "Exames", "Outros"];
const beneficios = ["Desconto percentual", "Desconto em reais", "Serviço gratuito", "Outro benefício"];
type Filtro = "todos" | "ativos" | "pausados" | "esgotados";
const moeda = (n: number) => n.toLocaleString("pt-BR");

export default function CuponsClinica() {
  const { dados, pronto, atualizar } = useClinica();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [pagina, setPagina] = useState(1);
  const [aberto, setAberto] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [beneficio, setBeneficio] = useState("");
  const [custo, setCusto] = useState("");
  const [limite, setLimite] = useState("");
  const [publico, setPublico] = useState("Todos");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [erro, setErro] = useState("");

  const usados = (id: string) => dados.resgates.filter(r => r.cupomId === id).length;
  const situacao = (c: Cupom): Exclude<Filtro, "todos"> => {
    if (c.status === "pausado") return "pausados";
    return cupomValido(c, dados) ? "ativos" : "esgotados";
  };
  const ativos = dados.cupons.filter(c => situacao(c) === "ativos").length;
  const pausados = dados.cupons.filter(c => situacao(c) === "pausados").length;
  const esgotados = dados.cupons.filter(c => situacao(c) === "esgotados").length;
  const totalPontos = dados.resgates.reduce((soma, r) => soma + (dados.cupons.find(c => c.id === r.cupomId)?.custo || 0), 0);
  const mesAtual = new Date().toISOString().slice(0, 7);
  const resgatesMes = dados.resgates.filter(r => r.criadoEm.startsWith(mesAtual)).length;

  const lista = useMemo(() => dados.cupons.filter(c => {
    const texto = `${c.nome} ${c.codigo} ${c.categoria} ${c.beneficio}`.toLocaleLowerCase("pt-BR");
    return texto.includes(busca.trim().toLocaleLowerCase("pt-BR")) && (filtro === "todos" || situacao(c) === filtro);
  }), [dados, busca, filtro]);
  const totalPaginas = Math.max(1, Math.ceil(lista.length / TAMANHO_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = lista.slice((paginaAtual - 1) * TAMANHO_PAGINA, paginaAtual * TAMANHO_PAGINA);

  function limpar() {
    setEditando(null); setNome(""); setCategoria(""); setBeneficio(""); setCusto(""); setLimite("");
    setPublico("Todos"); setInicio(""); setFim(""); setErro("");
  }
  function editar(c: Cupom) {
    setEditando(c.id); setNome(c.nome); setCategoria(c.categoria); setBeneficio(c.beneficio);
    setCusto(String(c.custo)); setLimite(String(c.limite)); setPublico(c.publico);
    setInicio(c.inicio); setFim(c.fim); setAberto(null); setErro("");
  }
  function gravar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nome.trim() || !categoria || !beneficio || custo === "" || limite === "") { setErro("Preencha todos os campos obrigatórios."); return; }
    if (!Number.isFinite(Number(custo)) || Number(custo) < 0 || !Number.isInteger(Number(custo)) || !Number.isInteger(Number(limite)) || Number(limite) < 0) { setErro("Pontos e limite devem ser números inteiros não negativos."); return; }
    if (inicio && fim && fim < inicio) { setErro("A data final não pode ser anterior à inicial."); return; }
    if (editando) {
      atualizar(d => ({ ...d, cupons: d.cupons.map(c => c.id === editando ? { ...c, nome: nome.trim(), categoria, beneficio, custo: Number(custo), limite: Number(limite), publico, inicio, fim } : c) }));
    } else {
      atualizar(d => {
        let codigo = "";
        do { codigo = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(); } while (d.cupons.some(c => c.codigo === codigo));
        const novo: Cupom = { id: crypto.randomUUID(), codigo, nome: nome.trim(), categoria, beneficio, custo: Number(custo), limite: Number(limite), publico, inicio, fim, status: "ativo", criadoEm: new Date().toISOString() };
        return { ...d, cupons: [novo, ...d.cupons] };
      });
    }
    limpar(); setFiltro("todos"); setPagina(1);
  }
  function alternar(c: Cupom) {
    atualizar(d => ({ ...d, cupons: d.cupons.map(item => item.id === c.id ? { ...item, status: item.status === "ativo" ? "pausado" : "ativo" } : item) }));
    setAberto(null);
  }
  function excluir(c: Cupom) {
    if (usados(c.id) > 0) { setErro(`O cupom “${c.nome}” possui resgates e não pode ser excluído. Pause-o para preservar o histórico.`); setAberto(null); return; }
    if (!window.confirm(`Excluir definitivamente o cupom “${c.nome}”?`)) return;
    atualizar(d => ({ ...d, cupons: d.cupons.filter(item => item.id !== c.id) }));
    if (editando === c.id) limpar();
    setAberto(null);
  }

  return <div className={styles.page}>
    <div className={styles.topo}>
      <label className={styles.busca}><Search size={17}/><input value={busca} onChange={e => { setBusca(e.target.value); setPagina(1); }} placeholder="Buscar cupom..." aria-label="Buscar cupom"/></label>
      <div className={styles.filtros} aria-label="Filtrar cupons">
        {([ ["todos", `Todos (${dados.cupons.length})`], ["ativos", `Ativos (${ativos})`], ["pausados", `Pausados (${pausados})`], ["esgotados", `Esgotados (${esgotados})`] ] as [Filtro,string][]).map(([chave,rotulo]) => <button type="button" key={chave} className={filtro === chave ? styles.filtroAtivo : ""} onClick={() => { setFiltro(chave); setPagina(1); }}>{rotulo}</button>)}
      </div>
    </div>
    <div className={styles.indicadores}>
      <div className={styles.indicador}><span className={`${styles.indicadorIcone} ${styles.iconeRosa}`}><img src="/icons-clinica/cupom.svg" alt=""/></span><div><strong>{pronto ? ativos : "—"}</strong><span>Cupons ativos</span><small>{pausados} pausados</small></div></div>
      <div className={styles.indicador}><span className={styles.indicadorIcone}><img src="/icons-clinica/resgate-users.svg" alt=""/></span><div><strong>{pronto ? moeda(resgatesMes) : "—"}</strong><span>Resgates do mês</span><small>Registrados neste navegador</small></div></div>
      <div className={styles.indicador}><span className={`${styles.indicadorIcone} ${styles.iconeRosa}`}><img src="/icons-clinica/pontos.svg" alt=""/></span><div><strong>{pronto ? `${moeda(totalPontos)} pts` : "—"}</strong><span>Custo total em pontos</span><small>Histórico de resgates</small></div></div>
      <div className={styles.indicador}><span className={styles.indicadorIcone}><img src="/icons-clinica/taxas.svg" alt=""/></span><div><strong>{pronto && dados.cupons.length ? `${Math.round((ativos / dados.cupons.length) * 100)}%` : "0%"}</strong><span>Cupons disponíveis</span><small>Percentual ativo</small></div></div>
    </div>
    <div className={styles.conteudo}>
      <section className={styles.criacao}><h2><img src="/icons-clinica/cupom.svg" alt="" className={styles.iconeCupomTitulo}/> {editando ? "Editar cupom" : "Criar novo cupom"}</h2>
        <form onSubmit={gravar} className={styles.formulario}>
          <label>Nome da oferta<input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Consulta inicial 15% OFF" maxLength={100}/></label>
          <label>Categoria<select required value={categoria} onChange={e => setCategoria(e.target.value)}><option value="">Selecione uma categoria</option>{categorias.map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Tipo de benefício<select required value={beneficio} onChange={e => setBeneficio(e.target.value)}><option value="">Selecione o tipo</option>{beneficios.map(b => <option key={b}>{b}</option>)}</select></label>
          <div className={styles.duplo}><label>Custo em pontos<input required type="number" min="0" step="1" value={custo} onChange={e => setCusto(e.target.value)} placeholder="Ex.: 150"/></label><label>Limite de uso<input required type="number" min="0" step="1" value={limite} onChange={e => setLimite(e.target.value)} placeholder="0 = sem limite"/></label></div>
          <label>Público<select value={publico} onChange={e => setPublico(e.target.value)}><option>Todos</option><option>ONGs</option><option>Exploradores</option></select></label>
          <div className={styles.duplo}><label>Início<input type="date" value={inicio} onChange={e => setInicio(e.target.value)}/></label><label>Término<input type="date" value={fim} min={inicio || undefined} onChange={e => setFim(e.target.value)}/></label></div>
          {erro && <p role="alert" className={styles.erro}>{erro}</p>}
          <button type="submit" className={styles.salvar}>{editando ? "Salvar alterações" : "Criar cupom"}</button>
          {editando && <button type="button" className={styles.cancelar} onClick={limpar}>Cancelar edição</button>}
        </form>
      </section>
      <section className={styles.tabelaCaixa} aria-label="Lista de cupons"><div className={styles.tabelaScroll}><table><thead><tr><th>Nome da oferta</th><th>Categoria</th><th>Custo em<br/>Pontos</th><th>Limite /<br/>Resgates</th><th>Público</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        {visiveis.map(c => <tr key={c.id}><td><strong>{c.nome}</strong><small className={styles.codigo}>{c.codigo}</small></td><td className={styles.roxo}>{c.categoria}</td><td className={styles.rosa}>{c.custo} pts</td><td className={styles.roxo}>{usados(c.id)}/{c.limite || "∞"}</td><td className={styles.rosa}>{c.publico}</td><td><span className={`${styles.status} ${situacao(c) === "ativos" ? styles.statusAtivo : situacao(c) === "pausados" ? styles.statusPausado : styles.statusEsgotado}`}>{situacao(c) === "ativos" ? "Ativo" : situacao(c) === "pausados" ? "Pausado" : "Esgotado"}</span></td><td className={styles.acoes}><button type="button" aria-label={`Ações para ${c.nome}`} aria-expanded={aberto === c.id} onClick={() => setAberto(aberto === c.id ? null : c.id)}><MoreHorizontal size={22}/></button>{aberto === c.id && <div className={styles.menuAcoes}><button type="button" onClick={() => editar(c)}>Editar</button><button type="button" onClick={() => alternar(c)}>{c.status === "ativo" ? "Pausar" : "Ativar"}</button><button type="button" onClick={() => excluir(c)}>Excluir</button></div>}</td></tr>)}
      </tbody></table>{visiveis.length === 0 && <p className={styles.vazio}>Nenhum cupom encontrado.</p>}</div>
      <footer className={styles.paginacao}><span>Mostrando {visiveis.length} de {lista.length} cupons</span><div><button type="button" aria-label="Página anterior" disabled={paginaAtual <= 1} onClick={() => setPagina(Math.max(1, paginaAtual - 1))}><ChevronLeft size={17}/></button><span className={styles.paginaAtual}>{paginaAtual}</span><span className={styles.totalPaginas}>de {totalPaginas}</span><button type="button" aria-label="Próxima página" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(Math.min(totalPaginas, paginaAtual + 1))}><ChevronRight size={17}/></button></div></footer></section>
    </div>
  </div>;
}
