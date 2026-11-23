"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { listarMeusAnimais, type AnimalTela } from "@/lib/animais";
import styles from "./Metricas.module.css";

type Registro = AnimalTela & { views?:number; visualizacoes?:number; likes?:number; curtidas?:number; msg?:number; mensagens?:number };
const dias = ["dom","seg","ter","qua","qui","sex","sáb"];
const numero = (v:unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0;
const formatar = (v:number) => new Intl.NumberFormat("pt-BR").format(v);
const temCampo = (p:Registro, campos:string[]) => campos.some(c => typeof (p as unknown as Record<string,unknown>)[c] === "number");
const visualizacoes = (p:Registro) => numero(p.views ?? p.visualizacoes);
const curtidas = (p:Registro) => numero(p.likes ?? p.curtidas);
const mensagens = (p:Registro) => numero(p.msg ?? p.mensagens);

function Cartao({titulo,children,subtitulo="Últimos 7 dias"}:{titulo:string;children:ReactNode;subtitulo?:string}) {
 const [aberto,setAberto]=useState(true);
 return <section className={styles.cartao}><div className={styles.cabecalhoCartao}><div><button type="button" onClick={()=>setAberto(v=>!v)} aria-expanded={aberto} className={styles.tituloBotao}>{titulo}<span className={aberto?styles.seta:styles.setaFechada}>⌄</span></button><p className={styles.subtitulo}>{subtitulo}</p></div><span className={styles.pontos} aria-hidden="true">•••</span></div>{aberto&&<div className={styles.corpoCartao}>{children}</div>}</section>;
}
export default function MetricasONG(){
 const [pets,setPets]=useState<Registro[]>([]);
 const [carregando,setCarregando]=useState(true);
 const carregar=useCallback(async()=>{
  setCarregando(true);
  try {const resposta=await listarMeusAnimais();setPets(resposta as Registro[]);}
  catch { /* Mantém a tela sem exibir aviso de erro. */ }
  finally {setCarregando(false);}
 },[]);
 useEffect(()=>{void carregar();const onFocus=()=>void carregar();window.addEventListener("focus",onFocus);return()=>window.removeEventListener("focus",onFocus)},[carregar]);

 const ativos=pets.filter(p=>!["adotado","adotada","adopted","inativo","inativa"].includes((p.status||"").toLowerCase()));
 const adotados=pets.filter(p=>["adotado","adotada","adopted"].includes((p.status||"").toLowerCase())).length;
 const vagas=20;
 const percentual=Math.min(100,Math.round(ativos.length/vagas*100));
 const faixa=percentual>=90?"Lotação Crítica":percentual>=60?"Atenção":"Disponível";
 const temViews=pets.some(p=>temCampo(p,["views","visualizacoes"]));
 const temLikes=pets.some(p=>temCampo(p,["likes","curtidas"]));
 const temMsgs=pets.some(p=>temCampo(p,["msg","mensagens"]));
 const totalViews=pets.reduce((n,p)=>n+visualizacoes(p),0);
 const ranking=temLikes?[...pets].sort((a,b)=>curtidas(b)-curtidas(a)).slice(0,4):[];
 const max=Math.max(1,...ranking.map(curtidas));
 const melhores=[...pets].sort((a,b)=>(visualizacoes(b)+curtidas(b)+mensagens(b))-(visualizacoes(a)+curtidas(a)+mensagens(a))).slice(0,6);
 const dadosDisponiveis=temViews||temLikes||temMsgs;
 const hoje=new Date();
 const semana=Array.from({length:7},(_,i)=>{const d=new Date(hoje);d.setDate(hoje.getDate()-hoje.getDay()+i);return d;});
 const legendaDias=semana.map(d=>dias[d.getDay()]);
 return <div className={styles.pagina}>
  <div className={styles.colunaEsquerda}>
   <Cartao titulo="Alcance"><div className={styles.grafico}><div className={styles.eixoY}>{[100,90,80,70,60,50,40,30,20,10,0].map(n=><span key={n}>{n}</span>)}</div><div className={styles.areaBarras}>{legendaDias.map((dia,i)=><div className={styles.colunaBarra} key={i}><div className={styles.barra} style={{height:"1px"}}/><span>{dia}</span></div>)}</div></div></Cartao>
   <Cartao titulo="Economia em Saúde"><div className={styles.economia}><div className={styles.pizza} style={{background:"#ebe8f1"}}/><div className={styles.legenda}><span><i className={styles.legendaVermelha}/>Consultas Veterinárias — sem dados</span><span><i className={styles.legendaVerde}/>Exames e diagnósticos — sem dados</span><span><i className={styles.legendaRoxa}/>Vacinas e Imunização — sem dados</span></div></div><p className={styles.informacao}>A economia será calculada quando houver registros financeiros de atendimentos.</p></Cartao>
   <Cartao titulo="Matches e Interesses">{ranking.length?<div className={styles.ranking}>{ranking.map(p=><div key={p.id} className={styles.linhaRanking}><span title={p.nome}>{p.nome}</span><div className={styles.trilho}><div className={styles.preenchimento} style={{width:`${curtidas(p)/max*100}%`}}>{curtidas(p)} curtidas</div></div></div>)}</div>:<p className={styles.semRanking}>Ainda não há dados de curtidas vinculados aos animais.</p>}</Cartao>
  </div>
  <div className={styles.colunaDireita}>
   <section className={styles.visaoGeral}><h2>Visão geral da base</h2><div className={styles.estatisticas}>
    <div className={styles.estatistica}><h3>Capacidade</h3><div className={styles.valorLinha}><strong>{percentual}%</strong><span className={`${styles.etiqueta} ${percentual>=90?styles.vermelho:styles.roxo}`}>{faixa}</span></div><small>({ativos.length}/{vagas} vagas)</small></div>
    <div className={styles.estatistica}><h3>Visualizações</h3><div className={styles.valorLinha}><strong>{temViews?formatar(totalViews):"—"}</strong></div><small>{temViews?"Total informado pelos registros":"Não disponível na API atual"}</small></div>
    <div className={styles.estatistica}><h3>Adoções concluídas</h3><div className={styles.valorLinha}><strong>{adotados}</strong></div><small>pets com status adotado</small></div>
    <div className={styles.estatistica}><h3>Apadrinhamento</h3><div className={styles.valorLinha}><strong>—</strong></div><small>Não disponível na API atual</small></div>
   </div></section>
   <section className={styles.desempenho}><div className={styles.desempenhoTopo}><h2>Desempenho de Astros</h2><span className={styles.pontos}>•••</span></div><div className={styles.listaPets}>{melhores.length?melhores.map(p=><div className={styles.petLinha} key={p.id}>{p.foto_url?<img src={p.foto_url} alt="" className={styles.petFoto}/>:<span className={styles.petAvatar}/>}<strong>{p.nome}</strong><span>{temCampo(p,["views","visualizacoes"])?visualizacoes(p):"—"} visualizações</span><span>{temCampo(p,["likes","curtidas"])?curtidas(p):"—"} curtidas</span><span>{temCampo(p,["msg","mensagens"])?mensagens(p):"—"} mensagens</span><span className={`${styles.favorito} ${styles.green}`}>★</span></div>):<p className={styles.estadoVazio}>{carregando?"Carregando animais...":"Nenhum animal cadastrado na ONG."}</p>}</div>{!dadosDisponiveis&&pets.length>0&&<p className={styles.informacao}>Visualizações, curtidas e mensagens ainda não são retornadas pela API de animais.</p>}</section>
  </div>
 </div>;
}
