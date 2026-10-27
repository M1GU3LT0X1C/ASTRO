"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { definirLogo } from "@/lib/perfil";
import { alerta } from "@/lib/alerta";
import styles from "./Perfil.module.css";
type Settings = { whatsappContato: string; instagram: string };
const storageKey = "astro_ong_configuracoes_v1";
export default function PerfilOngPage() {
  const [foto,setFoto]=useState("");
  const [capa,setCapa]=useState("");
  const [nome,setNome]=useState("");
  const [bio,setBio]=useState("");
  const [endereco,setEndereco]=useState("");
  const [ocultarEndereco,setOcultarEndereco]=useState(false);
  const [cidade,setCidade]=useState("");
  const [estado,setEstado]=useState("");
  const [raio,setRaio]=useState(30);
  const [statusVagas,setStatusVagas]=useState("com");
  const [settings,setSettings]=useState<Settings>({whatsappContato:"",instagram:""});
  const [emailPublico,setEmailPublico]=useState("");
  const [facebook,setFacebook]=useState("");
  const [uploading,setUploading]=useState(false);
  const [saved,setSaved]=useState(false);
  const capaRef=useRef<HTMLInputElement>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    try {
      setFoto(localStorage.getItem("ong_foto")||"");
      const p=JSON.parse(localStorage.getItem("astro_ong_perfil_visual_v1")||"{}");
      setNome(p.nome||"");setBio(p.bio||"");setEndereco(p.endereco||"");
      setCidade(p.cidade||"");setEstado(p.estado||"");
      setOcultarEndereco(Boolean(p.ocultarEndereco));setRaio(p.raio??30);
      setStatusVagas(p.statusVagas||"com");setCapa(p.capa||"");
      setEmailPublico(p.emailPublico||"");setFacebook(p.facebook||"");
      const s=JSON.parse(localStorage.getItem(storageKey)||"{}");
      setSettings({whatsappContato:s.whatsappContato||"",instagram:s.instagram||""});
    } catch {}
  },[]);
  const update=(key:keyof Settings,value:string)=>{setSettings(p=>({...p,[key]:value}));setSaved(false)};
  const salvarPerfil=()=>{
    try {
      localStorage.setItem("astro_ong_perfil_visual_v1",JSON.stringify({nome,bio,endereco,cidade,estado,ocultarEndereco,raio,statusVagas,capa,emailPublico,facebook}));
      const existing=JSON.parse(localStorage.getItem(storageKey)||"{}");
      localStorage.setItem(storageKey,JSON.stringify({...existing,...settings}));
      setSaved(true);
    } catch {alerta.erro("Não foi possível salvar o perfil neste navegador.");}
  };
  const trocarCapa=(event:React.ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];if(!file)return;
    if(!file.type.startsWith("image/")||file.size>3*1024*1024){alerta.erro("Selecione uma imagem de até 3 MB.");return;}
    const reader=new FileReader();
    reader.onload=()=>{setCapa(typeof reader.result==="string"?reader.result:"");setSaved(false)};
    reader.readAsDataURL(file);
  };
  const upload=async(event:React.ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];if(!file)return;
    if(!file.type.startsWith("image/")||file.size>5*1024*1024){alerta.erro("Selecione uma imagem de até 5 MB.");return;}
    setUploading(true);
    try{
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){alerta.erro("Login necessário","Entre na conta da ONG para enviar a foto.");return;}
      const ext=file.name.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g,"")||"jpg";
      const filename=`logos/${user.id}-${Date.now()}.${ext}`;
      const {error}=await supabase.storage.from("animais-fotos").upload(filename,file,{contentType:file.type});
      if(error)throw error;
      const url=supabase.storage.from("animais-fotos").getPublicUrl(filename).data.publicUrl;
      await definirLogo(url);setFoto(url);localStorage.setItem("ong_foto",url);
    }catch(err){alerta.erro("Erro ao salvar a foto",err instanceof Error?err.message:undefined);}
    finally{setUploading(false);if(fileRef.current)fileRef.current.value="";}
  };
  return <main className={styles.page}>
    <div className={styles.nav}><Link href="/dashboard/config">‹ Voltar às configurações</Link></div>
