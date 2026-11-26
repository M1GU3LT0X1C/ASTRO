"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { alerta } from "@/lib/alerta";
import { STATUS_PET, alterarStatusAnimal, excluirAnimal, listarMeusAnimais, type AnimalTela } from "@/lib/animais";
import styles from "./MeusPets.module.css";

type Pet = AnimalTela;

const FILTROS = [
  "Pequeno","Fêmea","Canino","Castrado(a)","Vacinado(a)","Vermifugado(a)",
  "Grande","Médio","Macho","Felino","Cuidados Especiais"
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
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erroPets, setErroPets] = useState(false);
  const [tentativa, setTentativa] = useState(0);
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
    queueMicrotask(() => setBusca(q));
  },[searchParams]);

  useEffect(() => {
    let ativo = true;
    async function load() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw new Error("Sessão indisponível");
        const lista = await listarMeusAnimais();
        if (ativo) setPets(lista);
      } catch (error) {
        console.error("Falha ao carregar pets da ONG", error);
        if (ativo) setErroPets(true);
      } finally {
        if (ativo) setLoading(false);
      }
    }
    void load();
    return () => { ativo = false; };
  }, [tentativa]);

  const addFiltro = (f: string) => setFiltros(p => p.includes(f)? p : [...p, f]);
  const removeFiltro = (f: string) => setFiltros(p => p.filter(x=>x!==f));

  let filtrados = pets.filter(p => {
    if (busca &&!p.nome.toLowerCase().includes(busca.toLowerCase()) &&!p.especie.toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtros.includes("Pequeno") && p.porte!== "pequeno") return false;
    if (filtros.includes("Médio") && p.porte!== "medio") return false;
    if (filtros.includes("Grande") && p.porte!== "grande") return false;
    if (filtros.includes("Fêmea") && p.sexo!== "femea") return false;
    if (filtros.includes("Macho") && p.sexo!== "macho") return false;
    if (filtros.includes("Canino") && p.especie!== "cachorro") return false;
    if (filtros.includes("Felino") && p.especie!== "gato") return false;
    if (filtros.includes("Castrado(a)") &&!p.castrado) return false;
    if (filtros.includes("Vacinado(a)") &&!p.vacinado) return false;
    if (filtros.includes("Vermifugado(a)") &&!p.vermifugado) return false;
    if (filtros.includes("Cuidados Especiais") &&!p.cuidados_especiais) return false;
    return true;
  });

  if (ordenar === "nome") filtrados = [...filtrados].sort((a,b)=>a.nome.localeCompare(b.nome));
  if (ordenar === "idade") filtrados = [...filtrados].sort((a,b)=>a.idade-b.idade);

  if (loading) return <div className={styles.vazioBox} role="status">Carregando seus Astros...</div>;
  if (erroPets) return <div className={styles.vazioBox} role="alert"><strong>Não foi possível carregar seus Astros.</strong><p>Tente novamente em instantes.</p><button type="button" className={styles.btnFiltro} onClick={() => { setErroPets(false); setLoading(true); setTentativa(n => n + 1); }}>Tentar novamente</button></div>;

  return (
    <div className={styles.container}>
      {busca && (
        <div className={styles.buscaAtiva}>
          Buscando por: <b>&quot;{busca}&quot;</b>{" "}
          <button
            type="button"
            onClick={() => {
              setBusca("");
              localStorage.removeItem("astro_busca");
            }}
            className={styles.btnLimparBusca}
          >
            ✕ limpar
          </button>
        </div>
      )}

      <div className={styles.barraControles}>
        <div className={styles.esquerdaControles}>
          <button
            type="button"
            className={styles.btnFiltro}
            onClick={() => setMostrarFiltros((v) => !v)}
            aria-expanded={mostrarFiltros}
          >
            <SlidersHorizontal size={16} />
            <span>Filtro {filtros.length > 0 ? `(${filtros.length})` : ""}</span>
          </button>

          <button
            type="button"
            className={styles.btnLimpar}
            onClick={() => {
              setFiltros([]);
              setBusca("");
              localStorage.removeItem("astro_busca");
            }}
            disabled={filtros.length === 0 && !busca}
          >
            Limpar Filtro
          </button>
        </div>

        <div className={styles.ordenarWrap}>
          <select
            className={styles.ordenarSelect}
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value)}
            aria-label="Ordenar pets"
          >
            <option value="recentes">Ordenar</option>
            <option value="nome">Nome A-Z</option>
            <option value="idade">Idade</option>
          </select>
          <ChevronDown size={16} className={styles.ordenarIcone} />
        </div>
      </div>

      {!mostrarFiltros && filtros.length > 0 && (
        <div className={styles.tagsSelecionadasBar} aria-label="Filtros ativos">
          {filtros.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => removeFiltro(f)}
              className={styles.chipActive}
              aria-label={`Remover filtro ${f}`}
            >
              <span>{f}</span>
              <span className={styles.bolinhaX} aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      {mostrarFiltros && (
        <div className={styles.filtroBox} role="group" aria-label="Filtros de pets">
          <div className={styles.chipsArea}>
            {FILTROS.map((f) => {
              const ativo = filtros.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => (ativo ? removeFiltro(f) : addFiltro(f))}
                  className={ativo ? styles.chipActive : styles.chip}
                  aria-pressed={ativo}
                >
                  <span>{f}</span>
                  {ativo && <span className={styles.bolinhaX} aria-hidden="true">×</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
              <p>{pet.sexo==="femea"?"Fêmea":"Macho"} - {pet.idade_texto || "Idade não informada"}</p>
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