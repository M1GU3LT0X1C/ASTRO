"use client";
import { useState, useEffect } from "react";

type Tarefa = { id:string, data:string, hora:string, desc:string, pet?:string };

export default function AgendaPage(){
  const [hoje] = useState(new Date());
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dataSel, setDataSel] = useState(new Date());
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [popup, setPopup] = useState(false);
  const [form, setForm] = useState({data:"", hora:"08:30", desc:"", pet:""});
  const [hoverSeta, setHoverSeta] = useState<"prev"|"next"|null>(null);

  useEffect(()=>{
    const salvas = JSON.parse(localStorage.getItem("tarefas-agenda")||"[]");
    setTarefas(salvas);
    const d = new Date();
    setForm(f=>({...f, data: d.toISOString().split("T")[0]}));
  },[]);

  const salvar = (novas:Tarefa[])=>{
    setTarefas(novas);
    localStorage.setItem("tarefas-agenda", JSON.stringify(novas));
  };

  const diasNoMes = (d:Date)=> new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  const primeiroDia = (d:Date)=> new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const formatarDataBR = (d:Date)=> d.toLocaleDateString("pt-BR",{day:"numeric", month:"long", year:"numeric"});
  const toISO = (d:Date)=> d.toISOString().split("T")[0];

  const horarios = Array.from({length:15}, (_,i)=>{
    const h = i+6; // 06:00 as 20:00
    return `${String(h).padStart(2,"0")}:00`;
  });

  const tarefasDoDia = tarefas.filter(t=> t.data === toISO(dataSel));

  const adicionar = ()=>{
    if(!form.desc.trim()) return;
    const nova: Tarefa = { id: Date.now().toString(),...form };
    salvar([...tarefas, nova]);
    setPopup(false);
    setForm({data: toISO(dataSel), hora:"08:30", desc:"", pet:""});
  };

  const abrirPopup = (hora?:string)=>{
    setForm({data: toISO(dataSel), hora: hora||"08:30", desc:"", pet:""});
    setPopup(true);
  };

  return(
    <div style={{background:"#f6f4ff", minHeight:"100vh", padding:"10px", display:"flex", justifyContent:"center"}}>
      <style>{`
       .wrap{ width:100%; max-width:1200px; display:grid; grid-template-columns:320px 1fr; gap:14px; }
       .card{ background:#fff; border-radius:18px; padding:14px; border:1px solid #ece8f0; }
       .reag{ background:#e9e2ff; border-radius:18px; padding:14px; }
       .cal{ background:#ffd6e2; border-radius:18px; padding:14px; }
       .seta{ width:26px; height:26px; border-radius:999px; display:flex; alignItems:center; justifyContent:center; cursor:pointer; transition:.2s; background:#fff; }
       .tarefa{ background:#e9e2ff; border-radius:12px; padding:10px 12px; border-left:4px solid #1a125f; min-height:40px; }
        @media(max-width:900px){.wrap{ grid-template-columns:1fr; } }
      `}</style>

      <div className="wrap">
        <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>
          {/* REAGENDAMENTO RAPIDO */}
          <div className="reag">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div><b style={{fontSize:"13px"}}>Reagendamento Rápido</b><br/><small style={{fontSize:"10px"}}>{formatarDataBR(hoje)}</small></div>
              <div style={{display:"flex", gap:"6px"}}>
                <div className="seta" style={{background: hoverSeta==="prev"?"#1a125f":"#fff", color: hoverSeta==="prev"?"#fff":"#000"}} onMouseEnter={()=>setHoverSeta("prev")} onMouseLeave={()=>setHoverSeta(null)} onClick={()=>setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth()-1,1))}>‹</div>
                <div className="seta" style={{background: hoverSeta==="next"?"#1a125f":"#fff", color: hoverSeta==="next"?"#fff":"#000"}} onMouseEnter={()=>setHoverSeta("next")} onMouseLeave={()=>setHoverSeta(null)} onClick={()=>setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth()+1,1))}>›</div>
              </div>
            </div>

            <div style={{display:"flex", gap:"10px", marginTop:"12px", overflowX:"auto"}}>
              {[
                {nome:"Check-up do Vader", tipo:"Clínica Vet. Mascote"},
                {nome:"Exame da Coca-c...", tipo:"Clínica Vet. Mascote"},
              ].map((r,i)=>(
                <div key={i} style={{background:"#fff", borderRadius:"12px", padding:"10px", minWidth:"140px", flexShrink:0}}>
                  <small style={{fontSize:"10px", fontWeight:700}}>{r.nome}</small><br/>
                  <small style={{fontSize:"8px", color:"#888"}}>{r.tipo}</small>
                  <div style={{marginTop:"8px", display:"flex", flexDirection:"column", gap:"4px"}}>
                    <button style={{background:"#1a125f", color:"#fff", border:"none", borderRadius:"999px", padding:"5px 8px", fontSize:"8px"}}>Consultar Localização</button>
                    <button style={{background:"#ff4b7a", color:"#fff", border:"none", borderRadius:"999px", padding:"5px 8px", fontSize:"8px"}}>Remarcar evento</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CALENDARIO */}
          <div className="cal">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px"}}>
              <b style={{fontSize:"13px"}}>📅 {formatarDataBR(mesAtual).replace(/ de \d+/,"")}, {mesAtual.getFullYear()}</b>
              <div style={{display:"flex", gap:"6px"}}>
                <div className="seta" onClick={()=>setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth()-1,1))}>‹</div>
                <div className="seta" onClick={()=>setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth()+1,1))}>›</div>
              </div>
            </div>

            <div style={{display:"flex", gap:"6px", marginBottom:"6px"}}>
              {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d=><small key={d} style={{flex:1, textAlign:"center", fontSize:"9px", fontWeight:700}}>{d}</small>)}
            </div>

            <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px"}}>
              {Array.from({length:primeiroDia(mesAtual)===0?6:primeiroDia(mesAtual)-1}).map((_,i)=><div key={"v"+i}></div>)}
              {Array.from({length:diasNoMes(mesAtual)}).map((_,i)=>{
                const dia = i+1;
                const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
                const isHoje = toISO(data)===toISO(hoje);
                const isSel = toISO(data)===toISO(dataSel);
                return(
                  <div key={dia} onClick={()=>setDataSel(data)} style={{
                    height:"28px", borderRadius:"999px", display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"11px", cursor:"pointer",
                    background: isSel?"#1a125f": isHoje?"#fff":"transparent",
                    color: isSel?"#fff": isHoje?"#1a125f":"#000",
                    fontWeight: isHoje||isSel?700:400,
                    border: isHoje?"1px solid #1a125f":"none"
                  }}>{dia}</div>
                )
              })}
            </div>

            <div style={{display:"flex", gap:"6px", marginTop:"10px", justifyContent:"center"}}>
              <button onClick={()=>{setDataSel(new Date()); setMesAtual(new Date());}} style={{background:"#1a125f", color:"#fff", border:"none", borderRadius:"999px", padding:"6px 12px", fontSize:"9px"}}>Hoje</button>
              <button style={{background:"#fff", border:"none", borderRadius:"999px", padding:"6px 12px", fontSize:"9px"}}>Essa semana</button>
              <button style={{background:"#fff", border:"none", borderRadius:"999px", padding:"6px 12px", fontSize:"9px"}}>Próxima semana</button>
            </div>
          </div>
        </div>

        {/* TAREFAS DO DIA */}
        <div className="card" style={{minHeight:"600px"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px"}}>
            <div><b style={{fontSize:"13px"}}>Tarefas do dia</b><br/><small style={{fontSize:"10px", color:"#888"}}>{formatarDataBR(dataSel)}</small></div>
            <div onClick={()=>abrirPopup()} style={{width:"32px", height:"32px", background:"#1a125f", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer"}}>
              <img src="/maistarefas.png" alt="+" style={{width:"16px", height:"16px"}} onError={(e:any)=>{e.target.outerHTML='<span style="color:#fff;font-size:18px">+</span>'}} />
            </div>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
            {horarios.map(h=>{
              const tarefasHora = tarefasDoDia.filter(t=> t.hora===h || t.hora.startsWith(h.split(":")[0]+":"));
              return(
                <div key={h} style={{display:"flex", gap:"10px", alignItems:"flex-start"}}>
                  <div style={{width:"50px", flexShrink:0, paddingTop:"6px"}}>
                    <b style={{fontSize:"11px"}}>{h}</b><br/><small style={{fontSize:"8px", color:"#888"}}>{h}:00</small>
                  </div>
                  <div style={{flex:1, display:"flex", flexDirection:"column", gap:"6px"}}>
                    {tarefasHora.length===0? (
                      <div onClick={()=>abrirPopup(h)} style={{background:"#e9e2ff", borderRadius:"12px", height:"42px", cursor:"pointer", border:"1px dashed #cbb8ff", opacity:.6}}></div>
                    ) : tarefasHora.map(t=>(
                      <div key={t.id} className="tarefa">
                        <div style={{display:"flex", justifyContent:"space-between"}}>
                          <b style={{fontSize:"11px"}}>{t.pet||"Tarefa"}</b>
                          <small style={{fontSize:"9px", color:"#666", cursor:"pointer"}} onClick={()=>{ salvar(tarefas.filter(x=>x.id!==t.id)) }}>✕</small>
                        </div>
                        <small style={{fontSize:"10px"}}>{t.desc}</small><br/>
                        <small style={{fontSize:"8px", color:"#666"}}>{t.hora}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* POPUP */}
      {popup && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:"12px"}}>
          <div style={{background:"#fff", borderRadius:"20px", padding:"18px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px"}}>
              <b style={{fontSize:"14px"}}>Nova Tarefa</b>
              <span onClick={()=>setPopup(false)} style={{cursor:"pointer"}}>✕</span>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
              <div>
                <small style={{fontSize:"10px"}}>Data</small>
                <input type="date" value={form.data} onChange={e=>setForm({...form, data:e.target.value})} style={{width:"100%", padding:"10px", borderRadius:"10px", border:"1px solid #e9e2ff", fontSize:"12px"}} />
              </div>
              <div>
                <small style={{fontSize:"10px"}}>Hora</small>
                <input type="time" value={form.hora} onChange={e=>setForm({...form, hora:e.target.value})} style={{width:"100%", padding:"10px", borderRadius:"10px", border:"1px solid #e9e2ff", fontSize:"12px"}} />
              </div>
              <div>
                <small style={{fontSize:"10px"}}>Pet (opcional)</small>
                <input placeholder="Ex: Vader, Coca-Cola..." value={form.pet} onChange={e=>setForm({...form, pet:e.target.value})} style={{width:"100%", padding:"10px", borderRadius:"10px", border:"1px solid #e9e2ff", fontSize:"12px"}} />
              </div>
              <div>
                <small style={{fontSize:"10px"}}>Descrição *</small>
                <textarea placeholder="Ex: Consulta veterinária, vacina, banho..." value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})} style={{width:"100%", padding:"10px", borderRadius:"10px", border:"1px solid #e9e2ff", fontSize:"12px", minHeight:"70px"}} />
              </div>
              <div style={{display:"flex", gap:"8px", marginTop:"8px"}}>
                <button onClick={()=>setPopup(false)} style={{flex:1, padding:"10px", borderRadius:"999px", border:"1px solid #ece8f0", background:"#fff", fontSize:"12px"}}>Cancelar</button>
                <button onClick={adicionar} style={{flex:1, padding:"10px", borderRadius:"999px", border:"none", background:"#1a125f", color:"#fff", fontSize:"12px", fontWeight:700}}>Salvar Tarefa</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}