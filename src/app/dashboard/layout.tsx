"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import styles from "./dashboard.module.css";

// MODAL BONITO GLOBAL
function AstroModal({ open, title, desc, type, onClose, onOk, okText, cancelText }: any){
  if(!open) return null;
  return(
    <div style={{position:"fixed", inset:0, zIndex:99999, background:"rgba(20,10,40,.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff", borderRadius:"20px", padding:"22px", width:"100%", maxWidth:"360px", boxShadow:"0 20px 40px rgba(0,0,0,.25)", textAlign:"center", animation:"pop.2s ease"}}>
        <div style={{width:"52px", height:"52px", borderRadius:"999px", background:type==="confirm"?"#ffe1ea":"#efe8ff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:"24px"}}>{type==="confirm"?"🎁":"✨"}</div>
        <h3 style={{fontSize:"16px", fontWeight:900, color:"#201a4a", margin:"0 0 6px"}}>{title}</h3>
        {desc && <p style={{fontSize:"13px", color:"#666", margin:"0 0 18px", lineHeight:"18px"}}>{desc}</p>}
        <div style={{display:"flex", gap:"10px"}}>
          {type==="confirm" && <button onClick={onClose} style={{flex:1, padding:"12px", borderRadius:"999px", border:"1.5px solid #e8e0ff", background:"#fff", fontWeight:700, cursor:"pointer"}}>{cancelText||"Cancelar"}</button>}
          <button onClick={()=>{ onOk?.(); onClose(); }} style={{flex:1, padding:"12px", borderRadius:"999px", border:"none", background:"#ff4b7a", color:"#fff", fontWeight:800, cursor:"pointer"}}>{okText||"OK"}</button>
        </div>
      </div>
      <style>{`@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [nomeOng, setNomeOng] = useState("AstroTeste");
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState<any>({open:false});
  const router = useRouter();

  useEffect(() => {
    const salvo = localStorage.getItem("ong_nome");
    if (salvo) setNomeOng(salvo);
    // deixa global pra usar em qualquer página
    (window as any).showAstroAlert = (data:any) => setModal({open:true,...data});
  }, []);

  const fazerBusca = () => {
    if (!busca.trim()) return;
    localStorage.setItem("astro_busca", busca);
    router.push(`/dashboard/meus-pets?busca=${encodeURIComponent(busca)}`);
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.main}>
        <div className={styles.painel}>
          <header className={styles.topbar}>
            <div className={styles.busca}>
              <img src="/lupa.svg" alt="buscar" className={styles.lupaIcone} onClick={fazerBusca} />
              <input
                placeholder="Procure pets..."
                value={busca}
                onChange={(e)=>setBusca(e.target.value)}
                onKeyDown={(e)=> e.key === "Enter" && fazerBusca()}
              />
            </div>
            <div className={styles.direita}>
              <div className={styles.bolinha}></div>
              <strong className={styles.nomeTopo}>{nomeOng}</strong>
            </div>
          </header>
          <div className={styles.conteudo}>{children}</div>
        </div>
      </div>
      <AstroModal
        open={modal.open}
        title={modal.title}
        desc={modal.desc}
        type={modal.type}
        okText={modal.okText}
        cancelText={modal.cancelText}
        onOk={modal.onOk}
        onClose={()=>setModal({open:false})}
      />
    </div>
  );
}