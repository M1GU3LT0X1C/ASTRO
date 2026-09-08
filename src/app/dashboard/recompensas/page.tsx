"use client";
import { useState, useEffect } from "react";

export default function RecompensasPage(){
  const [pontos,setPontos]=useState(1548);
  const [checks,setChecks]=useState<{[k:string]:boolean}>({Seg:true});
  const dias = ["Seg","Ter","Qua","Qui","Sex"];

  useEffect(()=>{
    const salvo = localStorage.getItem("astro_checks");
    if(salvo) setChecks(JSON.parse(salvo));
    const pts = localStorage.getItem("astro_pontos");
    if(pts) setPontos(Number(pts));
  },[]);

  const fazerCheck = (dia:string)=>{
    if(checks[dia]) return;
    const novo = {...checks, [dia]:true};
    setChecks(novo);
    const novoPts = pontos+10;
    setPontos(novoPts);
    localStorage.setItem("astro_checks", JSON.stringify(novo));
    localStorage.setItem("astro_pontos", String(novoPts));
  };

  const fazerTarefa = (pts:number)=>{
    const novo = pontos+pts;
    setPontos(novo);
    localStorage.setItem("astro_pontos", String(novo));
    alert(`+${pts} pontos!`);
  };

  return(
    <div style={{display:"flex", justifyContent:"center", padding:"10px", background:"#f6f4ff", minHeight:"100vh"}}>
      <style>{`
      .wrap{ background:#fff; border-radius:18px; border:1px solid #eee; padding:16px; width:100%; max-width:900px; display:flex; flex-direction:column; gap:20px; }
      .top{ display:flex; flex-direction:column; gap:20px; }
      .checkRow{ display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; }
      .checkRow::-webkit-scrollbar{ display:none; }
      .tarefas{ display:flex; flex-direction:column; gap:10px; }
      .cuponsArea{ display:flex; flex-direction:column; gap:12px; }
      .cupom{ background:#201a4a; color:#fff; border-radius:16px; padding:14px; text-align:center; flex:1; min-width:140px; }
      .cupom b{ font-size:16px; display:block; }
      .btnCupom{ background:#ff4b7a; border:none; color:#fff; padding:6px 16px; border-radius:999px; font-weight:700; font-size:12px; cursor:pointer; margin-top:8px; width:100%; }
        @media(min-width:768px){
        .wrap{ padding:24px; }
        .top{ flex-direction:row; gap:24px; }
        .cuponsArea{ min-width:340px; flex-direction:row; }
        .btnCupom{ width:auto; }
        }
      `}</style>

      <div className="wrap">
        <div className="top">
          {/* ESQUERDA */}
          <div style={{flex:1, minWidth:0}}>
            <h2 style={{fontSize:"28px", fontWeight:900, margin:0}}>{pontos.toLocaleString("pt-BR")}</h2>
            <small style={{color:"#888", fontSize:"12px"}}>pontos acumulados<br/>os pontos vencem em 60 dias</small>

            <h4 style={{marginTop:"20px", marginBottom:"10px", fontSize:"14px"}}>Check-in Diário</h4>
            <div className="checkRow">
              {dias.map(d=>{
                const feito =!!checks[d];
                return(
                  <button key={d} onClick={()=>fazerCheck(d)} style={{
                    minWidth:"52px", height:"58px", borderRadius:"12px", border: feito? "none":"1px solid #e5e5e5",
                    background: feito? "#ff4b7a" : "#fff",
                    color: feito? "#fff" : "#201a4a",
                    fontWeight:700, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"6px", flexShrink:0
                  }}>
                    <span style={{fontSize:"11px"}}>{d}</span>
                    {feito? <span style={{background:"#fff", color:"#ff4b7a", borderRadius:"6px", width:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:900}}>✓</span> : <span style={{fontSize:"11px", fontWeight:800}}>+10</span>}
                  </button>
                )
              })}
            </div>

            <div className="tarefas" style={{marginTop:"20px"}}>
              <button onClick={()=>fazerTarefa(50)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", border:"1.5px solid #e5e5e5", borderRadius:"999px", padding:"10px 14px", background:"#fff", cursor:"pointer", fontSize:"12px", textAlign:"left"}}>
                <span>Avaliar estágio de cuidado</span> <span style={{background:"#ff4b7a", color:"#fff", padding:"4px 10px", borderRadius:"999px", fontSize:"11px", fontWeight:700, whiteSpace:"nowrap", marginLeft:"8px"}}>+50 pontos</span>
              </button>
              <button onClick={()=>fazerTarefa(100)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", border:"1.5px solid #e5e5e5", borderRadius:"999px", padding:"10px 14px", background:"#fff", cursor:"pointer", fontSize:"12px", textAlign:"left"}}>
                <span>Atualizar carteira de vacinação</span> <span style={{background:"#ff4b7a", color:"#fff", padding:"4px 10px", borderRadius:"999px", fontSize:"11px", fontWeight:700, whiteSpace:"nowrap", marginLeft:"8px"}}>+100 pontos</span>
              </button>
              <button onClick={()=>fazerTarefa(150)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", border:"1.5px solid #e5e5e5", borderRadius:"999px", padding:"10px 14px", background:"#fff", cursor:"pointer", fontSize:"12px", textAlign:"left"}}>
                <span>Consulta em clínica parceira</span> <span style={{background:"#ff4b7a", color:"#fff", padding:"4px 10px", borderRadius:"999px", fontSize:"11px", fontWeight:700, whiteSpace:"nowrap", marginLeft:"8px"}}>+150 pontos</span>
              </button>
              <button onClick={()=>fazerTarefa(500)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", border:"1.5px solid #e5e5e5", borderRadius:"999px", padding:"10px 14px", background:"#fff", cursor:"pointer", fontSize:"12px", textAlign:"left"}}>
                <span>Adotar pet com o Astro</span> <span style={{background:"#ff4b7a", color:"#fff", padding:"4px 10px", borderRadius:"999px", fontSize:"11px", fontWeight:700, whiteSpace:"nowrap", marginLeft:"8px"}}>+500 pontos</span>
              </button>
            </div>
          </div>

          {/* DIREITA - CUPONS */}
          <div style={{width:"100%"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px"}}>
              <b style={{fontSize:"13px", color:"#201a4a"}}>Recompensas Ativas ▾</b><small style={{fontSize:"10px", color:"#888"}}>Semanalmente</small>
            </div>
            <div className="cuponsArea">
              <div className="cupom">
                <b>25% OFF</b><small style={{opacity:.8, fontSize:"11px"}}>em banho e tosa</small><br/>
                <button className="btnCupom" onClick={()=>alert("Cupom: BANHO25 copiado!")}>Usar cupom</button>
              </div>
              <div className="cupom">
                <b>25% OFF</b><small style={{opacity:.8, fontSize:"11px"}}>em banho e tosa</small><br/>
                <button className="btnCupom" onClick={()=>alert("Cupom: BANHO25 copiado!")}>Usar cupom</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}