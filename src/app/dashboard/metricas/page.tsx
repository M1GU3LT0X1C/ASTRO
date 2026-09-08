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
            <span style={{fontSize:"11px"}}>{open?"▾":"▸"}</span>
          </div>
          {subtitle && <small style={{fontSize:"11px", color:"#888"}}>{subtitle}</small>}
        </div>
        <span style={{fontSize:"14px", color:"#aaa"}}>•••</span>
      </div>
      {open && <div style={{marginTop:"14px"}}>{children}</div>}
    </div>
  )
}

export default function MetricasPage(){
  const alcance = [
    {d:"seg", h:52, v:52},
    {d:"ter", h:42, v:48},
    {d:"qua", h:28, v:32},
    {d:"qui", h:58, v:62},
    {d:"sex", h:48, v:55},
    {d:"sáb", h:78, v:85},
    {d:"dom", h:42, v:45},
  ];
  const economia = [
    {label:"Consultas Veterinárias (R$ 500)", color:"#ff1a3d", pct:35},
    {label:"Exames e diagnósticos (R$ 450)", color:"#0dbf6a", pct:45},
    {label:"Vacinas e imunização (R$ 250)", color:"#c85cff", pct:20},
  ];
  const matches = [
    {nome:"Coca-Cola", curtidas:45},
    {nome:"Biscoito", curtidas:40},
    {nome:"Vader", curtidas:35},
    {nome:"Sonequinha", curtidas:30},
  ];
  const astros = [
    {nome:"Coca-Cola", views:65, likes:20, msg:12, cor:"#0dbf6a"},
    {nome:"Vader", views:40, likes:15, msg:8, cor:"#0dbf6a"},
    {nome:"Biscoito", views:38, likes:12, msg:6, cor:"#ffde59"},
    {nome:"Sonequinha", views:32, likes:11, msg:5, cor:"#ffde59"},
    {nome:"Bibi", views:25, likes:11, msg:3, cor:"#ff8a2b"},
    {nome:"Jambo", views:10, likes:5, msg:2, cor:"#ff1a3d"},
  ];

  return(
    <div style={{background:"#f6f4ff", minHeight:"100vh", padding:"8px", display:"flex", justifyContent:"center"}}>
      <style>{`
        .wrap{ width:100%; max-width:1100px; }
        .grid{ display:flex; flex-direction:column; gap:16px; }
        .col{ display:flex; flex-direction:column; gap:16px; }
        .statsGrid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .hBar{ height:20px; background:#ff4b7a; border-radius:999px; }
        @media(min-width:900px){
          .grid{ display:grid; grid-template-columns:1fr 380px; gap:18px; align-items:start; }
        }
        @media(max-width:900px){
          .cardPad{ padding:16px !important; }
          .statsGrid{ gap:10px; }
          .barWrap{ gap:8px !important; }
        }
      `}</style>

      <div className="wrap">
        <div className="grid">
          {/* ESQUERDA */}
          <div className="col">
            <Card title="Alcance" subtitle="Últimos 7 dias">
              <div style={{display:"flex", alignItems:"end", gap:"6px", height:"140px", justifyContent:"space-between"}} className="barWrap">
                {alcance.map(a=>(
                  <div key={a.d} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"6px"}}>
                    <div style={{width:"100%", maxWidth:"36px", height:`${a.h}%`, background:"#1a125f", borderRadius:"8px 8px 0 0"}}></div>
                    <small style={{fontSize:"11px", color:"#444"}}>{a.d}</small>
                  </div>
                ))}
              </div>
              <div style={{display:"flex", justifyContent:"space-between", marginTop:"8px", fontSize:"10px", color:"#888"}}>
                <span>0</span><span>50</span><span>100</span>
              </div>
            </Card>

            <Card title="Economia em Saúde" subtitle="Últimos 7 dias">
              <div style={{display:"flex", gap:"18px", alignItems:"center", flexWrap:"wrap"}}>
                <div style={{width:"110px", height:"110px", borderRadius:"50%", background:`conic-gradient(${economia[0].color} 0% 35%, ${economia[1].color} 35% 80%, ${economia[2].color} 80% 100%)`, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <div style={{width:"64px", height:"64px", background:"#fff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:900}}>R$ 1.200</div>
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                  {economia.map(e=>(
                    <div key={e.label} style={{display:"flex", gap:"8px", alignItems:"center", fontSize:"11px"}}>
                      <span style={{width:"12px", height:"12px", background:e.color, borderRadius:"3px", display:"inline-block"}}></span>{e.label}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Matches e Interesses" subtitle="Últimos 7 dias">
              <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>
                {matches.map(m=>(
                  <div key={m.nome} style={{display:"flex", alignItems:"center", gap:"10px"}}>
                    <span style={{fontSize:"11px", width:"70px", fontWeight:600}}>{m.nome}</span>
                    <div style={{flex:1, background:"#efe8ff", borderRadius:"999px", height:"20px", overflow:"hidden"}}>
                      <div className="hBar" style={{width:`${m.curtidas*2}%`}}></div>
                    </div>
                    <span style={{fontSize:"11px", color:"#555", width:"60px"}}>{m.curtidas} curtidas</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* DIREITA */}
          <div className="col">
            <div style={{background:"#e9e2ff", borderRadius:"20px", padding:"14px", display:"flex", flexDirection:"column", gap:"12px"}}>
              <div style={{display:"flex", justifyContent:"space-between", padding:"4px"}}>
                <b style={{fontSize:"14px"}}>Visão geral da base</b><span style={{color:"#aaa"}}>•••</span>
              </div>
              <div className="statsGrid">
                <div style={{background:"#fff", borderRadius:"14px", padding:"14px"}}>
                  <small style={{fontSize:"11px", fontWeight:700}}>Capacidade</small>
                  <div style={{marginTop:"8px", display:"flex", flexDirection:"column", gap:"4px"}}>
                    <div style={{display:"flex", alignItems:"center", gap:"8px"}}><b style={{fontSize:"22px"}}>95%</b><span style={{fontSize:"10px", background:"#ffe1ea", padding:"5px 8px", borderRadius:"999px", fontWeight:700}}>0/20 vagas</span></div>
                    <small style={{fontSize:"10px", color:"#888"}}>(19/20 vagas)</small>
                  </div>
                </div>
                <div style={{background:"#fff", borderRadius:"14px", padding:"14px"}}>
                  <small style={{fontSize:"11px", fontWeight:700}}>Visualizações</small>
                  <div style={{marginTop:"8px", display:"flex", alignItems:"center", gap:"8px"}}><b style={{fontSize:"22px"}}>1.450</b><span style={{fontSize:"10px", background:"#ffd6e2", color:"#ff2d6a", padding:"5px 10px", borderRadius:"999px", fontWeight:800}}>+12% esse mês</span></div>
                </div>
                <div style={{background:"#fff", borderRadius:"14px", padding:"14px"}}>
                  <small style={{fontSize:"11px", fontWeight:700}}>Adoções concluídas</small>
                  <div style={{marginTop:"8px", display:"flex", alignItems:"center", gap:"8px"}}><b style={{fontSize:"22px"}}>18</b><small style={{fontSize:"10px"}}>pets</small><span style={{fontSize:"10px", background:"#1a125f", color:"#fff", padding:"5px 10px", borderRadius:"999px", fontWeight:700}}>+12% esse mês</span></div>
                </div>
                <div style={{background:"#fff", borderRadius:"14px", padding:"14px"}}>
                  <small style={{fontSize:"11px", fontWeight:700}}>Apadrinhamento</small>
                  <div style={{marginTop:"8px", display:"flex", alignItems:"center", gap:"8px"}}><b style={{fontSize:"22px"}}>14</b><span style={{fontSize:"10px", background:"#1a125f", color:"#fff", padding:"5px 10px", borderRadius:"999px", fontWeight:700}}>+2% esse mês</span></div>
                </div>
              </div>
            </div>

            <Card title="Desempenho de Astros" defaultOpen={true}>
              <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                {astros.map(a=>(
                  <div key={a.nome} style={{display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff0f5", borderRadius:"999px", padding:"10px 14px", border:"1px solid #ffe1ea"}}>
                    <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                      <div style={{width:"22px", height:"22px", borderRadius:"50%", background:"#ffb3c8"}}></div>
                      <b style={{fontSize:"12px"}}>{a.nome}</b>
                    </div>
                    <div style={{display:"flex", gap:"10px", fontSize:"10px", color:"#666", alignItems:"center"}}>
                      <span>{a.views} visualizações</span><span>{a.likes} curtidas</span><span>{a.msg} mensagens</span>
                      <span style={{width:"16px", height:"20px", background:a.cor, borderRadius:"3px", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"10px"}}>★</span>
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