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
  };

  return(
    <div style={{display:"flex", justifyContent:"center", padding:"12px", background:"#f6f4ff", minHeight:"100vh"}}>
      <style>{`
     .card{ background:#fff; border-radius:20px; border:1px solid #ece8f0; width:100%; max-width:980px; padding:18px; }
     .grid{ display:flex; flex-direction:column; gap:20px; }
     .checkRow{ display:flex; gap:8px; overflow-x:auto; padding-bottom:2px; }
     .checkRow::-webkit-scrollbar{ display:none; }
     .tarefaBtn{ display:flex; justify-content:space-between; align-items:center; border:1.4px solid #e8e0ff; border-radius:999px; padding:10px 14px; background:#fff; cursor:pointer; width:100%; font-size:13px; text-align:left; }
     .pill{ background:#ff4b7a; color:#fff; padding:5px 12px; border-radius:999px; font-size:11px; font-weight:800; white-space:nowrap; margin-left:10px; }
     .cupom{ background:#201a4a; color:#fff; border-radius:16px; padding:16px; text-align:center; }
     .btnCupom{ background:#ff4b7a; border:none; color:#fff; padding:7px 18px; border-radius:999px; font-weight:800; font-size:12px; cursor:pointer; margin-top:10px; width:100%; }

      /* DESKTOP FIXO */
      @media(min-width:900px){
       .card{ padding:24px 26px; }
       .grid{ display:grid; grid-template-columns:1fr 300px; gap:32px; align-items:start; }
       .btnCupom{ width:auto; }
      }
      `}</style>

      <div className="card">
        <div className="grid">
          {/* ESQUERDA */}
          <div>
            <div style={{marginBottom:"18px"}}>
              <h2 style={{fontSize:"32px", fontWeight:900, margin:0, color:"#111"}}>{pontos.toLocaleString("pt-BR")}</h2>
              <small style={{color:"#8a8a9a", fontSize:"12px", lineHeight:"14px", display:"block", marginTop:"4px"}}>pontos acumulados<br/>os pontos vencem em 60 dias</small>
            </div>

            <h4 style={{fontSize:"14px", fontWeight:800, marginBottom:"10px"}}>Check-in Diário</h4>
            <div className="checkRow">
              {dias.map(d=>{
                const feito =!!checks[d];
                return(
                  <button key={d} onClick={()=>fazerCheck(d)} style={{
                    minWidth:"56px", height:"62px", borderRadius:"12px", border: feito? "none":"1.5px solid #e9e2ff",
                    background: feito? "#ff4b7a" : "#fff", color: feito? "#fff" : "#201a4a",
                    fontWeight:800, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"6px", flexShrink:0
                  }}>
                    <span style={{fontSize:"12px"}}>{d}</span>
                    {feito? <span style={{background:"#fff", color:"#ff4b7a", borderRadius:"6px", width:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px"}}>✓</span> : <span style={{fontSize:"11px"}}>+10</span>}
                  </button>
                )
              })}
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:"10px", marginTop:"22px"}}>
              <button className="tarefaBtn" onClick={()=>fazerTarefa(50)}>Avaliar estágio de cuidado <span className="pill">+50 pontos</span></button>
              <button className="tarefaBtn" onClick={()=>fazerTarefa(100)}>Atualizar carteira de vacinação <span className="pill">+100 pontos</span></button>
              <button className="tarefaBtn" onClick={()=>fazerTarefa(150)}>Consulta em clínica parceira <span className="pill">+150 pontos</span></button>
              <button className="tarefaBtn" onClick={()=>fazerTarefa(500)}>Adotar pet com o Astro <span className="pill">+500 pontos</span></button>
            </div>
          </div>

          {/* DIREITA - CUPONS */}
          <div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px"}}>
              <b style={{fontSize:"13px", color:"#111"}}>Recompensas Ativas ▾</b>
              <small style={{fontSize:"11px", color:"#888"}}>Semanalmente</small>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>
              <div className="cupom">
                <div style={{fontWeight:900, fontSize:"17px"}}>25% OFF</div>
                <div style={{fontSize:"12px", opacity:.8, marginTop:"2px"}}>em banho e tosa</div>
                <button className="btnCupom" onClick={()=>alert("Cupom de teste - ainda não existe")}>Usar cupom</button>
              </div>
              <div className="cupom">
                <div style={{fontWeight:900, fontSize:"17px"}}>25% OFF</div>
                <div style={{fontSize:"12px", opacity:.8, marginTop:"2px"}}>em banho e tosa</div>
                <button className="btnCupom" onClick={()=>alert("Cupom de teste - ainda não existe")}>Usar cupom</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}