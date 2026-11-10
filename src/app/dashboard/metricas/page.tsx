"use client";
import { useEffect, useState } from "react";
import { buscarMetricas, type Metricas } from "@/lib/ong";

function Card({ title, subtitle, children, defaultOpen=true }: any){
  const [open,setOpen]=useState(defaultOpen);
  return(
    <div style={{background:"#fff", border:"1px solid #ece8f0", borderRadius:"18px", padding:"14px", width:"100%", boxSizing:"border-box"}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex", alignItems:"center", cursor:"pointer"}}>
        <b style={{fontSize:"13px"}}>{title}</b>
        <span style={{fontSize:"10px", marginLeft:"6px", transform: open? "rotate(0deg)":"rotate(-90deg)", transition:".2s"}}>▾</span>
        {subtitle && <small style={{fontSize:"10px", color:"#888", marginLeft:"8px"}}>{subtitle}</small>}
      </div>
      {open && <div style={{marginTop:"12px"}}>{children}</div>}
    </div>
  )
}

export default function MetricasPage(){
  const [m, setM] = useState<Metricas | null>(null);
  const [erro, setErro] = useState("");
  useEffect(() => {
    buscarMetricas().then(setM).catch(() => setErro("Não foi possível carregar as métricas agora."));
  }, []);

  const BANDEIRA: Record<string, string> = { disponivel:"/bandeiraverde.png", reservado:"/bandeiraamarela.png", em_tratamento:"/bandeiralaranja.png", adotado:"/bandeiravermelha.png" };
  const pets = (m?.pets ?? []).map(p => ({ nome:p.nome, views:p.visualizacoes, likes:p.favoritos, msg:p.solicitacoes, bandeira:BANDEIRA[p.status] }));
  const capacidade = m?.capacidade || 20;
  // ocupacao = pets ainda sob cuidado da ONG (adotados ja sairam)
  const totalPets = m ? m.totalPets - m.adotados : 0;
  const capacidadePct = totalPets === 0 ? 0 : Math.min(100, Math.round((totalPets/capacidade)*100));

  const DIAS = ["dom","seg","ter","qua","qui","sex","sáb"];
  const maxAlcance = Math.max(1, ...(m?.alcance ?? []).map(a => a.total));
  const alcance = (m?.alcance ?? []).map(a => ({ d: DIAS[new Date(a.data+"T12:00:00").getDay()], v: Math.round(a.total/maxAlcance*100), total: a.total }));
  const totalSemana = alcance.reduce((soma, a) => soma + a.total, 0);
  const variacao = (atual:number, anterior:number) => anterior === 0 ? (atual > 0 ? "+100%" : "+0%") : `${atual >= anterior ? "+" : ""}${Math.round((atual-anterior)/anterior*100)}%`;
  const interesses = [...(m?.pets ?? [])].filter(p => p.favoritos > 0).sort((a,b) => b.favoritos-a.favoritos).slice(0,3);
  const maxFav = Math.max(1, ...interesses.map(p => p.favoritos));

  return(
    <div style={{background:"#f6f4ff", minHeight:"100vh", padding:"10px", display:"flex", justifyContent:"center", width:"100%", boxSizing:"border-box"}}>
      <style>{`
        .wrap{ width:100%; max-width:1150px; }
        .grid{ display:flex; flex-direction:column; gap:14px; width:100%; }
        .col{ display:flex; flex-direction:column; gap:14px; width:100%; }
        .statsGrid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; width:100%; }
        .yAxis{ display:flex; flex-direction:column-reverse; justify-content:space-between; height:120px; font-size:9px; color:#888; padding-right:6px; }
        .cardStat{ background:#fff; border-radius:14px; padding:12px; min-width:0; box-sizing:border-box; }
        .badge{ font-size:9px; padding:5px 10px; border-radius:999px; font-weight:800; white-space:nowrap; }
        .dragName{ overflow-x:auto; white-space:nowrap; scrollbar-width:none; -ms-overflow-style:none; flex:1; min-width:0; cursor:grab; }
        .dragName::-webkit-scrollbar{ display:none; }
        .astroRow{ display:flex; align-items:center; justify-content:space-between; background:#f7f4ff; border-radius:999px; padding:10px 12px; border:1px solid #efe8ff; width:100%; box-sizing:border-box; gap:8px; }
        @media(max-width:600px){ .statsGrid{ gap:8px; } }
        @media(min-width:900px){ .grid{ display:grid; grid-template-columns:1fr 400px; gap:16px; align-items:start; } }
      `}</style>

      <div className="wrap">
        <div className="grid">
          <div className="col">
            <Card title="Alcance" subtitle="Últimos 7 dias">
              <div style={{display:"flex", gap:"8px", width:"100%"}}>
                <div className="yAxis"><span>0</span><span>{Math.round(maxAlcance/2)}</span><span>{maxAlcance}</span></div>
                <div style={{flex:1, display:"flex", alignItems:"end", gap:"6px", height:"120px", borderLeft:"1px solid #ece8f0", borderBottom:"1px solid #ece8f0", padding:"0 6px"}}>
                  {alcance.map(a=>(
                    <div key={a.d+a.total} title={`${a.total} visualizações`} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", minWidth:0}}>
                      <div style={{width:"100%", maxWidth:"32px", height:`${a.v}%`, background:"#e9e2ff", borderRadius:"6px 6px 0 0", minHeight:"6px"}}></div>
                      <small style={{fontSize:"9px"}}>{a.d}</small>
                    </div>
                  ))}
                </div>
              </div>
              <small style={{fontSize:"10px", color:"#aaa", marginTop:"8px", display:"block"}}>{erro || (m ? `${totalSemana} visualizações nos últimos 7 dias` : "Carregando...")}</small>
            </Card>

            <Card title="Economia em Saúde" subtitle="Últimos 7 dias">
              <div style={{display:"flex", gap:"14px", alignItems:"center", flexWrap:"wrap"}}>
                <div style={{width:"100px", height:"100px", borderRadius:"50%", background:"#e9e2ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  <div style={{width:"60px", height:"60px", background:"#fff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:900, color:"#aaa"}}>R$ 0</div>
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:"8px", fontSize:"10px", flex:1, minWidth:"120px", color:"#888"}}>
                  <div><span style={{width:"10px", height:"10px", background:"#e9e2ff", display:"inline-block", borderRadius:"2px", marginRight:"6px"}}></span>Consultas (R$ 0)</div>
                  <div><span style={{width:"10px", height:"10px", background:"#e9e2ff", display:"inline-block", borderRadius:"2px", marginRight:"6px"}}></span>Exames (R$ 0)</div>
                  <div><span style={{width:"10px", height:"10px", background:"#e9e2ff", display:"inline-block", borderRadius:"2px", marginRight:"6px"}}></span>Vacinas (R$ 0)</div>
                </div>
              </div>
            </Card>

            <Card title="Matches e Interesses" subtitle="Últimos 7 dias">
              <div style={{display:"flex", flexDirection:"column", gap:"12px", width:"100%"}}>
                {interesses.length===0 && <small style={{fontSize:"10px", color:"#999"}}>Nenhum interesse ainda. Seus pets aparecerão aqui quando forem favoritados.</small>}
                {interesses.map(p=>(
                  <div key={p.id} style={{display:"flex", alignItems:"center", gap:"8px", width:"100%"}}>
                    <span style={{fontSize:"10px", width:"60px", flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{p.nome}</span>
                    <div style={{flex:1, background:"#efe8ff", borderRadius:"999px", height:"16px", minWidth:0}}><div style={{width:`${Math.round(p.favoritos/maxFav*100)}%`, height:"100%", background:"#ff4b7a", borderRadius:"999px"}}></div></div>
                    <span style={{fontSize:"9px", width:"52px", flexShrink:0}}>{p.favoritos} curtida{p.favoritos===1?"":"s"}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="col">
            <div style={{background:"#e9e2ff", borderRadius:"20px", padding:"10px", display:"flex", flexDirection:"column", gap:"10px", width:"100%", boxSizing:"border-box"}}>
              <b style={{fontSize:"13px", padding:"6px"}}>Visão geral da base</b>
              <div className="statsGrid">
                <div className="cardStat">
                  <small style={{fontSize:"10px", fontWeight:700}}>Capacidade</small>
                  <div style={{marginTop:"6px", display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap"}}>
                    <b style={{fontSize:"20px"}}>{capacidadePct}%</b>
                    <span className="badge" style={{background: capacidadePct>=90 ? "#ff1a3d" : capacidadePct>=60 ? "#ffcc00" : "#0dbf6a", color: capacidadePct>=60 && capacidadePct<90 ? "#000" : "#fff"}}>{capacidadePct>=100?"Lotação Máxima":capacidadePct>=90?"Lotação Crítica":capacidadePct>=60?"Atenção":"Disponível"}</span>
                  </div>
                  <small style={{fontSize:"9px", color:"#888"}}>({totalPets}/{capacidade} vagas)</small>
                </div>
                <div className="cardStat">
                  <small style={{fontSize:"10px", fontWeight:700}}>Visualizações</small>
                  <div style={{marginTop:"6px"}}><b style={{fontSize:"20px"}}>{m?.visualizacoesMes ?? 0}</b><span className="badge" style={{background:"#f1edff", color:"#888", marginLeft:"6px"}}>{variacao(m?.visualizacoesMes ?? 0, m?.visualizacoesMesAnterior ?? 0)} esse mês</span></div>
                </div>
                <div className="cardStat">
                  <small style={{fontSize:"10px", fontWeight:700}}>Adoções concluídas</small>
                  <div style={{marginTop:"6px"}}><b style={{fontSize:"18px"}}>{m?.adocoesConcluidas ?? 0}</b><small style={{fontSize:"9px", marginLeft:"4px"}}>pets</small><span className="badge" style={{background:"#f1edff", color:"#888", marginLeft:"6px"}}>{m?.solicitacoesPendentes ?? 0} pendentes</span></div>
                </div>
                <div className="cardStat">
                  <small style={{fontSize:"10px", fontWeight:700}}>Apadrinhamento</small>
                  <div style={{marginTop:"6px"}}><b style={{fontSize:"18px"}}>0</b><span className="badge" style={{background:"#f1edff", color:"#888", marginLeft:"6px"}}>+0%</span></div>
                </div>
              </div>
            </div>

            <Card title="Desempenho de Astros" defaultOpen={true}>
              <div style={{display:"flex", flexDirection:"column", gap:"8px", width:"100%"}}>
                {totalPets===0 ? (
                  <small style={{fontSize:"10px", color:"#999", padding:"6px"}}>Cadastre pets para ver o desempenho aqui. No mobile arraste o nome pro lado pra ver completo.</small>
                ) : null}
                {pets.slice(0,6).map((a,i)=>(
                  <div key={i} className="astroRow">
                    <div style={{display:"flex", alignItems:"center", gap:"8px", flex:1, minWidth:0}}>
                      <div style={{width:"20px", height:"20px", borderRadius:"50%", background:"#e9e2ff", flexShrink:0}}></div>
                      {/* ARRASTAR PRO LADO AQUI */}
                      <div className="dragName"><b style={{fontSize:"11px"}}>{a.nome || "—"}</b></div>
                    </div>
                    <div style={{display:"flex", gap:"6px", fontSize:"9px", color:"#888", alignItems:"center", flexShrink:0}}>
                      <span>{a.views||0} vis.</span><span>{a.likes||0} curt.</span><span>{a.msg||0} msg</span>
                      <img src={a.bandeira||"/bandeiraverde.png"} alt="" style={{width:"16px", height:"20px", objectFit:"contain"}} onError={(e)=>{ e.currentTarget.style.display='none'; }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}