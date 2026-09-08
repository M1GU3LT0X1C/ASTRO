"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MeusPetsPage(){
  const [animais, setAnimais] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("");
  const searchParams = useSearchParams();

  useEffect(()=>{
    const q = searchParams.get("busca") || localStorage.getItem("astro_busca") || "";
    setFiltro(q);
    const escutar = () => setFiltro(localStorage.getItem("astro_busca")||"");
    window.addEventListener("astro-busca", escutar);
    return ()=> window.removeEventListener("astro-busca", escutar);
  },[searchParams]);

  useEffect(()=>{
    async function load(){
      const { data: {user} } = await supabase.auth.getUser();
      if(!user) return;
      const { data: ong } = await supabase.from("ongs").select("id").eq("usuario_id", user.id).maybeSingle();
      if(!ong) return;
      const { data } = await supabase.from("animais").select("*").eq("ong_id", ong.id).order("created_at", {ascending:false});
      setAnimais(data||[]);
    }
    load();
  },[]);

  const filtrados = animais.filter(p => 
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.especie?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <h2 style={{fontWeight:800, marginBottom:12}}>Meus Pets {filtro && ` - buscando: "${filtro}"`}</h2>
      {filtrados.length===0? <p>Nenhum pet encontrado.</p> :
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))", gap:12}}>
          {filtrados.map(pet=>(
            <div key={pet.id} style={{background:"#fff", border:"1px solid #eee", borderRadius:18, padding:14, textAlign:"center"}}>
              <img src={pet.foto_url || "/logo-gato.png"} style={{width:80, height:80, borderRadius:"50%", objectFit:"cover", margin:"0 auto"}}/>
              <h4>{pet.nome}</h4>
              <small>{pet.especie}</small>
            </div>
          ))}
        </div>
      }
    </div>
  );
}