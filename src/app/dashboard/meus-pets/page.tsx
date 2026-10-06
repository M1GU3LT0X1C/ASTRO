"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { listarAnimaisDoUsuario, type AnimalTela } from "@/lib/animais";
import styles from "./MeusPets.module.css";

type Pet = AnimalTela;

const FILTROS = [
  "Pequeno","Fêmea","Cachorro","Castrado(a)","Vacinado(a)","Vermifugado(a)",
  "Grande","Médio","Macho","Gato","Cuidados Especiais"
];

function ConteudoMeusPets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<string[]>([]);
  const [ordenar, setOrdenar] = useState("recentes");
  const [menuOrdenar, setMenuOrdenar] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(()=>{
    const q = searchParams.get("busca") || localStorage.getItem("astro_busca") || "";
    setBusca(q);
  },[searchParams]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setPets(await listarAnimaisDoUsuario(user));
      setLoading(false);
    }
    load();
  }, []);

  const addFiltro = (f: string) => setFiltros(p => p.includes(f)? p : [...p, f]);
  const removeFiltro = (f: string) => setFiltros(p => p.filter(x=>x!==f));

  let filtrados = pets.filter(p => {
    if (busca &&!p.nome.toLowerCase().includes(busca.toLowerCase()) &&!p.especie.toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtros.includes("Pequeno") && p.porte!== "pequeno") return false;
    if (filtros.includes("Médio") && p.porte!== "medio") return false;
    if (filtros.includes("Grande") && p.porte!== "grande") return false;
    if (filtros.includes("Fêmea") && p.sexo!== "femea") return false;
    if (filtros.includes("Macho") && p.sexo!== "macho") return false;
    if (filtros.includes("Cachorro") && p.especie!== "cachorro") return false;
    if (filtros.includes("Gato") && p.especie!== "gato") return false;
    if (filtros.includes("Castrado(a)") &&!p.castrado) return false;
    if (filtros.includes("Vacinado(a)") &&!p.vacinado) return false;
    if (filtros.includes("Vermifugado(a)") &&!p.vermifugado) return false;
    if (filtros.includes("Cuidados Especiais") &&!p.cuidados_especiais) return false;
    return true;
  });

  if (ordenar === "nome") filtrados = [...filtrados].sort((a,b)=>a.nome.localeCompare(b.nome));
  if (ordenar === "idade") filtrados = [...filtrados].sort((a,b)=>a.idade-b.idade);

  if (loading) return <div style={{padding:24}}>Carregando...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        {busca && (
          <div style={{fontSize:13, color:"#555"}}>
            Buscando por: <b>"{busca}"</b> <button onClick={()=>{setBusca(""); localStorage.removeItem("astro_busca");}} style={{marginLeft:8, background:"none", border:"none", color:"#e63d68", cursor:"pointer"}}>✕ limpar</button>
          </div>
        )}
        <div style={{marginLeft:"auto"}} className={styles.ordenarWrap}>
          <button className={styles.ordenarBtn} onClick={()=>setMenuOrdenar(!menuOrdenar)}>
            {ordenar === "recentes"? "Ordenar" : ordenar === "nome"? "Nome A-Z" : "Idade"} <span>▼</span>
          </button>
          {menuOrdenar && (
            <div className={styles.dropdown}>
              <button className={ordenar==="recentes"?styles.ativo:""} onClick={()=>{setOrdenar("recentes"); setMenuOrdenar(false);}}>Recentes</button>
              <button className={ordenar==="nome"?styles.ativo:""} onClick={()=>{setOrdenar("nome"); setMenuOrdenar(false);}}>Nome A-Z</button>
              <button className={ordenar==="idade"?styles.ativo:""} onClick={()=>{setOrdenar("idade"); setMenuOrdenar(false);}}>Idade</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.filtroBox}>
        <div className={styles.filtroHeader}>
          <button className={`${styles.btnFiltro} ${mostrarFiltros?styles.btnFiltroAtivo:""}`} onClick={()=>setMostrarFiltros(!mostrarFiltros)}>
            <img src="/filtro.png" alt="filtro" className={styles.iconeFiltro}/> Filtro
          </button>
          <button className={styles.btnLimpar} onClick={()=>{setFiltros([]); setBusca(""); localStorage.removeItem("astro_busca");}}>Limpar Filtro</button>
        </div>
        {mostrarFiltros && (
          <div className={styles.chipsArea}>
            {FILTROS.map(f=> filtros.includes(f)? (
              <div key={f} className={styles.chipActive}>
                <span>{f}</span>
                <button className={styles.bolinhaX} onClick={()=>removeFiltro(f)}>✕</button>
              </div>
            ):(
              <button key={f} onClick={()=>addFiltro(f)} className={styles.chip}>{f}</button>
            ))}
          </div>
        )}
      </div>

      {filtrados.length===0? (
        <div className={styles.vazioBox}><p>Nenhum pet com esses filtros.<br/>Tenta limpar o filtro ou cadastrar em Novo Pet.</p></div>
      ):(
        <div className={styles.grid}>
          {filtrados.map(pet=>(
            <div key={pet.id} className={styles.card}>
              <div className={styles.menu}>⋮</div>
              <img src={pet.foto_url || "/logo-gato.png"} alt={pet.nome} className={styles.foto}/>
              <h3>{pet.nome}</h3>
              <p>{pet.sexo==="femea"?"Fêmea":"Macho"} - {pet.idade} anos</p>
              <small className={styles.fav}>Clique para ver detalhes</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MeusPetsPage(){
  return <Suspense fallback={<div style={{padding:24}}>Carregando pets...</div>}><ConteudoMeusPets/></Suspense>;
}