"use client";
import { useState } from "react";

function Card({ title, subtitle, children, defaultOpen=true }: any){
  const [open,setOpen]=useState(defaultOpen);
  return(
    <div style={{background:"#fff", border:"1px solid #ece8f0", borderRadius:"18px", padding:"16px"}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer"}}>
        <div>
          <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
            <b style={{fontSize:"14px"}}>{title}</b>
            <span style={{fontSize:"11px", transition:".2s", display:"inline-block", transform: open? "rotate(0deg)":"rotate(-90deg)"}}>▾</span>
          </div>
          {subtitle && <small style={{fontSize:"11px", color:"#888"}}>{subtitle}</small>}
        </div>
        <span style={{fontSize:"16px", color:"#999", letterSpacing:"2px", cursor:"pointer"}} onClick={(e)=>{e.stopPropagation(); (window as any).showAstroAlert?.({title:"Mais opções", desc:"Filtros de métricas em breve!"})}}>•••</span>
      </div>
      {open && <div style={{marginTop:"14px"}}>{children}</div>}
    </div>
  )
}

function capacidadeCor(pct:number){
  if(pct>=100) return {bg:"#ff1a3d", label:"Lotação Máxima", text:"#fff"};
  if(pct>=90) return {bg:"#ff1a3d", label:"Lotação Crítica", text:"#fff"};
  if(pct>=60) return {bg:"#ffcc00", label:"Atenção", text:"#000"};
  return {bg:"#0dbf6a", label:"Disponível", text:"#fff"};
}

export default function MetricasPage(){
  const capacidade = 95; // 19/20 vagas
  const capInfo = capacidadeCor(capacidade);
  const alcance = [
    {d:"seg", v:54},
    {d:"ter", v:46},
    {d:"qua", v:32},
    {d:"qui", v:62},
    {d:"sex", v:52},
    {d:"sáb", v:82},
    {d:"dom", v:46},
  ];

  const astros = [
    {nome:"Coca-Cola", views:65, likes:20, msg:12, bandeira:"#0dbf6a", icon:"★"},
    {nome:"Vader", views:40, likes:15, msg:8, bandeira:"#0dbf6a", icon:"★"},
    {nome:"Biscoito", views:38, likes:12, msg:6, bandeira:"#ffde59", icon:"★"},
    {nome:"Sonequinha", views:32, likes:11, msg:5, bandeira:"#ffde59", icon:"★"},
    {nome:"Bibi", views:25, likes:11, msg:3, bandeira:"#ff8a2b", icon:"★"},
    {nome:"Jambo", views:10, likes:5, msg:2, bandeira:"#ff1a3d", icon:"★"},
  ];

  return(
    <div style={{background:"#f6f4ff", minHeight:"100vh", padding:"8px", display:"flex", justifyContent:"center"}}>
      <style>{`
        .wrap{ width:100%; max-width:1150px; }
        .grid{ display:flex; flex-direction:column; gap:16px; }
        .col{ display:flex; flex-direction:column; gap:16px; }
        .statsGrid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .yAxis{ display:flex; flex-direction:column-reverse; justify-content:space-between; height:120px; font-size:10px; color:#888; padding-right:6px; }
        @media(min-width:900px){ .grid{ display:grid; grid-template-columns:1fr 400px; gap:18px; } }
        @media(max-width:900px){ .grid{ gap:14px; } .col{ gap:14px; } }
      `}</style>

      <div className="wrap">
        <div className="grid">
          <div className="col">
            {/* ALCANCE COM EIXO 0-100 */}
            <Card title="Alcance" subtitle="Últimos 7 dias">
              <div style={{display:"flex", gap:"8px"}}>
                <div className="yAxis"><span>0</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span><span>60</span><span>70</span><span>80</span><span>90</span><span>100</span></div>
                <div style={{flex:1, display:"flex", alignItems:"end", gap:"8px", height:"120px", borderLeft:"1px solid #e9e2ff", borderBottom:"1px solid #e9e2ff", paddingLeft:"8px"}}>
                  {alcance.map(a=>(
                    <div key={a.d} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"6px"}}>
                      <div title={`${a.v} visualizações`} style={{width:"100%", maxWidth:"32px", height:`${a.v}%`, background:"#1a125f", borderRadius:"6px 6px 0 0", minHeight:"8px"}}></div>
                      <small style={{fontSize:"10px", color:"#444"}}>{a.d}</small>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Economia em Saúde" subtitle="Últimos 7 dias">
              <div style={{display:"flex", gap:"18px", alignItems:"center"}}>
                <div style={{width:"120px", height:"120px", borderRadius:"50%", background:"conic-gradient(#ff1a3d 0% 35%, #0dbf6a 35% 78%, #c85cff 78% 100%)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <div style={{width:"70px", height:"70px", background:"#fff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:900}}>R$ 1.200</div>
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:"10px", fontSize:"11px"}}>
                  <div style={{display:"flex", gap:"8px", alignItems:"center"}}><span style={{width:"12px", height:"12px", background:"#ff1a3d", borderRadius:"2px"}}></span> Consultas Veterinárias (R$ 500)</div>
                  <div style={{display:"flex", gap:"8px", alignItems:"center"}}><span style={{width:"12px", height:"12px", background:"#0dbf6a", borderRadius:"2px"}}></span> Exames e diagnósticos (R$ 450)</div>
                  <div style={{display:"flex", gap:"8px", alignItems:"center"}}><span style={{width:"12px", height:"12px", background:"#c85cff", borderRadius:"2px"}}></span> Vacinas e imunização (R$ 250)</div>
                </div>
              </div>
            </Card>

            <Card title="Matches e Interesses" subtitle="Últimos 7 dias">
              <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>
                {[
                  {nome:"Coca-Cola", v:45},
                  {nome:"Biscoito", v:40},
                  {nome:"Vader", v:35},
                  {nome:"Sonequinha", v:30},
                ].map(m=>(
                  <div key={m.nome} style={{display:"flex", alignItems:"center", gap:"10px"}}>
                    <span style={{fontSize:"11px", width:"70px", fontWeight:600}}>{m.nome}</span>
                    <div style={{flex:1, background:"#efe8ff", borderRadius:"999px", height:"18px", overflow:"hidden"}}>
                      <div style={{width:`${m.v*1.8}%`, height:"100%", background:"#ff4b7a", borderRadius:"999px"}}></div>
                    </div>
                    <span style={{fontSize:"10px", color:"#555", width:"60px"}}>{m.v} curtidas</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="col">
            <div style={{background:"#e9e2ff", borderRadius:"20px", padding:"14px", display:"flex", flexDirection:"column", gap:"12px"}}>
              <div style={{display:"flex", justifyContent:"space-between", padding:"4px"}}><b style={{fontSize:"14px"}}>Visão geral da base</b><span style={{color:"#aaa"}}>•••</span></div>
              <div className="statsGrid">
                <div style={{background:"#fff", borderRadius:"14px", padding:"14px"}}>
                  <small style={{fontSize:"11px", fontWeight:700}}>Capacidade</small>
                  <div style={{marginTop:"8px", display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap"}}>
                    <b style={{fontSize:"22px"}}>{capacidade}%</b>
                    <span style={{fontSize:"10px", background:capInfo.bg, color:capInfo.text, padding:"6px 12px", borderRadius:"999px", fontWeight:800}}>{capInfo.label}</span>
                  </div>
                  <small style={{fontSize:"10px", color:"#888"}}>(19/20 vagas)</small>
                </div>
                <div style={{background:"#fff", borderRadius:"14px", padding:"14px"}}>
                  <small style={{fontSize:"11px", fontWeight:700}}>Visualizações</small>
                  <div style={{marginTop:"8px", display:"flex", alignItems:"center", gap:"8px"}}><b style={{fontSize:"22px"}}>1.450</b><span style={{fontSize:"10px", background:"#ffd6e2", color:"#ff2d6a", padding:"6px 12px", borderRadius:"999px", fontWeight:800}}>+12% esse mês</span></div>
                </div>
                <div style={{background:"#fff", borderRadius:"14px", padding:"14px"}}>
                  <small style={{fontSize:"11px", fontWeight:700}}>Adoções concluídas</small>
                  <div style={{marginTop:"8px", display:"flex", alignItems:"center", gap:"8px"}}><b style={{fontSize:"22px"}}>18</b><small style={{fontSize:"10px"}}>pets</small><span style={{fontSize:"10px", background:"#1a125f", color:"#fff", padding:"6px 12px", borderRadius:"999px", fontWeight:700}}>+12% esse mês</span></div>
                </div>
                <div style={{background:"#fff", borderRadius:"14px", padding:"14px"}}>
                  <small style={{fontSize:"11px", fontWeight:700}}>Apadrinhamento</small>
                  <div style={{marginTop:"8px", display:"flex", alignItems:"center", gap:"8px"}}><b style={{fontSize:"22px"}}>14</b><span style={{fontSize:"10px", background:"#1a125f", color:"#fff", padding:"6px 12px", borderRadius:"999px", fontWeight:700}}>+2% esse mês</span></div>
                </div>
              </div>
            </div>

            <Card title="Desempenho de Astros" defaultOpen={true}>
              <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                {astros.map(a=>(
                  <div key={a.nome} style={{display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff0f5", borderRadius:"999px", padding:"10px 14px", border:"1px solid #ffe1ea"}}>
                    <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                      <div style={{width:"24px", height:"24px", borderRadius:"50%", background:"#ffb3c8", border:"2px solid #fff"}}></div>
                      <b style={{fontSize:"12px"}}>{a.nome}</b>
                    </div>
                    <div style={{display:"flex", gap:"12px", fontSize:"10px", color:"#555", alignItems:"center"}}>
                      <span>{a.views} visualizações</span><span>{a.likes} curtidas</span><span>{a.msg} mensagens</span>
                      <span style={{width:"20px", height:"22px", background:a.bandeira, borderRadius:"4px", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, boxShadow:"0 2px 6px rgba(0,0,0,.2)"}}>{a.icon}</span>
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