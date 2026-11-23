"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PerfilClinica.module.css";

type Perfil = { nome: string; bio: string; whatsapp: string; email: string; instagram: string; facebook: string; capa: string; foto: string };
const chave = "astro_clinica_perfil_v1";
const vazio: Perfil = { nome: "", bio: "", whatsapp: "", email: "", instagram: "", facebook: "", capa: "", foto: "" };
export default function PerfilClinica() {
  const [perfil, setPerfil] = useState<Perfil>(vazio);
  const [mensagem, setMensagem] = useState("");
  const fotoRef = useRef<HTMLInputElement>(null);
  const capaRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try { const dados = JSON.parse(localStorage.getItem(chave) || "{}"); setPerfil({ ...vazio, ...dados }); }
    catch { /* dados locais indisponíveis */ }
  }, []);
  function mudar(campo: keyof Perfil, valor: string) { setPerfil(prev => ({ ...prev, [campo]: valor })); setMensagem(""); }
  function imagem(evento: React.ChangeEvent<HTMLInputElement>, campo: "capa" | "foto") {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/") || arquivo.size > 2 * 1024 * 1024) { setMensagem("Selecione uma imagem de até 2 MB."); return; }
    const leitor = new FileReader();
    leitor.onload = () => { if (typeof leitor.result === "string") mudar(campo, leitor.result); };
    leitor.readAsDataURL(arquivo);
    evento.target.value = "";
  }
  function salvar() {
    try { localStorage.setItem(chave, JSON.stringify(perfil)); setMensagem("Alterações salvas neste navegador."); }
    catch { setMensagem("Não foi possível salvar. Reduza o tamanho das imagens ou libere espaço no navegador."); }
  }
  return <main className={styles.pagina}>
    <div className={styles.topo}><h1>Configuração do Perfil da Clínica</h1><button type="button" onClick={salvar} className={styles.salvar}>Salvar Alterações</button></div>
    <h2>Apresentação</h2>
    <input ref={capaRef} className={styles.oculto} type="file" accept="image/*" aria-label="Selecionar capa" onChange={e => imagem(e, "capa")}/>
    <button type="button" className={styles.capa} style={perfil.capa ? { backgroundImage: `url(${perfil.capa})` } : undefined} onClick={() => capaRef.current?.click()} aria-label="Alterar capa de perfil">
      {!perfil.capa && <strong>Capa de Perfil</strong>}<span className={styles.capaDica}>Clique para alterar a capa</span>
    </button>
    <div className={styles.apresentacao}>
      <div className={styles.fotoColuna}><label>Logotipo/Foto de Perfil</label><input ref={fotoRef} className={styles.oculto} type="file" accept="image/*" aria-label="Selecionar logotipo" onChange={e => imagem(e, "foto")}/>
        <div className={styles.foto} style={perfil.foto ? { backgroundImage: `url(${perfil.foto})` } : undefined} aria-label="Prévia do logotipo"/>
        <button type="button" className={styles.alterar} onClick={() => fotoRef.current?.click()}>Alterar</button>
      </div>
      <div className={styles.campos}><label htmlFor="clinica-nome">Nome da Clínica</label><input id="clinica-nome" maxLength={120} placeholder="Digite aqui o nome" value={perfil.nome} onChange={e => mudar("nome", e.target.value)}/>
        <label htmlFor="clinica-bio">Biografia / Sobre a Clínica</label><textarea id="clinica-bio" maxLength={1500} placeholder="Sobre a clínica" value={perfil.bio} onChange={e => mudar("bio", e.target.value)}/>
      </div>
    </div>
    <h2>Contatos de Emergência & Redes</h2>
    <div className={styles.contatos}>
      <label>WhatsApp Institucional<input type="tel" placeholder="(00) 00000-0000" value={perfil.whatsapp} onChange={e => mudar("whatsapp", e.target.value)}/></label>
      <label>E-mail Público<input type="email" placeholder="seucontato@email.com" value={perfil.email} onChange={e => mudar("email", e.target.value)}/></label>
      <label>Instagram<input type="text" placeholder="@seuinstagram" value={perfil.instagram} onChange={e => mudar("instagram", e.target.value)}/></label>
      <label>Facebook<input type="text" placeholder="seufacebook" value={perfil.facebook} onChange={e => mudar("facebook", e.target.value)}/></label>
    </div>
    {mensagem && <p role="status" className={styles.mensagem}>{mensagem}</p>}
  </main>;
}
