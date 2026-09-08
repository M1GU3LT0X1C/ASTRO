"use client";
import { useState } from "react";

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

function capacidadeCor(pct:number){
  if(pct>=100) return {bg:"#ff1a3d", label:"Lotação Máxima"};
  if(pct>=90) return {bg:"#ff1a3d", label:"Lotação Crítica"};
  if(pct>=60) return {bg:"#ffcc00", label:"Atenção"};
  return {bg:"#0dbf6a", label:"Disponível"};
}

export default function MetricasPage(){
  const capacidade = 95;
  const capInfo = capacidadeCor(capacidade);
  const alcance = [
    {d:"seg", v:52},{d:"ter", v:44},{d:"qua", v:30},{d:"qui", v:60},{d:"sex", v:50},{d:"sáb", v:80},{d:"dom", v:44},
  ];
  const astros = [
    {nome:"Coca-Cola", views:65, likes:20, msg:12, bandeira:"/bandeiraverde.png"},
    {nome:"Vader", views:40, likes:15, msg:8, bandeira:"/bandeiraverde.png"},
    {nome:"Biscoito", views:38, likes:12, msg:6, bandeira:"/bandeiraamarela.png"},
    {nome:"Sonequinha", views:32, likes:11, msg:5, bandeira:"/bandeiraamarela.png"},
    {nome:"Bibi", views:25, likes:11, msg:3, bandeira:"/bandeiralaranja.png"},
    {nome:"Jambo", views:10, likes:5, msg:2, bandeira:"/bandeiravermelha.png"},
  ];

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
        .astroRow{ display:flex; align-items:center; justify-content:space-between; background:#fff0f5; border-radius:999px; padding:10px 12px; border:1px solid #ffe1ea; width:100%; box-sizing:border-box; gap:6px; }
        @media(max-width:600px){
          .statsGrid{ grid-template-columns:1fr 1fr; gap:8px; }
          .cardStat{ padding:10px; }
          .badge{ font-size:8px; padding:4px 8px; }
          .astroRow{ padding:8px 10px; }
        }
        @media(min-width:900px){ .grid{ display:grid; grid-template-columns:1fr 400px; gap:16px; align-items:start; } }
      `}</style>

      <div className="wrap">
        <div className="grid">
          <div className="col">
            <Card title="Alcance" subtitle="Últimos 7 dias">
              <div style={{display:"flex", gap:"8px", width:"100%"}}>
                <div className="yAxis"><span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span></div>
                <div style={{flex:1, display:"flex", alignItems:"end", gap:"6px", height:"120px", borderLeft:"1px solid #ece8f0", borderBottom:"1px solid #ece8f0", padding:"0 6px"}}>
                  {alcance.map(a=>(
                    <div key={a.d} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", minWidth:0}}>
                      <div style={{width:"100%", maxWidth:"32px", height:`${a.v}%`, background:"#1a125f", borderRadius:"6px 6px 0 0"}}></div>
                      <small style={{fontSize:"9px"}}>{a.d}</small>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Economia em Saúde" subtitle="Últimos 7 dias">
              <div style={{display:"flex", gap:"14px", alignItems:"center", flexWrap:"wrap"}}>
                <div style={{width:"100px", height:"100px", borderRadius:"50%", background:"conic-gradient(#ff1a3d 0% 35%, #0dbf6a 35% 78%, #c85cff 78% 100%)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  <div style={{width:"60px", height:"60px", background:"#fff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:900}}>R$ 1.200</div>
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:"8px", fontSize:"10px", flex:1, minWidth:"120px"}}>
                  <div><span style={{width:"10px", height:"10px", background:"#ff1a3d", display:"inline-block", borderRadius:"2px", marginRight:"6px"}}></span>Consultas (R$ 500)</div>
                  <div><span style={{width:"10px", height:"10px", background:"#0dbf6a", display:"inline-block", borderRadius:"2px", marginRight:"6px"}}></span>Exames (R$ 450)</div>
                  <div><span style={{width:"10px", height:"10px", background:"#c85cff", display:"inline-block", borderRadius:"2px", marginRight:"6px"}}></span>Vacinas (R$ 250)</div>
                </div>
              </div>
            </Card>

            <Card title="Matches e Interesses" subtitle="Últimos 7 dias">
              <div style={{display:"flex", flexDirection:"column", gap:"12px", width:"100%"}}>
                {[{n:"Coca-Cola",v:45},{n:"Biscoito",v:40},{n:"Vader",v:35},{n:"Sonequinha",v:30}].map(m=>(
                  <div key={m.n} style={{display:"flex", alignItems:"center", gap:"8px", width:"100%"}}>
                    <span style={{fontSize:"10px", width:"60px", fontWeight:600, flexShrink:0}}>{m.n}</span>
                    <div style={{flex:1, background:"#efe8ff", borderRadius:"999px", height:"16px", overflow:"hidden", minWidth:0}}>
                      <div style={{width:`${m.v*2}%`, height:"100%", background:"#ff4b7a"}}></div>
                    </div>
                    <span style={{fontSize:"9px", width:"52px", flexShrink:0}}>{m.v} curtidas</span>
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
                    <b style={{fontSize:"20px"}}>{capacidade}%</b>
                    <span className="badge" style={{background:capInfo.bg, color:capInfo.bg==="#ffcc00"?"#000":"#fff"}}>{capInfo.label}</span>
                  </div>
                  <small style={{fontSize:"9px", color:"#888"}}>(19/20 vagas)</small>
                </div>
                <div className="cardStat">
                  <small style={{fontSize:"10px", fontWeight:700}}>Visualizações</small>
                  <div style={{marginTop:"6px", display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap"}}>
                    <b style={{fontSize:"20px"}}>1.450</b>
                    <span className="badge" style={{background:"#ffd6e2", color:"#ff2d6a"}}>+12% esse mês</span>
                  </div>
                </div>
                <div className="cardStat">
                  <small style={{fontSize:"10px", fontWeight:700}}>Adoções concluídas</small>
                  <div style={{marginTop:"6px", display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap"}}>
                    <b style={{fontSize:"18px"}}>18</b><small style={{fontSize:"9px"}}>pets</small>
                    <span className="badge" style={{background:"#1a125f", color:"#fff"}}>+12% esse mês</span>
                  </div>
                </div>
                <div className="cardStat">
                  <small style={{fontSize:"10px", fontWeight:700}}>Apadrinhamento</small>
                  <div style={{marginTop:"6px", display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap"}}>
                    <b style={{fontSize:"18px"}}>14</b>
                    <span className="badge" style={{background:"#1a125f", color:"#fff"}}>+2% esse mês</span>
                  </div>
                </div>
              </div>
            </div>

            <Card title="Desempenho de Astros" defaultOpen={true}>
              <div style={{display:"flex", flexDirection:"column", gap:"8px", width:"100%"}}>
                {astros.map(a=>(
                  <div key={a.nome} className="astroRow">
                    <div style={{display:"flex", alignItems:"center", gap:"8px", minWidth:0}}>
                      <div style={{width:"20px", height:"20px", borderRadius:"50%", background:"#ffb3c8", flexShrink:0}}></div>
                      <b style={{fontSize:"11px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{a.nome}</b>
                    </div>
                    <div style={{display:"flex", gap:"6px", fontSize:"9px", color:"#555", alignItems:"center", flexShrink:0}}>
                      <span>{a.views} vis.</span><span>{a.likes} curt.</span><span>{a.msg} msg</span>
                      <img src={a.bandeira} alt="" style={{width:"16px", height:"20px", objectFit:"contain"}} />
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