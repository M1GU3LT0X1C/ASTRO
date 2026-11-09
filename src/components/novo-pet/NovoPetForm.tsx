"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Cat, Dog, Baby, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cadastrarAnimal } from "@/lib/animais";
import { alerta } from "@/lib/alerta";
import { CHAVES, lerLocal, gravarLocal, type PetExplorador } from "@/app/dashboard-explorador/dados-locais";
import styles from "./NovoPetForm.module.css";
type Modo = "ong" | "explorador";
type Flags = {
  castrado: boolean;
  vacinado: boolean;
  vermifugado: boolean;
  cuidados: boolean;
};
// Opções exibidas no formulário. Os ícones de personalidade ficam em public/icons-novo-pet/.
const personalidades = [
  { nome: "Energético", icone: "pet-energetico.svg" },
  { nome: "Tímido", icone: "pet-timido.svg" },
  { nome: "Preguiçoso", icone: "pet-preguicoso.svg" },
  { nome: "Medroso", icone: "pet-medroso.svg" },
  { nome: "Sociável", icone: "pet-sociavel.svg" },
  { nome: "Carinhoso", icone: "pet-carinhoso.svg" },
  { nome: "Apegado", icone: "pet-apegado.svg" },
  { nome: "Curioso", icone: "pet-curioso.svg" },
  { nome: "Protetor", icone: "pet-protetor.svg" },
  { nome: "Independente", icone: "pet-independente.svg" },
];

const reatividades = [
  { id: "caes", label: "Se dá bem com cães", Icon: Dog },
  { id: "gatos", label: "Se dá bem com gatos", Icon: Cat },
  { id: "criancas", label: "Se dá bem com crianças", Icon: Baby },
  { id: "unico", label: "Precisa ser o único pet da casa", Icon: Info },
];

const niveisUrgencia = [
  { id: "normal", titulo: "Normal", descricao: "fluxo padrão da instituição" },
  { id: "prioritaria", titulo: "Adoção prioritária", descricao: "pet idoso, deficiente ou muito tempo abrigado" },
  { id: "critica", titulo: "Caso crítico", descricao: "abrigo lotado, tratamento custoso, risco de despejo" },
] as const;

