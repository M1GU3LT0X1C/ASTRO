"use client";
import { useState, useEffect } from "react";

type AlertType = { title:string, desc?:string, okText?:string, cancelText?:string, type?:"confirm"|"info", onOk?:()=>void }

let showFn: (a:AlertType)=>void;
export const showAlert = (a:AlertType)=> showFn?.(a);

export default function UiAlert(){
  const [open,setOpen]=useState(false);
  const [data,setData]=useState<AlertType>({title:""});

  useEffect(()=>{ showFn = (a)=>{ setData(a); setOpen(true); }; },[]);

  if(!open) return null;
  return(
    <div style={{position:"fixed", inset:0, zIndex:9999, background:"rgba(20,10,40,.45)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff", borderRadius:"20px", padding:"22px", width:"100%", maxWidth:"360px", boxShadow:"0 20px 40px rgba(0,0,0,.2)", textAlign:"center"}}>
        <div style={{width:"48px", height:"48px", borderRadius:"999px", background: data.type==="confirm"?"#ffe1ea":"#eee8ff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:"22px"}}>{data.type==="confirm"?"🎁":"✨"}</div>
        <h3 style={{fontSize:"16px", fontWeight:800, color:"#201a4a", margin:"0 0 6px"}}>{data.title}</h3>
        {data.desc && <p style={{fontSize:"13px", color:"#666", margin:"0 0 18px", lineHeight:"18px"}}>{data.desc}</p>}
        <div style={{display:"flex", gap:"10px"}}>
          {data.type==="confirm" && <button onClick={()=>setOpen(false)} style={{flex:1, padding:"12px", borderRadius:"999px", border:"1.5px solid #e8e0ff", background:"#fff", fontWeight:700, cursor:"pointer"}}>{data.cancelText||"Cancelar"}</button>}
          <button onClick={()=>{ setOpen(false); data.onOk?.(); }} style={{flex:1, padding:"12px", borderRadius:"999px", border:"none", background:"#ff4b7a", color:"#fff", fontWeight:800, cursor:"pointer"}}>{data.okText||"OK"}</button>
        </div>
      </div>
    </div>
  )
}