"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CONVIVENCIAS, atualizarAnimal, buscarAnimal, cadastrarAnimal } from "@/lib/animais";
import { alerta } from "@/lib/alerta";

function SelectBonito({ id, label, value, onChange, options, openId, setOpenId }: any){
  const open = openId===id;
  const selected = options.find((o:any)=>o.value===value)?.label || "";
  const hasValue =!!value;
  return(
    <div style={{
      display:"flex",justifyContent:"space-between",alignItems:"center",height:"44px",
      position:"relative",fontSize:"13px",color:"#201a4a",fontWeight:500,
      background: open || hasValue? "#f6f4ff" : "transparent",
      margin:"0 -20px", padding:"0 20px",
      borderRadius:"8px", transition:".2s"
    }}>
      <span style={{fontWeight: hasValue? 700 : 500}}>{label}</span>
      <div style={{position:"relative"}}>
        <button onClick={()=>setOpenId(open? null : id)} style={{
          border:"none", background: hasValue? "#201a4a" : "transparent",
          color: hasValue? "#fff" : "#201a4a", display:"flex",alignItems:"center",gap:"8px",
          cursor:"pointer", fontSize:"13px",fontWeight:700,
          padding: hasValue? "6px 14px" : "6px 0", borderRadius:"999px"
        }}>
          {selected || <span style={{opacity:.5,fontWeight:500}}>Selecionar</span>}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{transform:open?"rotate(180deg)":"rotate(0)",transition:".2s"}}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {open && (
          <div style={{position:"absolute",right:0,top:"36px",background:"#fff",border:"1.6px solid #201a4a",borderRadius:"14px",overflow:"hidden",minWidth:"140px",zIndex:20,boxShadow:"0 12px 24px rgba(32,26,74,.18)"}}>
            {options.map((opt:any)=>{
              const isSel = value===opt.value;
              return(
                <div key={opt.value}
                  onClick={()=>{ if(isSel){ onChange(""); } else { onChange(opt.value); } setOpenId(null); }}
                  style={{padding:"11px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",background: isSel? "#ece8ff" : "#fff",fontWeight: isSel? 800 : 500,fontSize:"13px", color:"#201a4a"}}>
                  {opt.label} {isSel && <span>✓</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function FormularioPet({ id }: { id: string | null }){
  const [preview,setPreview]=useState(""); const [file,setFile]=useState<File|null>(null);
  const [nome,setNome]=useState(""); const [idade,setIdade]=useState(""); const [tipo,setTipo]=useState("");
  const [porte,setPorte]=useState(""); const [sexo,setSexo]=useState(""); const [especie,setEspecie]=useState("");
  const [openSelect,setOpenSelect]=useState<string|null>(null);
  const [checks,setChecks]=useState({castrado:false,vacinado:false,vermifugado:false,cuidados:false});
  const [temps,setTemps]=useState<string[]>([]); const [loading,setLoading]=useState(false);
  const [convivencia,setConvivencia]=useState<string[]>([]); const [historia,setHistoria]=useState("");
  // edicao: /dashboard/novo?id=<pet>
  const [editId,setEditId]=useState<string|null>(null); const [fotoAtual,setFotoAtual]=useState("");

  useEffect(()=>{
    if(!id) return;
    buscarAnimal(id).then(pet=>{
      setEditId(id);
      setNome(pet.nome); setIdade(pet.idade?String(pet.idade):""); setTipo(pet.raca);
      setPorte(pet.porte); setSexo(pet.sexo); setEspecie(pet.especie);
      setChecks({castrado:pet.castrado,vacinado:pet.vacinado,vermifugado:pet.vermifugado,cuidados:pet.cuidados_especiais});
      setTemps(pet.temperamentos); setConvivencia(pet.convivencia); setHistoria(pet.historia);
      setFotoAtual(pet.foto_url); setPreview(pet.foto_url);
    }).catch(()=>alerta.erro("Não foi possível carregar o pet para edição"));
  },[id]);

  const alternarConvivencia=(id:string)=>setConvivencia(atual=>{
    if(atual.includes(id)) return atual.filter(x=>x!==id);
    // "unico pet da casa" nao combina com "se da bem com outros"
    if(id==="unico") return ["unico"];
    return [...atual.filter(x=>x!=="unico"), id];
  });

  // VALIDAÇÕES
  const onNome = (v:string)=> setNome(v.replace(/[0-9]/g,"")); // não deixa número
  const onTipo = (v:string)=> setTipo(v.replace(/[0-9]/g,"")); // não deixa número
  const onIdade = (v:string)=> setIdade(v.replace(/[^0-9]/g,"")); // só número

  const publicar=async()=>{
    if(!nome.trim()) return alerta.aviso("Nome obrigatório", "Informe o nome do pet (sem números).");
    if(!/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) return alerta.aviso("Nome inválido", "O nome do pet não pode ter números.");
    if(!/^[A-Za-zÀ-ÿ\s]+$/.test(tipo) && tipo) return alerta.aviso("Tipo inválido", "O tipo de pet não pode ter números.");
    if(!idade) return alerta.aviso("Idade obrigatória", "Informe a idade do pet.");
    setLoading(true);
    try{
      let foto_url=fotoAtual;
      if(file){
        const nomeArquivo = `${Date.now()}-${file.name.replace(/\s/g,"-")}`;
        const { error:upErr } = await supabase.storage.from("animais-fotos").upload(nomeArquivo, file);
        if(upErr) throw new Error("Erro upload: "+upErr.message);
        foto_url = supabase.storage.from("animais-fotos").getPublicUrl(nomeArquivo).data.publicUrl;
      }
      const dados = {
        nome: nome.trim(), idade: String(Number(idade)||0), raca: tipo.trim(),
        porte: porte||"medio", sexo: sexo||"macho", especie: especie||"cachorro",
        castrado: checks.castrado, vacinado: checks.vacinado,
        vermifugado: checks.vermifugado, cuidados: checks.cuidados,
        temperamentos: temps, fotoUrl: foto_url, convivencia, historia
      };
      if(editId){
        await atualizarAnimal(editId, dados);
        await alerta.sucesso("Pet atualizado!", "As alterações já aparecem em Meus Pets.");
      }else{
        await cadastrarAnimal(dados);
        await alerta.sucesso("Pet publicado!", "Ele já aparece em Meus Pets.");
      }
      location.href="/dashboard/meus-pets";
    }catch(e:any){ alerta.erro("Não foi possível publicar", e.message); }
    setLoading(false);
  };

  return(
    <div style={{display:"flex",justifyContent:"center",padding:"12px",background:"#f6f4ff",minHeight:"100vh"}} onClick={()=>setOpenSelect(null)}>
      <style>{`
     .cardNovo{ background:#fff; border-radius:22px; padding:20px; display:flex; width:100%; max-width:900px; border:1px solid #ece8f8; flex-direction:column; }
     .linhaNovo{ display:flex; gap:20px; flex-direction:column; width:100%; }
     .gridTemps{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px 12px; width:100%; max-width:340px; align-self:center; margin-top:12px; }
     .gridTemps > :last-child{ grid-column:2; } /* 3x3x3x1 - último no meio */
       @media(min-width:768px){
       .cardNovo{ padding:36px; }
       .linhaNovo{ flex-direction:row; gap:44px; }
       .gridTemps{ max-width:360px; }
       }
      `}</style>
      <div className="cardNovo" onClick={e=>e.stopPropagation()}>
        <div className="linhaNovo">
          <div style={{width:"100%",maxWidth:"160px",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px", margin:"0 auto"}}>
            <label style={{width:"128px",height:"128px",border:"1.8px solid #201a4a",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",background:"#fff"}}>
              {preview? <img src={preview} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <img src="/camera-grande.png" style={{width:"56px",height:"56px",objectFit:"contain"}} alt=""/>}
              <input type="file" hidden accept="image/*" onChange={e=>{const f=e.target.files?.[0]; if(f){setFile(f); setPreview(URL.createObjectURL(f))}}}/>
            </label>
            <span style={{fontSize:"13px",fontWeight:800,color:"#201a4a"}}>Adicionar foto</span>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:"16px", minWidth:0}}>
            <div style={{display:"flex",gap:"12px",flexDirection:"column"}} className="top2">
              <style>{`@media(min-width:500px){.top2{flex-direction:row!important}}`}</style>
              <input style={{flex:1,height:"38px",border:"1.6px solid #201a4a",borderRadius:"999px",padding:"0 18px",outline:"none"}} placeholder="Nome do Pet" value={nome} onChange={e=>onNome(e.target.value)}/>
              <input style={{flex:1,height:"38px",border:"1.6px solid #201a4a",borderRadius:"999px",padding:"0 18px",outline:"none"}} placeholder="Idade" inputMode="numeric" value={idade} onChange={e=>onIdade(e.target.value)}/>
            </div>
            <input style={{height:"38px",border:"1.6px solid #201a4a",borderRadius:"999px",padding:"0 18px",outline:"none",width:"100%"}} placeholder="Tipo de pet" value={tipo} onChange={e=>onTipo(e.target.value)}/>
            <div style={{border:"1.6px solid #201a4a",borderRadius:"16px",padding:"2px 20px",background:"#fff",display:"flex",flexDirection:"column"}}>
              <div style={{borderBottom:"1px solid #f1edff"}}><SelectBonito id="porte" label="Porte" value={porte} onChange={setPorte} openId={openSelect} setOpenId={setOpenSelect} options={[{value:"pequeno",label:"Pequeno"},{value:"medio",label:"Médio"},{value:"grande",label:"Grande"}]}/></div>
              <div style={{borderBottom:"1px solid #f1edff"}}><SelectBonito id="sexo" label="Sexo" value={sexo} onChange={setSexo} openId={openSelect} setOpenId={setOpenSelect} options={[{value:"macho",label:"Macho"},{value:"femea",label:"Fêmea"}]}/></div>
              <div><SelectBonito id="especie" label="Espécie" value={especie} onChange={setEspecie} openId={openSelect} setOpenId={setOpenSelect} options={[{value:"cachorro",label:"Cachorro"},{value:"gato",label:"Gato"}]}/></div>
            </div>
            <div style={{border:"1.6px solid #201a4a",borderRadius:"16px",padding:"2px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",height:"44px",alignItems:"center",borderBottom:"1px solid #f1edff",fontSize:"13px",color:"#201a4a"}}>Castrado<button onClick={()=>setChecks({...checks,castrado:!checks.castrado})} style={{width:"34px",height:"18px",background:checks.castrado?"#201a4a":"#ddd",borderRadius:"999px",border:"none",position:"relative",cursor:"pointer"}}><i style={{position:"absolute",top:"2px",left:checks.castrado?"18px":"2px",width:"14px",height:"14px",background:"#fff",borderRadius:"50%",transition:".2s"}}/></button></div>
              <div style={{display:"flex",justifyContent:"space-between",height:"44px",alignItems:"center",borderBottom:"1px solid #f1edff",fontSize:"13px",color:"#201a4a"}}>Vacinado<button onClick={()=>setChecks({...checks,vacinado:!checks.vacinado})} style={{width:"34px",height:"18px",background:checks.vacinado?"#201a4a":"#ddd",borderRadius:"999px",border:"none",position:"relative",cursor:"pointer"}}><i style={{position:"absolute",top:"2px",left:checks.vacinado?"18px":"2px",width:"14px",height:"14px",background:"#fff",borderRadius:"50%",transition:".2s"}}/></button></div>
              <div style={{display:"flex",justifyContent:"space-between",height:"44px",alignItems:"center",borderBottom:"1px solid #f1edff",fontSize:"13px",color:"#201a4a"}}>Vermifugado<button onClick={()=>setChecks({...checks,vermifugado:!checks.vermifugado})} style={{width:"34px",height:"18px",background:checks.vermifugado?"#201a4a":"#ddd",borderRadius:"999px",border:"none",position:"relative",cursor:"pointer"}}><i style={{position:"absolute",top:"2px",left:checks.vermifugado?"18px":"2px",width:"14px",height:"14px",background:"#fff",borderRadius:"50%",transition:".2s"}}/></button></div>
              <div style={{display:"flex",justifyContent:"space-between",height:"44px",alignItems:"center",fontSize:"13px",color:"#201a4a"}}>Cuidados especiais<button onClick={()=>setChecks({...checks,cuidados:!checks.cuidados})} style={{width:"34px",height:"18px",background:checks.cuidados?"#201a4a":"#ddd",borderRadius:"999px",border:"none",position:"relative",cursor:"pointer"}}><i style={{position:"absolute",top:"2px",left:checks.cuidados?"18px":"2px",width:"14px",height:"14px",background:"#fff",borderRadius:"50%",transition:".2s"}}/></button></div>
            </div>

            <div className="gridTemps">
              {[["energetico","raio","Energético"],["timido","timido","Tímido"],["preguicoso","preguicoso","Preguiçoso"],["medroso","medroso","Medroso"],["sociavel","sociavel","Sociável"],["afetivo","afetivo","Afetivo"],["apegado","apegado","Apegado"],["curioso","curioso","Curioso"],["protetor","protetor","Protetor"],["independente","independente","Independente"]].map(([id,file,label])=>(
                <button key={id} onClick={()=>setTemps(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])} style={{background:"transparent",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",cursor:"pointer"}}>
                  <div style={{width:"52px",height:"52px",borderRadius:"50%",border:"1.6px solid #201a4a",display:"flex",alignItems:"center",justifyContent:"center",background:temps.includes(id)?"#201a4a":"#fff",transition:".2s"}}><img src={`/${file}.png`} style={{width:"30px",height:"30px",objectFit:"contain",filter:temps.includes(id)?"brightness(0) invert(1)":"none"}} alt=""/></div>
                  <small style={{fontSize:"10px",fontWeight:600,color:"#201a4a", textAlign:"center"}}>{label}</small>
                </button>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"8px"}}>
              <span style={{fontSize:"13px",fontWeight:800,color:"#201a4a"}}>Convivência</span>
              <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
                {Object.entries(CONVIVENCIAS).map(([id,label])=>(
                  <button key={id} type="button" onClick={()=>alternarConvivencia(id)} aria-pressed={convivencia.includes(id)} style={{border:"1.6px solid #201a4a",borderRadius:"999px",padding:"7px 12px",fontSize:"11px",fontWeight:700,cursor:"pointer",background:convivencia.includes(id)?"#201a4a":"#fff",color:convivencia.includes(id)?"#fff":"#201a4a"}}>{label}</button>
                ))}
              </div>
            </div>
            <textarea placeholder="História do pet (opcional): como foi resgatado, do que gosta..." value={historia} maxLength={1000} onChange={e=>setHistoria(e.target.value)} style={{border:"1.6px solid #201a4a",borderRadius:"16px",padding:"12px 18px",minHeight:"80px",outline:"none",fontFamily:"inherit",fontSize:"13px",resize:"vertical"}}/>
            <button onClick={publicar} disabled={loading} style={{background:"#201a4a",color:"#fff",border:"none",borderRadius:"999px",padding:"11px 48px",fontWeight:700,alignSelf:"center",marginTop:"14px",cursor:"pointer"}}>{loading?(editId?"Salvando...":"Publicando..."):(editId?"Salvar alterações":"Publicar")}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// A chave recria o formulario quando o ?id= muda (ex.: clicar em "Novo Pet" durante uma edicao),
// para nao continuar editando o pet anterior.
function ConteudoNovoPet(){
  const id = useSearchParams().get("id");
  return <FormularioPet key={id || "novo"} id={id} />;
}

export default function NovoPage(){
  return <Suspense fallback={<div style={{padding:24}}>Carregando...</div>}><ConteudoNovoPet/></Suspense>;
}
