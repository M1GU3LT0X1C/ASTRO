"use client";
import { useState, useEffect } from "react";

export default function RecompensasPage(){
  const dias = ["Seg","Ter","Qua","Qui","Sex"];
  const diasMap: any = {0:-1,1:0,2:1,3:2,4:3,5:4,6:-1};
  const [pontos,setPontos]=useState(0);
  const [checks,setChecks]=useState<{[k:string]:boolean}>({});
  const [tarefas,setTarefas]=useState<{[k:string]:boolean}>({});
  const [mostra,setMostra]=useState(true);
  const [hojeIdx,setHojeIdx]=useState(-1);
  const [semanaId,setSemanaId]=useState("");
  const [modal,setModal]=useState<any>({open:false});

  const alertBonito = (d:any)=> setModal({open:true,...d});
  const showAlert = (title:string, desc?:string)=> alertBonito({title, desc, type:"info", okText:"OK"});

  const getSemanaId = ()=>{
    const now=new Date(); const onejan=new Date(now.getFullYear(),0,1);
    const week=Math.ceil((((now as any)-(onejan as any))/86400000+onejan.getDay()+1)/7);
    return `${now.getFullYear()}-${week}`;
  };

  useEffect(()=>{
    const now=new Date(); setHojeIdx(diasMap[now.getDay()]);
    const sid=getSemanaId(); setSemanaId(sid);
    const sidSalvo=localStorage.getItem("astro_semana");
    if(sidSalvo!==sid){ localStorage.setItem("astro_semana",sid); localStorage.setItem("astro_checks",JSON.stringify({})); setChecks({}); }
    else{ const s=localStorage.getItem("astro_checks"); if(s) setChecks(JSON.parse(s)); }
    const pts=localStorage.getItem("astro_pontos"); setPontos(pts?Number(pts):0);
    const t=localStorage.getItem("astro_tarefas"); if(t) setTarefas(JSON.parse(t));
  },[]);

  const savePontos = (n:number)=>{ setPontos(n); localStorage.setItem("astro_pontos",String(n)); };

  const fazerCheck = (idx:number)=>{
    if(idx!==hojeIdx) return showAlert("Ops!", "Só pode fazer o check-in de hoje!");
    const dia=dias[idx]; if(checks[dia]) return;
    const novo={...checks,[dia]:true}; setChecks(novo);
    localStorage.setItem("astro_checks",JSON.stringify(novo)); savePontos(pontos+10);
    showAlert("+10 pontos! 🎉", "Check-in de hoje feito!");
  };

  const fazerTarefa = (id:string,pts:number,nome:string)=>{
    if(tarefas[id]) return;
    alertBonito({
      title:`Confirmar: ${nome}?`,
      desc:`Você vai ganhar +${pts} pontos. Só confirme se realmente fez!`,
      type:"confirm",
      okText:`Ganhar +${pts}`,
      cancelText:"Ainda não",
      onOk:()=>{
        const novo={...tarefas,[id]:true}; setTarefas(novo);
        localStorage.setItem("astro_tarefas",JSON.stringify(novo)); savePontos(pontos+pts);
        alertBonito({title:`+${pts} pontos! 🎉`, desc:"Missão concluída!"});
      }
    })
  };

  const usarCupom = (custo:number)=>{
    if(pontos < custo) return showAlert("Pontos insuficientes", `Você tem ${pontos} pts e precisa de ${custo} pts. Continue fazendo check-ins!`);
    alertBonito({
      title:"Usar cupom?",
      desc:`Usar 25% OFF em banho e tosa por ${custo} pontos?`,
      type:"confirm",
      okText:"Usar agora",
      cancelText:"Cancelar",
      onOk:()=>{
        savePontos(pontos - custo);
        alertBonito({title:"Cupom liberado! 🎉", desc:"Código: BANHO25 - copie e use no checkout!"});
      }
    })
  };

  const isPerdido = (idx:number)=> idx < hojeIdx &&!checks[dias[idx]];

  return(
    <div style={{display:"flex", justifyContent:"center", padding:"12px", background:"#f6f4ff", minHeight:"100vh"}}>
      <style>{`
  .card{ background:#fff; border-radius:20px; border:1px solid #ece8f0; width:100%; max-width:980px; padding:16px; }
  .grid{ display:flex; flex-direction:column; gap:20px; }
  .checkRow{ display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scroll-snap-type:x mandatory; }
  .checkRow::-webkit-scrollbar{ height:4px; }.checkRow::-webkit-scrollbar-thumb{ background:#ff4b7a; border-radius:999px; }
  .tarefaBtn{ display:flex; justify-content:space-between; align-items:center; border:1.4px solid #e8e0ff; border-radius:999px; padding:10px 14px; background:#fff; cursor:pointer; width:100%; font-size:13px; }
  .tarefaBtn:disabled{ opacity:.45; cursor:not-allowed; }
  .pill{ background:#ff4b7a; color:#fff; padding:5px 12px; border-radius:999px; font-size:11px; font-weight:800; white-space:nowrap; margin-left:10px; }
  .pill.ok{ background:#d8d0ff; color:#201a4a; }
  .cupom{ background:#201a4a; color:#fff; border-radius:16px; padding:16px; text-align:center; }
  .cupom.bloq{ opacity:.4; }
  .btnCupom{ background:#ff4b7a; border:none; color:#fff; padding:7px 18px; border-radius:999px; font-weight:800; font-size:12px; cursor:pointer; margin-top:10px; width:100%; }
  .btnCupom:disabled{ background:#ccc; }
      @media(min-width:900px){.card{ padding:24px 26px; }.grid{ display:grid; grid-template-columns:1fr 300px; gap:32px; }.btnCupom{ width:auto; }.checkRow{ overflow:visible; } }
      `}</style>

      <div className="card">
        <div className="grid">
          <div>
            <h2 style={{fontSize:"32px", fontWeight:900, margin:0}}>{pontos}</h2>
            <small style={{color:"#8a8a9a", fontSize:"12px"}}>pontos acumulados<br/>os pontos vencem em 60 dias</small>
            <h4 style={{fontSize:"14px", fontWeight:800, margin:"18px 0 10px"}}>Check-in Diário - Semana {semanaId}</h4>
            <div className="checkRow">
              {dias.map((d,idx)=>{
                const feito=!!checks[d]; const perdido=isPerdido(idx); const isHoje=idx===hojeIdx;
                return(
                  <button key={d} onClick={()=>fazerCheck(idx)} disabled={!isHoje || feito} style={{
                    minWidth:"60px", height:"64px", borderRadius:"12px", border: feito? "none": perdido? "1.5px dashed #ccc" : "1.5px solid #e9e2ff",
                    background: feito? "#ff4b7a" : perdido? "#f5f5f5" : "#fff", color: feito? "#fff" : perdido? "#aaa" : "#201a4a",
                    fontWeight:800, cursor: isHoje &&!feito? "pointer":"not-allowed", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"6px", opacity:!isHoje &&!feito?.6:1, scrollSnapAlign:"start"
                  }}>
                    <span style={{fontSize:"12px"}}>{d}</span>
                    {feito? <span style={{background:"#fff", color:"#ff4b7a", borderRadius:"6px", width:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px"}}>✓</span> : perdido? <span style={{fontSize:"9px"}}>perdeu</span> : <span style={{fontSize:"11px"}}>+10</span>}
                  </button>
                )
              })}
            </div>
            <small style={{fontSize:"10px", color:"#aaa"}}>{hojeIdx>=0? `Hoje é ${dias[hojeIdx]} - só hoje libera +10` : "Check-in só Seg a Sex"}</small>

            <div style={{display:"flex", flexDirection:"column", gap:"10px", marginTop:"20px"}}>
              <button className="tarefaBtn" onClick={()=>fazerTarefa("avaliar",50,"Avaliar estágio de cuidado")} disabled={!!tarefas["avaliar"]}>Avaliar estágio de cuidado <span className={`pill ${tarefas["avaliar"]?"ok":""}`}>{tarefas["avaliar"]?"✓ feito":"+50 pontos"}</span></button>
              <button className="tarefaBtn" onClick={()=>fazerTarefa("vacina",100,"Atualizar carteira de vacinação")} disabled={!!tarefas["vacina"]}>Atualizar carteira de vacinação <span className={`pill ${tarefas["vacina"]?"ok":""}`}>{tarefas["vacina"]?"✓ feito":"+100 pontos"}</span></button>
              <button className="tarefaBtn" onClick={()=>fazerTarefa("consulta",150,"Consulta em clínica parceira")} disabled={!!tarefas["consulta"]}>Consulta em clínica parceira <span className={`pill ${tarefas["consulta"]?"ok":""}`}>{tarefas["consulta"]?"✓ feito":"+150 pontos"}</span></button>
              <button className="tarefaBtn" onClick={()=>fazerTarefa("adotar",500,"Adotar pet com o Astro")} disabled={!!tarefas["adotar"]}>Adotar pet com o Astro <span className={`pill ${tarefas["adotar"]?"ok":""}`}>{tarefas["adotar"]?"✓ feito":"+500 pontos"}</span></button>
            </div>
          </div>

          <div>
            <div onClick={()=>setMostra(!mostra)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px", cursor:"pointer"}}>
              <b style={{fontSize:"13px"}}>Recompensas Ativas {mostra?"▾":"▸"}</b><small style={{fontSize:"11px", color:"#888"}}>Semanalmente</small>
            </div>
            {mostra && (
              <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>
                <div className={`cupom ${pontos<200?"bloq":""}`}>
                  <div style={{fontWeight:900, fontSize:"17px"}}>25% OFF</div><div style={{fontSize:"12px", opacity:.8}}>em banho e tosa</div><div style={{fontSize:"10px", marginTop:"4px", opacity:.7}}>custa 200 pts</div>
                  <button className="btnCupom" onClick={()=>usarCupom(200)} disabled={pontos<200}>{pontos<200? `Falta ${200-pontos} pts` : "Usar cupom"}</button>
                </div>
                <div className={`cupom ${pontos<200?"bloq":""}`}>
                  <div style={{fontWeight:900, fontSize:"17px"}}>25% OFF</div><div style={{fontSize:"12px", opacity:.8}}>em banho e tosa</div><div style={{fontSize:"10px", marginTop:"4px", opacity:.7}}>custa 200 pts</div>
                  <button className="btnCupom" onClick={()=>usarCupom(200)} disabled={pontos<200}>{pontos<200? `Falta ${200-pontos} pts` : "Usar cupom"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL BONITO LOCAL */}
      {modal.open && (
        <div style={{position:"fixed", inset:0, zIndex:9999, background:"rgba(20,10,40,.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", backdropFilter:"blur(6px)"}}>
          <div style={{background:"#fff", borderRadius:"20px", padding:"22px", width:"100%", maxWidth:"360px", textAlign:"center"}}>
            <div style={{width:"52px", height:"52px", borderRadius:"999px", background:modal.type==="confirm"?"#ffe1ea":"#efe8ff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:"24px"}}>{modal.type==="confirm"?"🎁":"✨"}</div>
            <h3 style={{fontSize:"16px", fontWeight:900, color:"#201a4a", margin:"0 0 6px"}}>{modal.title}</h3>
            {modal.desc && <p style={{fontSize:"13px", color:"#666", margin:"0 0 18px"}}>{modal.desc}</p>}
            <div style={{display:"flex", gap:"10px"}}>
              {modal.type==="confirm" && <button onClick={()=>setModal({open:false})} style={{flex:1, padding:"12px", borderRadius:"999px", border:"1.5px solid #e8e0ff", background:"#fff", fontWeight:700, cursor:"pointer"}}>{modal.cancelText||"Cancelar"}</button>}
              <button onClick={()=>{ const ok=modal.onOk; setModal({open:false}); ok?.(); }} style={{flex:1, padding:"12px", borderRadius:"999px", border:"none", background:"#ff4b7a", color:"#fff", fontWeight:800, cursor:"pointer"}}>{modal.okText||"OK"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}