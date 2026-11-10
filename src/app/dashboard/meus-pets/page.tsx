"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { alerta } from "@/lib/alerta";
import { STATUS_PET, alterarStatusAnimal, excluirAnimal, listarMeusAnimais, type AnimalTela } from "@/lib/animais";
import styles from "./MeusPets.module.css";

type Pet = AnimalTela;

const FILTROS = [
  "Pequeno","Fêmea","Cachorro","Castrado(a)","Vacinado(a)","Vermifugado(a)",
  "Grande","Médio","Macho","Gato","Cuidados Especiais"
];

const itemMenu: React.CSSProperties = {
  display:"block", width:"100%", padding:"10px 14px", border:"none", background:"#fff", textAlign:"left",
  fontSize:"12px", fontWeight:700, color:"#201a4a", cursor:"pointer", textDecoration:"none",
};

function ConteudoMeusPets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<string[]>([]);
  const [ordenar, setOrdenar] = useState("recentes");
  const [menuOrdenar, setMenuOrdenar] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [loading, setLoading] = useState(true);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const searchParams = useSearchParams();

  async function mudarStatus(pet: Pet, status: "disponivel" | "reservado" | "em_tratamento" | "adotado") {
    setMenuAberto(null);
    try {
      const atualizado = await alterarStatusAnimal(pet.id, status);
      setPets(lista => lista.map(p => p.id === pet.id ? { ...p, status: atualizado.status } : p));
    } catch (e) {
      alerta.erro("Não foi possível alterar o status", e instanceof Error ? e.message : undefined);
    }
  }

  async function excluir(pet: Pet) {
    setMenuAberto(null);
    const confirmou = await alerta.confirmar({
      title: `Excluir ${pet.nome}?`,
      text: "O pet sai da vitrine e as solicitações de adoção dele também são apagadas. Essa ação não pode ser desfeita.",
      confirmText: "Excluir", icon: "warning",
    });
    if (!confirmou) return;
    try {
      await excluirAnimal(pet.id);
      setPets(lista => lista.filter(p => p.id !== pet.id));
    } catch (e) {
      alerta.erro("Não foi possível excluir", e instanceof Error ? e.message : undefined);
    }
  }

  useEffect(()=>{
    const q = searchParams.get("busca") || localStorage.getItem("astro_busca") || "";
    setBusca(q);
  },[searchParams]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setPets(await listarMeusAnimais());
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
              <button type="button" className={styles.menu} aria-label={`Opções de ${pet.nome}`} aria-expanded={menuAberto===pet.id}
                onClick={()=>setMenuAberto(menuAberto===pet.id?null:pet.id)} style={{border:"none", background:"transparent", cursor:"pointer"}}>⋮</button>
              {menuAberto===pet.id && (
                <div role="menu" style={{position:"absolute", top:"34px", right:"10px", zIndex:10, background:"#fff", border:"1.4px solid #201a4a", borderRadius:"12px", overflow:"hidden", minWidth:"170px", boxShadow:"0 10px 24px rgba(32,26,74,.15)", textAlign:"left"}}>
                  <Link role="menuitem" href={`/dashboard/novo?id=${pet.id}`} style={itemMenu}>Editar</Link>
                  {(["disponivel","reservado","em_tratamento","adotado"] as const).filter(st=>st!==pet.status).map(st=>(
                    <button role="menuitem" key={st} type="button" style={itemMenu} onClick={()=>mudarStatus(pet, st)}>Marcar como {STATUS_PET[st].toLowerCase()}</button>
                  ))}
                  <button role="menuitem" type="button" style={{...itemMenu, color:"#e63d68"}} onClick={()=>excluir(pet)}>Excluir</button>
                </div>
              )}
              <img src={pet.foto_url || "/logo-gato.png"} alt={pet.nome} className={styles.foto}/>
              <h3>{pet.nome}</h3>
              <p>{pet.sexo==="femea"?"Fêmea":"Macho"} - {pet.idade} anos</p>
              <small style={{fontSize:"10px", fontWeight:800, color: pet.status==="disponivel" ? "#1ba97c" : pet.status==="adotado" ? "#e63d68" : "#8a5a00"}}>{STATUS_PET[pet.status] || pet.status}</small>
              <Link href={`/adocao-clinicas/pet/${pet.id}`} className={styles.fav}>Clique para ver detalhes</Link>
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