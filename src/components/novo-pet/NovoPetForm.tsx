"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Cat, Dog, Baby, Info } from "lucide-react";
import { acordarServidor, ErroApi } from "@/lib/api";
import { TEMPERAMENTOS, atualizarAnimal, buscarAnimal, cadastrarAnimal, type Urgencia } from "@/lib/animais";
import { alerta } from "@/lib/alerta";
import { atualizarPetTutor, buscarPetTutor, cadastrarPetTutor } from "@/lib/explorador";
import { enviarImagemPublica } from "@/lib/upload";
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

// Personalidade: o formulario mostra rotulos ("Carinhoso"); os pets da ONG guardam os codigos
// usados nos filtros da busca publica ("afetivo"), ver TEMPERAMENTOS em lib/animais.
const CODIGO_PERSONALIDADE = Object.fromEntries(Object.entries(TEMPERAMENTOS).map(([codigo, rotulo]) => [rotulo, codigo]));
const ROTULO_PERSONALIDADE = (valor: string) => TEMPERAMENTOS[valor] || valor;

/** id preenchido = edicao de um pet existente (?id= na URL). */
export default function NovoPetForm({modo, id = null}: {modo:Modo; id?: string | null}){
 const router=useRouter();const fileInput=useRef<HTMLInputElement>(null);
 const [unidade,setUnidade]=useState("anos"); const [fase,setFase]=useState(""); const [cor,setCor]=useState(""); const [deficiencia,setDeficiencia]=useState(false); const [descricaoDef,setDescricaoDef]=useState("");
 const carregarIdade=(valor:string)=>{const m=valor.match(/^(\d+)\s*(semanas?|m[eê]s(?:es)?|anos?)?$/i); if(m){setIdade(m[1]);setUnidade(m[2]?.startsWith("sem")?"semanas":m[2]?.startsWith("m")?"meses":"anos");setFase("informar")}else{setFase(valor);setIdade("")}};
 const [nome,setNome]=useState("");const [idade,setIdade]=useState("");const [tempoAbrigo,setTempoAbrigo]=useState("");const [microchip,setMicrochip]=useState("");const [raca,setRaca]=useState("");
 const [porte,setPorte]=useState("");const [sexo,setSexo]=useState("");const [especie,setEspecie]=useState("");
 const [flags,setFlags]=useState<Flags>({castrado:false,vacinado:false,vermifugado:false,cuidados:false});
 const [detalhes,setDetalhes]=useState("");const [sobre,setSobre]=useState("");const [recomendacoes,setRecomendacoes]=useState("");
 const [personalidade,setPersonalidade]=useState<string[]>([]);
 const [novaPersonalidade,setNovaPersonalidade]=useState("");
 const adicionarPersonalidade=()=>{const valor=novaPersonalidade.trim();if(!valor)return;const normalizar=(v:string)=>v.toLocaleLowerCase("pt-BR");const padrao=personalidades.find(p=>normalizar(p.nome)===normalizar(valor));const tag=padrao?.nome||valor;setPersonalidade(atual=>atual.some(p=>normalizar(p)===normalizar(tag))?atual:[...atual,tag]);setNovaPersonalidade("")};const [reatividade,setReatividade]=useState<string[]>([]);const [urgencia,setUrgencia]=useState("normal");
 const [foto,setFoto]=useState("");const [arquivo,setArquivo]=useState<File|null>(null);const [salvando,setSalvando]=useState(false);
 // edicao: foto ja salva e campos que este formulario nao mostra (preservados ao salvar)
 const envioEmCurso=useRef(false);
 const fotoEnviada=useRef<{arquivo:File;url:string}|null>(null);
 const [etapaEnvio,setEtapaEnvio]=useState("");
 useEffect(()=>{if(modo==="ong")acordarServidor()},[modo]);
 const [fotoAtual,setFotoAtual]=useState("");const [extrasTutor,setExtrasTutor]=useState({peso:"",alergias:""});
 useEffect(()=>{
  if(!id)return;
  let ativo=true;
  if(modo==="ong"){
   buscarAnimal(id).then(pet=>{
    if(!ativo)return;
    setNome(pet.nome);carregarIdade(pet.idade_texto);setCor(pet.cor_pelagem);setDeficiencia(pet.deficiencia);setDescricaoDef(pet.descricao_deficiencia);setTempoAbrigo(pet.tempo_abrigo);setMicrochip(pet.microchip);setRaca(pet.raca);
    setPorte(pet.porte);setSexo(pet.sexo);setEspecie(pet.especie);
    setFlags({castrado:pet.castrado,vacinado:pet.vacinado,vermifugado:pet.vermifugado,cuidados:pet.cuidados_especiais});
    setDetalhes(pet.detalhes_cuidados);setSobre(pet.historia);setRecomendacoes(pet.recomendacoes);
    setPersonalidade(pet.temperamentos.map(ROTULO_PERSONALIDADE));setReatividade(pet.convivencia);setUrgencia(pet.urgencia);
    setFoto(pet.foto_url);setFotoAtual(pet.foto_url);
   }).catch(()=>alerta.erro("Não foi possível carregar o pet para edição"));
  }else{
   buscarPetTutor(id).then(pet=>{
    if(!ativo||!pet)return;
    setNome(pet.nome);carregarIdade(pet.idade||"");setMicrochip(pet.microchip||"");setRaca(pet.raca||"");
    setPorte(pet.porte||"");setSexo(pet.sexo||"");setEspecie(pet.especie||"");
    setFlags({castrado:pet.castrado==="Sim",vacinado:pet.vacinado,vermifugado:pet.vermifugado,cuidados:pet.cuidadosEspeciais});
    setDetalhes(pet.condicao||"");setSobre(pet.sobre||"");setPersonalidade(pet.personalidade);setReatividade(pet.reatividade);
    setFoto(pet.foto||"");setFotoAtual(pet.foto||"");setExtrasTutor({peso:pet.peso||"",alergias:pet.alergias||""});
   }).catch(()=>alerta.erro("Não foi possível carregar o pet para edição"));
  }
  return()=>{ativo=false};
 },[id,modo]);
 useEffect(()=>()=>{if(foto.startsWith("blob:"))URL.revokeObjectURL(foto)},[foto]);
 const alternar=(lista:string[],set:(a:string[])=>void,item:string)=>set(lista.includes(item)?lista.filter(v=>v!==item):[...lista,item]);
 const mudarFoto=(file?:File)=>{if(!file)return;if(!file.type.startsWith("image/")){alerta.aviso("Arquivo inválido","Selecione uma imagem.");return}if(file.size>4*1024*1024){alerta.aviso("Imagem muito grande","Use uma foto de até 4 MB.");return}setArquivo(file);setFoto(URL.createObjectURL(file))};
 const cancelar=()=>router.push(modo==="ong"?"/dashboard/meus-pets":"/dashboard-explorador/meus-pets");
 const salvar=async()=>{
  if(envioEmCurso.current)return;
  if(!nome.trim())return alerta.aviso("Nome obrigatório","Informe o nome do pet.");
  if(!fase||(fase==="informar"&&(!idade.trim()||!/^\d+$/.test(idade))))return alerta.aviso("Idade inválida","Informe a idade ou a fase de vida.");
  if((especie==="cachorro"&&!porte)||!sexo||!especie)return alerta.aviso("Dados incompletos","Selecione espécie, sexo e, para caninos, porte.");
  const idadeFinal=fase!=="informar"?fase:`${Number(idade)} ${Number(idade)===1?({anos:"ano",meses:"mês",semanas:"semana"}[unidade]||unidade):unidade}`;
  if(modo==="explorador"&&(cor.trim()||deficiencia))return alerta.aviso("Integração pendente","Cores e deficiência ainda não podem ser salvas para Exploradores.");
  envioEmCurso.current=true;
  setSalvando(true);
  let etapa="cadastro";
  try{
   if(modo==="ong"){
    let fotoUrl=fotoAtual;
    if(arquivo){
     etapa="foto";setEtapaEnvio("Enviando foto...");
     if(fotoEnviada.current?.arquivo===arquivo){fotoUrl=fotoEnviada.current.url;}
     else {fotoUrl=await enviarImagemPublica(arquivo,"pets",{permitirDataUrl:false});fotoEnviada.current={arquivo,url:fotoUrl};}
    }
    etapa="cadastro";setEtapaEnvio("Salvando Astro...");
    const dados={nome:nome.trim(),idade:idadeFinal,corPelagem:cor.trim(),deficiencia,descricaoDeficiencia:deficiencia?descricaoDef.trim():"",raca:raca.trim(),porte,sexo,especie,castrado:flags.castrado,vacinado:flags.vacinado,vermifugado:flags.vermifugado,cuidados:flags.cuidados,
     temperamentos:personalidade.map(p=>CODIGO_PERSONALIDADE[p]||p),convivencia:reatividade,historia:sobre,fotoUrl,
     microchip,tempoAbrigo,detalhesCuidados:flags.cuidados?detalhes.trim():"",recomendacoes,urgencia:urgencia as Urgencia};
    if(id){await atualizarAnimal(id,dados);await alerta.sucesso("Pet atualizado!","As alterações já aparecem em Meus Pets.");}
    else{await cadastrarAnimal(dados);await alerta.sucesso("Pet cadastrado!","O animal foi enviado ao cadastro da ONG.");}
    router.push("/dashboard/meus-pets");
   }else{
    const fotoUrl=arquivo?await enviarImagemPublica(arquivo,"pets-tutor"):fotoAtual;
    const dados={nome:nome.trim(),microchip:microchip.trim(),peso:extrasTutor.peso,castrado:flags.castrado?"Sim":"Não",alergias:extrasTutor.alergias,condicao:flags.cuidados?detalhes.trim():"",fotoUrl,
     idade:idadeFinal,raca:raca.trim(),porte,sexo,especie,vacinado:flags.vacinado,vermifugado:flags.vermifugado,cuidadosEspeciais:flags.cuidados,sobre,personalidade,reatividade};
    if(id){await atualizarPetTutor(id,dados);await alerta.sucesso("Pet atualizado!","As alterações estão em Meus Pets & Saúde.");}
    else{await cadastrarPetTutor(dados);await alerta.sucesso("Pet adicionado!","Ele está em Meus Pets & Saúde e não foi publicado para adoção.");}
    router.push("/dashboard-explorador/meus-pets");
   }
  }catch(e){
   if(modo!=="ong"){await alerta.erro("Não foi possível salvar",e instanceof Error?e.message:"Tente novamente.");}
   else {
    const status=e instanceof ErroApi?e.status:undefined;
    console.error("[NovoPet ONG] Falha",{etapa,status,tipo:e instanceof Error?e.name:"desconhecido"});
    const detalhe=e instanceof Error?e.message:"Falha inesperada.";
    await alerta.erro(etapa==="foto"?"Não foi possível enviar a foto":"Não foi possível salvar o Astro",etapa==="foto"?`${detalhe} Seus dados foram mantidos.`:status===0||status===undefined||status>=500?`${detalhe} Seus dados foram mantidos. Confira Meus Pets antes de tentar novamente, pois o envio pode ter sido recebido.`:`${detalhe} (HTTP ${status}). Seus dados foram mantidos.`);
   }
  }finally{envioEmCurso.current=false;setSalvando(false);setEtapaEnvio("")}
 };
 return <main className={styles.pagina}>
  <header className={styles.topo}><h1>{id?"Editar Pet":"Novo Pet"}</h1><p>{modo==="ong"?"Cadastre um animal da ONG para adoção.":"Cadastre seu pet para acompanhar os cuidados e a saúde dele."}</p></header>
  <div className={styles.grid}>
   <section className={styles.painelEsquerdo} aria-label="Informações do pet">
    <div className={styles.identificacao}>
     <button type="button" className={styles.foto} onClick={()=>fileInput.current?.click()} aria-label="Adicionar foto do pet">{foto?<img src={foto} alt="Prévia do pet"/>:<Camera size={30}/>}</button>
     <input ref={fileInput} type="file" accept="image/*" hidden onChange={e=>mudarFoto(e.target.files?.[0])}/>
     <div className={styles.identificacaoCampos}><input aria-label="Nome do Pet" placeholder="Nome do Pet" maxLength={80} value={nome} onChange={e=>setNome(e.target.value)}/>{modo==="ong"&&<input aria-label="Tempo no abrigo" placeholder="Tempo no abrigo" value={tempoAbrigo} onChange={e=>setTempoAbrigo(e.target.value)}/>}</div>
    </div>
    <div className={styles.selects}>
      <label className={styles.selectLinha}>Espécie<select value={especie} onChange={e=>setEspecie(e.target.value)}><option value="">Selecionar</option><option value="cachorro">Canino</option><option value="gato">Felino</option><option value="outro">Outro</option></select></label>
      <label className={styles.selectLinha}>Sexo<select value={sexo} onChange={e=>setSexo(e.target.value)}><option value="">Selecionar</option><option value="macho">Macho</option><option value="femea">Fêmea</option></select></label>
      <label className={styles.selectLinha}>Porte {especie!=="cachorro"?"(opcional)":""}<select value={porte} onChange={e=>setPorte(e.target.value)}><option value="">Selecionar</option><option value="pequeno">Pequeno</option><option value="medio">Médio</option><option value="grande">Grande</option></select></label>
      <label className={styles.selectLinha}>Idade estimada<select value={fase} onChange={e=>setFase(e.target.value)}><option value="">Selecionar</option>{[...new Set(["Filhote","Jovem","Adulto","Idoso",...(fase&&fase!=="informar"?[fase]:[])])].map(f=><option key={f}>{f}</option>)}<option value="informar">Informar idade</option></select></label>
      {fase==="informar"&&<div className={styles.idadeDetalhada}><input aria-label="Idade" placeholder="Idade" inputMode="numeric" value={idade} onChange={e=>setIdade(e.target.value.replace(/\D/g,""))}/><select aria-label="Unidade de idade" value={unidade} onChange={e=>setUnidade(e.target.value)}><option value="semanas">Semanas</option><option value="meses">Meses</option><option value="anos">Anos</option></select></div>}
    </div>
    <input aria-label="Raça ou tipo" placeholder="Raça ou tipo (opcional)" value={raca} onChange={e=>setRaca(e.target.value)}/>
    {modo==="ong"&&<input aria-label="Cores e pelagem" placeholder="Cores e pelagem (opcional)" value={cor} onChange={e=>setCor(e.target.value)}/>}
    <input aria-label="Número de microchip" placeholder="Número de microchip (opcional)" value={microchip} onChange={e=>setMicrochip(e.target.value)}/>
    {modo==="ong"?<><div className={styles.cuidados}><label className={styles.switchLinha}><span>Possui deficiência</span><input type="checkbox" checked={deficiencia} onChange={e=>setDeficiencia(e.target.checked)}/><span className={styles.switchVisual}/></label>{deficiencia&&<textarea aria-label="Descrição da deficiência" placeholder="Descreva a deficiência..." value={descricaoDef} onChange={e=>setDescricaoDef(e.target.value)}/>}</div></>:<div className={styles.selects}><p>Cores, pelagem e deficiência: integração pendente para Exploradores.</p></div>}
    <div className={styles.cuidados}>{([['castrado','Castrado'],['vacinado','Vacinado'],['vermifugado','Vermifugado'],['cuidados','Cuidados especiais']] as const).map(([chave,rotulo])=><label className={styles.switchLinha} key={chave}><span>{rotulo}</span><input type="checkbox" checked={flags[chave]} onChange={e=>setFlags(f=>({...f,[chave]:e.target.checked}))}/><span className={styles.switchVisual}/></label>)}{flags.cuidados&&<textarea aria-label="Detalhar cuidados especiais" placeholder="Detalhar cuidados especiais..." value={detalhes} onChange={e=>setDetalhes(e.target.value)}/>}</div>
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
    <div className={styles.tagsCard}><h2>Tags de Personalidade</h2><div className={styles.tags}>{personalidades.map(({nome,icone})=><button key={nome} type="button" aria-pressed={personalidade.includes(nome)} className={`${styles.tag} ${personalidade.includes(nome)?styles.tagAtiva:""}`} onClick={()=>alternar(personalidade,setPersonalidade,nome)}><span aria-hidden="true" className={styles.tagIcone} style={{maskImage:`url(/icons-novo-pet/${icone})`,WebkitMaskImage:`url(/icons-novo-pet/${icone})`}} />{nome}</button>)}{personalidade.filter(p=>!personalidades.some(item=>item.nome===p)).map(p=><button key={p} type="button" className={`${styles.tag} ${styles.tagAtiva}`} aria-label={`Remover ${p}`} onClick={()=>setPersonalidade(atual=>atual.filter(item=>item!==p))}>{p}</button>)}</div><div className={styles.novaPersonalidade}><input aria-label="Outra personalidade" placeholder="Digite outra personalidade" maxLength={60} value={novaPersonalidade} onChange={e=>setNovaPersonalidade(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();adicionarPersonalidade()}}}/><button type="button" disabled={!novaPersonalidade.trim()} onClick={adicionarPersonalidade}>Adicionar</button></div></div>
    <div className={styles.tagsCard}><h2>Tags de Reatividade</h2><div className={styles.reatividades}>{reatividades.map(({id,label,Icon})=><label key={id}><Icon size={17}/><span>{label}</span><input type="checkbox" checked={reatividade.includes(id)} onChange={()=>alternar(reatividade,setReatividade,id)}/><span className={styles.switchVisual}/></label>)}</div></div>
    <label className={styles.textoLabel}>Sobre o pet<textarea placeholder="Conte como o pet chegou, do que gosta de brincar, comportamentos no dia a dia..." maxLength={2000} value={sobre} onChange={e=>setSobre(e.target.value)}/></label>
    {modo==="ong"&&<label className={styles.textoLabel}>Recomendações da ONG<textarea placeholder="Conte o que é recomendado para esse pet..." value={recomendacoes} onChange={e=>setRecomendacoes(e.target.value)}/></label>}
    <div className={styles.acoes}><button type="button" className={styles.cancelar} disabled={salvando} onClick={cancelar}>Cancelar</button><button type="button" className={styles.salvar} disabled={salvando} onClick={salvar}>{salvando?(etapaEnvio||"Salvando..."):id?"Salvar alterações":"Adicionar Pet"}</button></div>
   </section>
  </div>
 </main>
}
