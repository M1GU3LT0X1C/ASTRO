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
  const dias = ["seg","ter","qua","qui","sex","sáb","dom"];
  const [periodo,setPeriodo]=useState("Últimos 7 dias");

  return(
    <div style={{background:"#f6f4ff", minHeight:"100vh", padding:"12px", display:"flex", justifyContent:"center"}}>
      <style>{`
        .grid{ display:flex; flex-direction:column; gap:14px; width:100%; max-width:1100px; }
        .col{ display:flex; flex-direction:column; gap:14px; flex:1; }
        .statsGrid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .bar{ background:#1a125f; border-radius:6px 6px 0 0; width:22px; transition:.3s; }
        .hBar{ height:18px; background:#ff4b7a; border-radius:999px; }
        @media(min-width:900px){
          .grid{ display:grid; grid-template-columns:1fr 380px; gap:16px; align-items:start; }
          .col{ gap:16px; }
        }
      `}</style>

      <div className="grid">
        {/* ESQUERDA */}
        <div className="col">
          <Card title="Alcance" subtitle={periodo}>
            <div style={{display:"flex", alignItems:"end", gap:"10px", height:"120px", paddingTop:"10px", justifyContent:"space-between"}}>
              {dias.map(d=>(
                <div key={d} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", flex:1}}>
                  <div className="bar" style={{height:"8px", background:"#e9e2ff"}} title="0 visualizações"></div>
                  <small style={{fontSize:"10px", color:"#666"}}>{d}</small>
                </div>
              ))}
            </div>
            <small style={{fontSize:"10px", color:"#aaa", marginTop:"8px", display:"block"}}>0 visualizações no total - comece cadastrando pets</small>
          </Card>

          <Card title="Economia em Saúde" subtitle="Últimos 7 dias">
            <div style={{display:"flex", gap:"16px", alignItems:"center"}}>
              <div style={{width:"90px", height:"90px", borderRadius:"999px", background:"conic-gradient(#e9e2ff 0% 100%)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                <div style={{width:"54px", height:"54px", background:"#fff", borderRadius:"999px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:800, color:"#aaa"}}>R$ 0</div>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:"8px", fontSize:"11px"}}>
                <div style={{display:"flex", gap:"6px", alignItems:"center"}}><span style={{width:"10px", height:"10px", background:"#ff4b7a", borderRadius:"2px"}}></span> Consultas Veterinárias (R$ 0)</div>
                <div style={{display:"flex", gap:"6px", alignItems:"center"}}><span style={{width:"10px", height:"10px", background:"#1fbf7a", borderRadius:"2px"}}></span> Exames e diagnósticos (R$ 0)</div>
                <div style={{display:"flex", gap:"6px", alignItems:"center"}}><span style={{width:"10px", height:"10px", background:"#c78bff", borderRadius:"2px"}}></span> Vacinas e imunização (R$ 0)</div>
              </div>
            </div>
          </Card>

          <Card title="Matches e Interesses" subtitle="Últimos 7 dias">
            <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
              <small style={{fontSize:"11px", color:"#999"}}>Nenhum interesse ainda. Seus pets aparecerão aqui quando receberem curtidas.</small>
              {[
                {nome:"—", val:0},
                {nome:"—", val:0},
                {nome:"—", val:0},
              ].map((p,i)=>(
                <div key={i} style={{display:"flex", alignItems:"center", gap:"8px"}}>
                  <span style={{fontSize:"10px", width:"60px", color:"#888"}}>{p.nome}</span>
                  <div style={{flex:1, background:"#f1edff", borderRadius:"999px", height:"18px", overflow:"hidden"}}>
                    <div className="hBar" style={{width:`${p.val}%`, background:"#e9e2ff"}}></div>
                  </div>
                  <span style={{fontSize:"10px", color:"#888", width:"50px"}}>0 curtidas</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* DIREITA */}
        <div className="col">
          <div style={{background:"#ede8ff", borderRadius:"18px", padding:"12px", display:"flex", flexDirection:"column", gap:"10px"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 6px"}}>
              <b style={{fontSize:"13px"}}>Visão geral da base</b>
              <small style={{fontSize:"10px", color:"#aaa"}}>•••</small>
            </div>
            <div className="statsGrid">
              <div style={{background:"#fff", borderRadius:"12px", padding:"12px"}}>
                <small style={{fontSize:"11px", fontWeight:700}}>Capacidade</small>
                <div style={{display:"flex", alignItems:"center", gap:"8px", marginTop:"6px"}}>
                  <b style={{fontSize:"20px"}}>0%</b>
                  <span style={{fontSize:"9px", background:"#f1edff", color:"#1a125f", padding:"4px 8px", borderRadius:"999px", fontWeight:700}}>0/20 vagas</span>
                </div>
              </div>
              <div style={{background:"#fff", borderRadius:"12px", padding:"12px"}}>
                <small style={{fontSize:"11px", fontWeight:700}}>Visualizações</small>
                <div style={{display:"flex", alignItems:"center", gap:"8px", marginTop:"6px"}}>
                  <b style={{fontSize:"20px"}}>0</b>
                  <span style={{fontSize:"9px", background:"#ffe1ea", color:"#ff4b7a", padding:"4px 8px", borderRadius:"999px", fontWeight:700}}>+0% esse mês</span>
                </div>
              </div>
              <div style={{background:"#fff", borderRadius:"12px", padding:"12px"}}>
                <small style={{fontSize:"11px", fontWeight:700}}>Adoções concluídas</small>
                <div style={{display:"flex", alignItems:"center", gap:"8px", marginTop:"6px"}}>
                  <b style={{fontSize:"20px"}}>0</b>
                  <span style={{fontSize:"9px", background:"#1a125f", color:"#fff", padding:"4px 8px", borderRadius:"999px", fontWeight:700}}>+0% esse mês</span>
                </div>
              </div>
              <div style={{background:"#fff", borderRadius:"12px", padding:"12px"}}>
                <small style={{fontSize:"11px", fontWeight:700}}>Apadrinhamento</small>
                <div style={{display:"flex", alignItems:"center", gap:"8px", marginTop:"6px"}}>
                  <b style={{fontSize:"20px"}}>0</b>
                  <span style={{fontSize:"9px", background:"#1a125f", color:"#fff", padding:"4px 8px", borderRadius:"999px", fontWeight:700}}>+0% esse mês</span>
                </div>
              </div>
            </div>
          </div>

          <Card title="Desempenho de Astros" defaultOpen={true}>
            <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
              <small style={{fontSize:"11px", color:"#999", marginBottom:"4px"}}>Cadastre pets para ver o desempenho aqui.</small>
              {[1,2,3].map(i=>(
                <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between", background:"#f7f4ff", borderRadius:"999px", padding:"8px 12px"}}>
                  <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                    <div style={{width:"22px", height:"22px", borderRadius:"999px", background:"#e9e2ff"}}></div>
                    <b style={{fontSize:"11px", color:"#aaa"}}>—</b>
                  </div>
                  <div style={{display:"flex", gap:"12px", fontSize:"10px", color:"#aaa"}}>
                    <span>0 visualizações</span>
                    <span>0 curtidas</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}