export default function NovoPetForm({modo}: {modo:Modo}){
 const router=useRouter();const fileInput=useRef<HTMLInputElement>(null);
 const [nome,setNome]=useState("");const [idade,setIdade]=useState("");const [tempoAbrigo,setTempoAbrigo]=useState("");const [microchip,setMicrochip]=useState("");const [raca,setRaca]=useState("");
 const [porte,setPorte]=useState("");const [sexo,setSexo]=useState("");const [especie,setEspecie]=useState("");
 const [flags,setFlags]=useState<Flags>({castrado:false,vacinado:false,vermifugado:false,cuidados:false});
 const [detalhes,setDetalhes]=useState("");const [sobre,setSobre]=useState("");const [recomendacoes,setRecomendacoes]=useState("");
 const [personalidade,setPersonalidade]=useState<string[]>([]);const [reatividade,setReatividade]=useState<string[]>([]);const [urgencia,setUrgencia]=useState("normal");
 const [foto,setFoto]=useState("");const [arquivo,setArquivo]=useState<File|null>(null);const [salvando,setSalvando]=useState(false);
 useEffect(()=>()=>{if(foto.startsWith("blob:"))URL.revokeObjectURL(foto)},[foto]);
 const alternar=(lista:string[],set:(a:string[])=>void,item:string)=>set(lista.includes(item)?lista.filter(v=>v!==item):[...lista,item]);
 const mudarFoto=(file?:File)=>{if(!file)return;if(!file.type.startsWith("image/")){alerta.aviso("Arquivo inválido","Selecione uma imagem.");return}if(file.size>4*1024*1024){alerta.aviso("Imagem muito grande","Use uma foto de até 4 MB.");return}setArquivo(file);setFoto(URL.createObjectURL(file))};
 const cancelar=()=>router.push(modo==="ong"?"/dashboard/meus-pets":"/dashboard-explorador/meus-pets");
 const salvar=async()=>{
  if(!nome.trim())return alerta.aviso("Nome obrigatório","Informe o nome do pet.");
  if(!idade.trim()||!/^\d+$/.test(idade))return alerta.aviso("Idade inválida","Informe a idade em anos.");
  if(!porte||!sexo||!especie)return alerta.aviso("Dados incompletos","Selecione porte, sexo e espécie.");
  setSalvando(true);
  try{
   if(modo==="ong"){
    let fotoUrl="";
    if(arquivo){const nomeArquivo=`${Date.now()}-${arquivo.name.replace(/[^a-zA-Z0-9._-]/g,"-")}`;const {error}=await supabase.storage.from("animais-fotos").upload(nomeArquivo,arquivo,{contentType:arquivo.type});if(error)throw error;fotoUrl=supabase.storage.from("animais-fotos").getPublicUrl(nomeArquivo).data.publicUrl;}
    await cadastrarAnimal({nome:nome.trim(),idade:String(Number(idade)),raca:raca.trim(),porte,sexo,especie,castrado:flags.castrado,vacinado:flags.vacinado,vermifugado:flags.vermifugado,cuidados:flags.cuidados,temperamentos:personalidade.map(p=>p.toLowerCase()),fotoUrl});
    await alerta.sucesso("Pet cadastrado!","O animal foi enviado ao cadastro da ONG.");router.push("/dashboard/meus-pets");
   }else{
    let fotoLocal="";
    if(arquivo){if(arquivo.size>1.5*1024*1024)throw new Error("Para salvar a foto neste navegador, escolha uma imagem de até 1,5 MB.");fotoLocal=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(new Error("Falha ao ler a foto."));reader.readAsDataURL(arquivo)});}
    const pet:PetExplorador={id:crypto.randomUUID(),nome:nome.trim(),microchip:microchip.trim(),peso:"",castrado:flags.castrado?"Sim":"Não",alergias:"",condicao:detalhes.trim(),foto:fotoLocal,vacinas:[],exames:[],idade,tempoAbrigo:"",raca:raca.trim(),porte,sexo,especie,vacinado:flags.vacinado,vermifugado:flags.vermifugado,cuidadosEspeciais:flags.cuidados,detalhesCuidados:detalhes,personalidade,reatividade,sobre};
    gravarLocal(CHAVES.pets,[...lerLocal<PetExplorador[]>(CHAVES.pets,[]),pet]);
    await alerta.sucesso("Pet adicionado!","Ele está em Meus Pets & Saúde e não foi publicado para adoção.");router.push("/dashboard-explorador/meus-pets");
   }
  }catch(e){alerta.erro("Não foi possível salvar",e instanceof Error?e.message:"Tente novamente.")}finally{setSalvando(false)}
 };
 return <main className={styles.pagina}>
  <header className={styles.topo}><h1>Novo Pet</h1><p>{modo==="ong"?"Cadastre um animal da ONG para adoção.":"Cadastre seu pet para acompanhar os cuidados e a saúde dele."}</p></header>
  <div className={styles.grid}>
   <section className={styles.painelEsquerdo} aria-label="Informações do pet">
    <div className={styles.identificacao}>
     <button type="button" className={styles.foto} onClick={()=>fileInput.current?.click()} aria-label="Adicionar foto do pet">{foto?<img src={foto} alt="Prévia do pet"/>:<Camera size={30}/>}</button>
     <input ref={fileInput} type="file" accept="image/*" hidden onChange={e=>mudarFoto(e.target.files?.[0])}/>
     <div className={styles.identificacaoCampos}><input aria-label="Nome do Pet" placeholder="Nome do Pet" value={nome} onChange={e=>setNome(e.target.value)}/><div className={styles.dupla}><input aria-label="Idade do Pet em anos" placeholder="Idade do Pet (anos)" inputMode="numeric" value={idade} onChange={e=>setIdade(e.target.value.replace(/\D/g,""))}/>{modo==="ong"?<input aria-label="Tempo no abrigo" placeholder="Tempo no abrigo" value={tempoAbrigo} onChange={e=>setTempoAbrigo(e.target.value)}/>:<input aria-label="Raça ou tipo" placeholder="Raça ou tipo" value={raca} onChange={e=>setRaca(e.target.value)}/>}</div></div>
    </div>
    <input aria-label="Número de microchip" placeholder="Número de microchip (opcional)" value={microchip} onChange={e=>setMicrochip(e.target.value)}/>
    {modo==="ong"&&<input aria-label="Raça ou tipo" placeholder="Raça ou tipo (opcional)" value={raca} onChange={e=>setRaca(e.target.value)}/>}
    <div className={styles.selects}>{([["Porte",porte,setPorte,["Pequeno","Médio","Grande"]],["Sexo",sexo,setSexo,["Macho","Fêmea"]],["Espécie",especie,setEspecie,["Cachorro","Gato","Outro"]]] as const).map(([rotulo,valor,alterar,opcoes])=><label key={rotulo} className={styles.selectLinha}><span>{rotulo}</span><select aria-label={rotulo} value={valor} onChange={e=>alterar(e.target.value)}><option value="">Selecionar</option>{opcoes.map(o=><option key={o} value={o==="Médio"?"medio":o==="Fêmea"?"femea":o.toLowerCase()}>{o}</option>)}</select></label>)}</div>
    <div className={styles.cuidados}>{([['castrado','Castrado'],['vacinado','Vacinado'],['vermifugado','Vermifugado'],['cuidados','Cuidados especiais']] as const).map(([chave,rotulo])=><label className={styles.switchLinha} key={chave}><span>{rotulo}</span><input type="checkbox" checked={flags[chave]} onChange={e=>setFlags(f=>({...f,[chave]:e.target.checked}))}/><span className={styles.switchVisual}/></label>)}<textarea aria-label="Detalhar cuidados especiais" placeholder="Detalhar cuidados especiais..." value={detalhes} onChange={e=>setDetalhes(e.target.value)}/></div>
    {modo === "ong" && (
      <fieldset className={styles.urgencia}>
        <legend>Nível de urgência da adoção</legend>
        <div className={styles.urgenciaOpcoes}>
          {niveisUrgencia.map(({ id, titulo, descricao }) => (
            <label className={styles.urgenciaOpcao} key={id}>
              <input
                type="radio"
                name="urgencia"
                value={id}
                checked={urgencia === id}
                onChange={() => setUrgencia(id)}
              />
              <span className={styles.urgenciaTexto}>
                <strong>{titulo}</strong> <span>({descricao})</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    )}
   </section>
   <section className={styles.painelDireito} aria-label="Comportamento e descrição">
    <div className={styles.tagsCard}><h2>Tags de Personalidade</h2><div className={styles.tags}>{personalidades.map(({nome,icone})=><button key={nome} type="button" aria-pressed={personalidade.includes(nome)} className={`${styles.tag} ${personalidade.includes(nome)?styles.tagAtiva:""}`} onClick={()=>alternar(personalidade,setPersonalidade,nome)}><span aria-hidden="true" className={styles.tagIcone} style={{maskImage:`url(/icons-novo-pet/${icone})`,WebkitMaskImage:`url(/icons-novo-pet/${icone})`}} />{nome}</button>)}</div></div>
    <div className={styles.tagsCard}><h2>Tags de Reatividade</h2><div className={styles.reatividades}>{reatividades.map(({id,label,Icon})=><label key={id}><Icon size={17}/><span>{label}</span><input type="checkbox" checked={reatividade.includes(id)} onChange={()=>alternar(reatividade,setReatividade,id)}/><span className={styles.switchVisual}/></label>)}</div></div>
    <label className={styles.textoLabel}>Sobre o pet<textarea placeholder="Conte como o pet chegou, do que gosta de brincar, comportamentos no dia a dia..." value={sobre} onChange={e=>setSobre(e.target.value)}/></label>
    {modo==="ong"&&<label className={styles.textoLabel}>Recomendações da ONG<textarea placeholder="Conte o que é recomendado para esse pet..." value={recomendacoes} onChange={e=>setRecomendacoes(e.target.value)}/></label>}
    <div className={styles.acoes}><button type="button" className={styles.cancelar} onClick={cancelar}>Cancelar</button><button type="button" className={styles.salvar} disabled={salvando} onClick={salvar}>{salvando?"Salvando...":"Adicionar Pet"}</button></div>
   </section>
  </div>
 </main>
}