<div className={styles.profilePanel}>
                <div className={styles.profileTop}><h2>Configuração do Perfil da Base</h2><button type="button" className={styles.primary} onClick={salvarPerfil}>Salvar Alterações</button></div>
                <h3>Apresentação</h3>
                <button type="button" className={styles.cover} onClick={() => capaRef.current?.click()} style={capa ? { backgroundImage: `url(${capa})` } : undefined}>Capa de Perfil</button>
                <input ref={capaRef} className={styles.hiddenInput} type="file" accept="image/*" onChange={trocarCapa}/>
                <div className={styles.profileFields}>
                  <div className={styles.logoColumn}><strong>Logotipo/Foto de Perfil</strong><div className={styles.largeAvatar}>{foto ? <img src={foto} alt="Foto da ONG"/> : null}</div><input ref={fileRef} className={styles.hiddenInput} type="file" accept="image/*" onChange={upload}/><button type="button" className={styles.pinkButton} disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? "Enviando..." : "Alterar"}</button></div>
                  <div className={styles.profileText}><label>Nome da ONG/Protetor<input placeholder="Digite aqui o nome" value={nome} onChange={e=>setNome(e.target.value)}/></label><label>Biografia/História<textarea placeholder="Sobre você" value={bio} onChange={e=>setBio(e.target.value)}/></label></div>
                </div>
                <h3>Localização & Atendimento</h3>
                <div className={styles.profileLocation}><label>Endereço Físico<input value={endereco} onChange={e=>setEndereco(e.target.value)} placeholder=""/></label>
                  <label className={styles.checkRow}><input type="checkbox" checked={ocultarEndereco} onChange={e=>setOcultarEndereco(e.target.checked)}/> Ocultar endereço exato por segurança <span>{ocultarEndereco ? "Oculto" : "Exibir"}</span></label>
                  <p className={styles.locationNote}>◈ Endereço exato ocultado por segurança</p>
                  <div className={styles.twoFields}><label>Cidade<input placeholder="Cidade" value={cidade} onChange={e=>setCidade(e.target.value)}/></label><label>Estado<input placeholder="Estado" value={estado} onChange={e=>setEstado(e.target.value)}/></label></div>
                  <label className={styles.rangeLabel}>Raio de Atuação <span>{raio} km</span><input type="range" min="1" max="100" value={raio} onChange={e=>setRaio(Number(e.target.value))}/></label>
                  <strong>Status de Vagas</strong><div className={styles.vacancies}><span>Selecione ao lado o Status atual em relação à quantidade de vagas disponíveis na sua ONG</span><div className={styles.vacancyOptions}>{[["com","COM VAGAS"],["lotado","LOTADO"],["superlotado","SUPERLOTADO"]].map(([value,label])=><button type="button" key={value} className={statusVagas===value?styles.vacancyActive:""} onClick={()=>setStatusVagas(value)}>{label}</button>)}</div></div>
                </div>
                <h3>Contatos de Emergência & Redes</h3>
                <div className={styles.twoFields}><label>WhatsApp Institucional<input placeholder="(00) 00000-0000" value={settings.whatsappContato} onChange={e=>update("whatsappContato",e.target.value)}/></label><label>E-mail Público<input placeholder="contato@suaong.com" type="email" value={emailPublico} onChange={e=>setEmailPublico(e.target.value)}/></label><label>Instagram<input placeholder="@seuinstagram" value={settings.instagram} onChange={e=>update("instagram",e.target.value)}/></label><label>Facebook<input placeholder="facebook" value={facebook} onChange={e=>setFacebook(e.target.value)}/></label></div>
              </div>
{saved&&<p className={styles.saved} role="status">Alterações salvas neste navegador.</p>}
  </main>;
}
