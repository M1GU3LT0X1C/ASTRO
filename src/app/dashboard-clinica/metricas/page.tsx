"use client";

import { useMemo, useState } from "react";
import { BarChart3, ChevronDown, Heart, MessageCircle, MoreHorizontal, Ticket, Users } from "lucide-react";
import { useClinica } from "../useClinica";
import styles from "./Metricas.module.css";

type Periodo = 7 | 30;
const cores = ["#c90009", "#1da142", "#c222c9", "#170663", "#e73e70", "#f3b900"];

export default function MetricasClinica() {
  const { dados, pronto } = useClinica();
  const [periodo, setPeriodo] = useState<Periodo>(7);
  const [mostrar, setMostrar] = useState({ alcance: true, servicos: true, feedbacks: true });
  const [detalhes, setDetalhes] = useState<string | null>(null);
  const datas = useMemo(() => {
    const hoje = new Date();
    // Para 7 dias, exibir sempre a semana do calendário: domingo a sábado.
    const inicioSemana = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - hoje.getDay());
    return Array.from({ length: periodo }, (_, i) => {
      const d = periodo === 7
        ? new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate() + i)
        : new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - (periodo - i - 1));
      const chave = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      return { chave, rotulo: periodo === 7 ? ["dom","seg","ter","qua","qui","sex","sáb"][d.getDay()] : `${d.getDate()}/${d.getMonth()+1}` };
    });
  }, [periodo]);
  const contagem = datas.map(d => dados.resgates.filter(r => r.criadoEm.slice(0,10) === d.chave).length);
  const maior = Math.max(1, ...contagem);
  const totalPeriodo = contagem.reduce((a,b) => a+b,0);
  const servicosPorCategoria = Object.entries(dados.servicos.reduce<Record<string,number>>((acc,s) => { if(s.ativo) acc[s.categoria]=(acc[s.categoria]||0)+1; return acc; },{})).sort((a,b)=>b[1]-a[1]);
  const totalServicos = servicosPorCategoria.reduce((s,[,n])=>s+n,0);
  const fatias = servicosPorCategoria.map(([nome,n],i)=>({nome,n,cor:cores[i%cores.length],porcentagem:totalServicos?100*n/totalServicos:0}));
  const gradiente = fatias.reduce<{ acumulado: number; partes: string[] }>(
    (acc, f) => {
      const inicio = acc.acumulado;
      const fim = inicio + f.porcentagem;
      return { acumulado: fim, partes: [...acc.partes, `${f.cor} ${inicio}% ${fim}%`] };
    },
    { acumulado: 0, partes: [] }
  ).partes.join(", ");
  const cuponsOrdenados = dados.cupons.map(c=>({nome:c.nome,usos:dados.resgates.filter(r=>r.cupomId===c.id).length})).sort((a,b)=>b.usos-a.usos).slice(0,5);
  const maiorCupom = Math.max(1,...cuponsOrdenados.map(c=>c.usos));
  const alternar=(campo:keyof typeof mostrar)=>setMostrar(atual=>({...atual,[campo]:!atual[campo]}));

  return <div className={styles.pagina}>
    <div className={styles.colunaGraficos}>
      <section className={styles.graficoCard}>
        <div className={styles.cabecalho}><div><button className={styles.tituloBotao} type="button" onClick={()=>alternar("alcance")} aria-expanded={mostrar.alcance}>Resgates <ChevronDown size={16}/></button><small>Últimos {periodo} dias</small></div><div className={styles.controles}><select aria-label="Período dos gráficos" value={periodo} onChange={e=>setPeriodo(Number(e.target.value) as Periodo)}><option value={7}>7 dias</option><option value={30}>30 dias</option></select><button type="button" title="Sobre este gráfico" onClick={()=>setDetalhes(detalhes==="alcance"?null:"alcance")}><MoreHorizontal/></button></div></div>
        {detalhes==="alcance"&&<p className={styles.nota}>Resgates efetivamente registrados por dia. Não representa visualizações do perfil.</p>}
        {mostrar.alcance&&<div className={styles.areaBarras}><div className={styles.barras}>{datas.map((d,i)=><div className={styles.barraColuna} key={d.chave} title={`${d.chave}: ${contagem[i]} resgate(s)`}><span className={styles.barra} style={{height:`${Math.max(2,contagem[i]/maior*100)}%`}}/><small>{d.rotulo}</small></div>)}</div></div>}
      </section>
      <section className={styles.graficoCard}>
        <div className={styles.cabecalho}><div><button className={styles.tituloBotao} type="button" onClick={()=>alternar("servicos")} aria-expanded={mostrar.servicos}>Serviços por categoria <ChevronDown size={16}/></button><small>Serviços ativos cadastrados</small></div><button className={styles.menuBotao} type="button" title="Sobre este gráfico" onClick={()=>setDetalhes(detalhes==="servicos"?null:"servicos")}><MoreHorizontal/></button></div>
        {detalhes==="servicos"&&<p className={styles.nota}>Distribuição de serviços cadastrados; favoritos ainda não são registrados.</p>}
        {mostrar.servicos&&<div className={styles.pizzaConteudo}>{fatias.length?<><div className={styles.pizza} style={{background:`conic-gradient(${gradiente})`}} aria-label={`Distribuição de ${totalServicos} serviços`}/><div className={styles.legenda}>{fatias.map(f=><div key={f.nome}><i style={{background:f.cor}}/><span>{f.nome} ({f.n})</span></div>)}</div></>:<p className={styles.semDados}>Cadastre serviços para visualizar a distribuição.</p>}</div>}
      </section>
      <section className={styles.graficoCard}>
        <div className={styles.cabecalho}><div><button className={styles.tituloBotao} type="button" onClick={()=>alternar("feedbacks")} aria-expanded={mostrar.feedbacks}>Cupons mais utilizados <ChevronDown size={16}/></button><small>Histórico de resgates</small></div><button className={styles.menuBotao} type="button" title="Sobre este gráfico" onClick={()=>setDetalhes(detalhes==="feedbacks"?null:"feedbacks")}><MoreHorizontal/></button></div>
        {detalhes==="feedbacks"&&<p className={styles.nota}>Uso real de cupons; avaliações e feedbacks exigem uma integração futura.</p>}
        {mostrar.feedbacks&&<div className={styles.barrasHorizontais}>{cuponsOrdenados.length?cuponsOrdenados.map(c=><div className={styles.linhaHorizontal} key={c.nome}><span title={c.nome}>{c.nome}</span><div className={styles.trilho}><div style={{width:`${c.usos/maiorCupom*100}%`}}>{c.usos>0?`${c.usos} resgate(s)`:""}</div></div></div>):<p className={styles.semDados}>Nenhum cupom cadastrado.</p>}</div>}
      </section>
    </div>
    <div className={styles.colunaResumo}>
      <section className={styles.resumo}><h2>Visão geral da Clínica</h2><div className={styles.resumoGrid}>
        <div><span><Heart size={15}/> Feedbacks</span><strong>—</strong><small>Ainda não disponíveis</small></div>
        <div><span><BarChart3 size={15}/> Visualizações</span><strong>—</strong><small>Sem integração de acesso</small></div>
        <div><span><Ticket size={15}/> Cupons utilizados</span><strong>{pronto?dados.resgates.length:"—"}</strong><small>{totalPeriodo} nos últimos {periodo} dias</small></div>
        <div><span><Users size={15}/> Clientes conquistados</span><strong>—</strong><small>Sem identificação de clientes</small></div>
      </div></section>
      <section className={styles.frequentes}><div className={styles.frequentesTopo}><h2>Clientes frequentes</h2><MessageCircle size={20}/></div><div className={styles.frequentesVazio}><Users size={30}/><strong>Sem dados de clientes</strong><p>Os resgates atuais não identificam quem utilizou cada cupom. Esta lista ficará disponível quando houver integração com os perfis dos clientes.</p></div></section>
    </div>
  </div>;
}
