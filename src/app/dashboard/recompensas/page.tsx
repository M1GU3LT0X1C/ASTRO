"use client";
import { useState, useEffect } from "react";
import { alerta } from "@/lib/alerta";
import { buscarRecompensas, concluirTarefa, fazerCheckin, resgatarCupom, type Cupom, type EstadoRecompensas } from "@/lib/painel";

export default function RecompensasPage(){
  const dias = ["Seg","Ter","Qua","Qui","Sex"];
  const diasMap: Record<number, number> = {0:-1,1:0,2:1,3:2,4:3,5:4,6:-1};
  const [estado,setEstado]=useState<EstadoRecompensas|null>(null);
  const [mostra,setMostra]=useState(true);
  const [hojeIdx,setHojeIdx]=useState(-1);
  const [semanaId,setSemanaId]=useState("");

  const getSemanaId = ()=>{
    const now=new Date(); const onejan=new Date(now.getFullYear(),0,1);
    const week=Math.ceil(((now.getTime()-onejan.getTime())/86400000+onejan.getDay()+1)/7);
    return `${now.getFullYear()}-${week}`;
  };

  useEffect(()=>{
    setHojeIdx(diasMap[new Date().getDay()]);
    setSemanaId(getSemanaId());
    buscarRecompensas().then(setEstado).catch(()=>alerta.erro("Não foi possível carregar seus pontos"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const pontos = estado?.pontos ?? 0;
  const tarefas: Record<string, boolean> = Object.fromEntries((estado?.tarefas ?? []).map(t=>[t,true]));
  // check-ins da semana (datas yyyy-mm-dd) -> dia da semana exibido
  const checks: Record<string, boolean> = Object.fromEntries((estado?.checkinsSemana ?? []).map(data=>{
    const idx = diasMap[new Date(data+"T12:00:00").getDay()];
    return [dias[idx] ?? data, true];
  }));

  const fazerCheck = async (idx:number)=>{
    if(idx!==hojeIdx) return alerta.aviso("Ops!", "Só pode fazer o check-in de hoje!");
    if(checks[dias[idx]]) return;
    try{
      setEstado(await fazerCheckin());
      alerta.sucesso("+10 pontos! 🎉", "Check-in de hoje feito!");
    }catch{ alerta.erro("Não foi possível fazer o check-in"); }
  };

  const fazerTarefa = async (id:string,pts:number,nome:string)=>{
    if(tarefas[id]) return;
    const confirmou = await alerta.confirmar({
      title:`Confirmar: ${nome}?`,
      text:`Você vai ganhar +${pts} pontos. Só confirme se realmente fez!`,
      confirmText:`Ganhar +${pts}`,
      cancelText:"Ainda não",
    });
    if(!confirmou) return;
    try{
      setEstado(await concluirTarefa(id));
      alerta.sucesso(`+${pts} pontos! 🎉`, "Missão concluída!");
    }catch{ alerta.erro("Não foi possível registrar a missão"); }
  };

  const usarCupom = async (cupom:Cupom)=>{
    if(pontos < cupom.custo) return alerta.aviso("Pontos insuficientes", `Você tem ${pontos} pts e precisa de ${cupom.custo} pts. Continue fazendo check-ins!`);
    const confirmou = await alerta.confirmar({
      title:"Usar cupom?",
      text:`Usar ${cupom.titulo} ${cupom.descricao||""} por ${cupom.custo} pontos?`,
      confirmText:"Usar agora",
      cancelText:"Cancelar",
    });
    if(!confirmou) return;
    try{
      const resgate = await resgatarCupom(cupom.id);
      setEstado(await buscarRecompensas());
      alerta.sucesso("Cupom liberado! 🎉", `Código: ${resgate.codigo} - copie e use no checkout!`);
    }catch(e){ alerta.erro("Não foi possível usar o cupom", e instanceof Error ? e.message : undefined); }
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
                {(estado?.cupons ?? []).length===0 && <small style={{fontSize:"11px", color:"#888"}}>Nenhum cupom disponível no momento.</small>}
                {(estado?.cupons ?? []).map(cupom=>(
                  <div key={cupom.id} className={`cupom ${pontos<cupom.custo?"bloq":""}`}>
                    <div style={{fontWeight:900, fontSize:"17px"}}>{cupom.titulo}</div><div style={{fontSize:"12px", opacity:.8}}>{cupom.descricao}</div><div style={{fontSize:"10px", marginTop:"4px", opacity:.7}}>custa {cupom.custo} pts</div>
                    <button className="btnCupom" onClick={()=>usarCupom(cupom)} disabled={pontos<cupom.custo}>{pontos<cupom.custo? `Falta ${cupom.custo-pontos} pts` : "Usar cupom"}</button>
                  </div>
                ))}
                {(estado?.resgates ?? []).length>0 && <small style={{fontSize:"11px", color:"#555"}}>Seus cupons: {(estado?.resgates ?? []).map(r=>`${r.titulo} (${r.codigo})`).join(", ")}</small>}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}