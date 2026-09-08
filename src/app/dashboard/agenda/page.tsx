"use client";
import { useState, useEffect } from "react";

type Tarefa = { id:string, data:string, hora:string, desc:string, pet?:string };
type Modo = "hoje"|"essa"|"proxima";

export default function AgendaPage(){
  const [hoje] = useState(new Date());
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dataSel, setDataSel] = useState(new Date());
  const [modo, setModo] = useState<Modo>("hoje");
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [popup, setPopup] = useState(false);
  const [form, setForm] = useState({data:"", hora:"08:30", desc:"", pet:""});

  useEffect(()=>{
    setTarefas(JSON.parse(localStorage.getItem("tarefas-agenda")||"[]"));
    setForm(f=>({...f, data: new Date().toISOString().split("T")[0]}));
  },[]);

  const salvar = (n:Tarefa[])=>{ setTarefas(n); localStorage.setItem("tarefas-agenda", JSON.stringify(n)); };
  const toISO = (d:Date)=> d.toISOString().split("T")[0];
  const fmtBR = (d:Date)=> d.toLocaleDateString("pt-BR",{day:"numeric", month:"long", year:"numeric"});
  const inicioSemana = (d:Date)=>{ const dia=d.getDay(); const diff=d.getDate()-(dia===0?6:dia-1); return new Date(d.getFullYear(), d.getMonth(), diff); };
  const fimSemana = (d:Date)=>{ const i=inicioSemana(d); return new Date(i.getFullYear(), i.getMonth(), i.getDate()+6); };
  const estaNaSemana = (dataISO:string, ref:Date)=>{
    const dt=new Date(dataISO+"T00:00:00");
    const ini=inicioSemana(ref); ini.setHours(0,0,0,0);
    const fim=fimSemana(ref); fim.setHours(23,59,59,999);
    return dt>=ini && dt<=fim;
  };
  const diasNoMes = (d:Date)=> new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  const primeiroDia = (d:Date)=>{ const v=new Date(d.getFullYear(), d.getMonth(), 1).getDay(); return v===0?6:v-1; };

  let tarefasVisiveis = tarefas.filter(t=>{
    if(modo==="hoje") return t.data===toISO(dataSel);
    if(modo==="essa") return estaNaSemana(t.data, hoje);
    const prox = new Date(hoje); prox.setDate(prox.getDate()+7);
    return estaNaSemana(t.data, prox);
  }).sort((a,b)=> (a.data+a.hora).localeCompare(b.data+b.hora));

  const Seta = ({dir, onClick}:{dir:"left"|"right", onClick:()=>void})=>(
    <div className="seta" onClick={onClick}>
      <img src="/seta.png" alt={dir} style={{width:"10px", height:"10px", display:"block", objectFit:"contain", transform: dir==="left"? "rotate(90deg)" : "rotate(-90deg)", transformOrigin:"center center"}} />
    </div>
  );

  const proxSemanaRef = new Date(hoje); proxSemanaRef.setDate(hoje.getDate()+7);

  return(
    <div style={{background:"#f6f4ff", minHeight:"100vh", padding:"10px", display:"flex", justifyContent:"center"}}>
      <style>{`
.wrap{ width:100%; max-width:1200px; display:flex; gap:14px; }
.left{ width:340px; display:flex; flex-direction:column; gap:14px; flex-shrink:0; }
.right{ flex:1; background:#fff; border-radius:18px; border:1px solid #ece8f0; padding:16px; min-height:600px; min-width:0; }
.reag{ background:#e9e2ff; border-radius:18px; padding:14px; }
.cal{ background:#ffd6e2; border-radius:18px; padding:14px; }
.seta{ width:28px; height:28px; min-width:28px; min-height:28px; border-radius:50%; background:#fff; border:1px solid #f0e8ff; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; }
.seta:hover{ background:#d5c8ff; border-color:#1a125f; }
.chip{ border:none; border-radius:999px; padding:7px 14px; font-size:9px; cursor:pointer; transition:.2s; }
.taskInside{ background:#e9e2ff; border-radius:12px; border-left:5px solid #1a125f; min-height:48px; display:flex; align-items:center; justify-content:space-between; padding:8px 10px 8px 12px; gap:8px; }
.xbtn{ width:22px; height:22px; min-width:22px; min-height:22px; border-radius:50%; background:#fff; border:1px solid #e0d4ff; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; flex-shrink:0; }
.xbtn:hover{ background:#d5c8ff; border-color:#1a125f; color:#1a125f; }
@media(max-width:900px){.wrap{ flex-direction:column; }.left{ width:100%; } }
      `}</style>

      <div className="wrap">
        <div className="left">
          <div className="reag">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div><b style={{fontSize:"13px"}}>Reagendamento Rápido</b><br/><small style={{fontSize:"10px"}}>{fmtBR(hoje)}</small></div>
              <div style={{display:"flex", gap:"6px"}}>
                <Seta dir="left" onClick={()=>setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth()-1,1))} />
                <Seta dir="right" onClick={()=>setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth()+1,1))} />
              </div>
            </div>
          </div>

          <div className="cal">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px"}}>
              <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                <img src="/agendapets.png" alt="" style={{width:"18px", height:"18px"}} />
                <b style={{fontSize:"12px"}}>{mesAtual.toLocaleDateString("pt-BR",{month:"long", year:"numeric"})}</b>
              </div>
              <div style={{display:"flex", gap:"6px"}}>
                <Seta dir="left" onClick={()=>setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth()-1,1))} />
                <Seta dir="right" onClick={()=>setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth()+1,1))} />
              </div>
            </div>

            <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px"}}>
              {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d=><small key={d} style={{textAlign:"center", fontSize:"9px", fontWeight:700}}>{d}</small>)}
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px", marginTop:"6px"}}>
              {Array.from({length:primeiroDia(mesAtual)}).map((_,i)=><div key={"e"+i}></div>)}
              {Array.from({length:diasNoMes(mesAtual)}).map((_,i)=>{
                const dia=i+1;
                const dt=new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
                const iso=toISO(dt);
                const isHoje=iso===toISO(hoje);
                const isSel=iso===toISO(dataSel) && modo==="hoje";
                const isEssaSemana = modo==="essa" && estaNaSemana(iso, hoje);
                const isProxSemana = modo==="proxima" && estaNaSemana(iso, proxSemanaRef);
                let bg="transparent", color="#000", border="none", fw=400;
                if(isSel){ bg="#1a125f"; color="#fff"; fw=700; }
                else if(isEssaSemana || isProxSemana){ bg="#fff"; color="#1a125f"; border="1px solid #1a125f"; fw=700; }
                else if(isHoje){ border="1.5px solid #1a125f"; color="#1a125f"; fw=700; }
                return(
                  <div key={dia} onClick={()=>{setDataSel(dt); setModo("hoje");}} style={{height:"30px", borderRadius:"999px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", cursor:"pointer", background:bg, color, fontWeight:fw, border}}>{dia}</div>
                )
              })}
            </div>

            <div style={{display:"flex", gap:"6px", marginTop:"12px", justifyContent:"center"}}>
              <button className="chip" onClick={()=>{const h=new Date(); setDataSel(h); setMesAtual(h); setModo("hoje");}} style={{background: modo==="hoje"?"#1a125f":"#fff", color: modo==="hoje"?"#fff":"#000"}}>Hoje</button>
              <button className="chip" onClick={()=>{setModo("essa"); setDataSel(inicioSemana(hoje)); setMesAtual(hoje);}} style={{background: modo==="essa"?"#1a125f":"#fff", color: modo==="essa"?"#fff":"#000"}}>Essa semana</button>
              <button className="chip" onClick={()=>{const p=new Date(); p.setDate(hoje.getDate()+7); setModo("proxima"); setDataSel(inicioSemana(p)); setMesAtual(p);}} style={{background: modo==="proxima"?"#1a125f":"#fff", color: modo==="proxima"?"#fff":"#000"}}>Próxima semana</button>
            </div>
          </div>
        </div>

        <div className="right">
          <div style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px"}}>
            <b style={{fontSize:"14px"}}>Tarefas do dia</b>
            <div onClick={()=>{setForm({data:toISO(dataSel), hora:"08:30", desc:"", pet:""}); setPopup(true);}} style={{width:"20px", height:"20px", borderRadius:"50%", border:"1.5px solid #000", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", background:"#fff"}}>
              <img src="/maistarefas.png" alt="+" style={{width:"12px", height:"12px", display:"block"}} />
            </div>
          </div>
          <small style={{fontSize:"10px", color:"#888", display:"block", marginBottom:"16px"}}>{modo==="hoje"? fmtBR(dataSel) : modo==="essa"? `${fmtBR(inicioSemana(hoje))} - ${fmtBR(fimSemana(hoje))}` : `${fmtBR(inicioSemana(proxSemanaRef))} - ${fmtBR(fimSemana(proxSemanaRef))}`}</small>

          {tarefasVisiveis.length===0? (
            <div style={{height:"400px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#aaa"}}>
              <small style={{fontSize:"11px"}}>Nenhuma tarefa {modo==="hoje"?"para esse dia":"nessa semana"}</small>
            </div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
              {tarefasVisiveis.map(t=>(
                <div key={t.id} style={{display:"flex", gap:"10px", alignItems:"center"}}>
                  <div style={{width:"44px", flexShrink:0}}>
                    <b style={{fontSize:"11px"}}>{t.hora}</b><br/>
                    <small style={{fontSize:"8px", color:"#888"}}>{new Date(t.data+"T00:00:00").toLocaleDateString("pt-BR",{day:"2-digit", month:"short"})}</small>
                  </div>
                  <div className="taskInside" style={{flex:1}}>
                    <div style={{flex:1, minWidth:0}}>
                      <b style={{fontSize:"11px"}}>{t.pet||"Tarefa"}</b>
                      <span style={{fontSize:"10px", marginLeft:"6px"}}>{t.desc}</span>
                      <small style={{fontSize:"8px", color:"#666", display:"block"}}>{t.hora} • Consulta</small>
                    </div>
                    <div className="xbtn" onClick={()=>salvar(tarefas.filter(x=>x.id!==t.id))}>
                      <span style={{fontSize:"10px", fontWeight:700, lineHeight:1}}>✕</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {popup && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:"12px"}}>
          <div style={{background:"#fff", borderRadius:"20px", padding:"18px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}><b>Nova Tarefa</b><span onClick={()=>setPopup(false)} style={{cursor:"pointer"}}>✕</span></div>
            <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
              <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} style={{padding:"10px", borderRadius:"10px", border:"1px solid #e9e2ff"}} />
              <input type="time" value={form.hora} onChange={e=>setForm({...form,hora:e.target.value})} style={{padding:"10px", borderRadius:"10px", border:"1px solid #e9e2ff"}} />
              <input placeholder="Pet" value={form.pet} onChange={e=>setForm({...form,pet:e.target.value})} style={{padding:"10px", borderRadius:"10px", border:"1px solid #e9e2ff"}} />
              <textarea placeholder="Descrição..." value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} style={{padding:"10px", borderRadius:"10px", border:"1px solid #e9e2ff", minHeight:"70px"}} />
              <div style={{display:"flex", gap:"8px"}}>
                <button onClick={()=>setPopup(false)} style={{flex:1, padding:"10px", borderRadius:"999px", border:"1px solid #eee", background:"#fff"}}>Cancelar</button>
                <button onClick={()=>{ if(!form.desc.trim()) return; salvar([...tarefas,{id:Date.now().toString(),...form}]); setPopup(false); }} style={{flex:1, padding:"10px", borderRadius:"999px", border:"none", background:"#1a125f", color:"#fff", fontWeight:700}}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}