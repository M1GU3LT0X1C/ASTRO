"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./Painel.module.css";

export default function DashboardPage() {
  const [nomePessoa, setNomePessoa] = useState("");
  const [animais, setAnimais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const ultimoUser = localStorage.getItem("ultimo_user_id");
      if (ultimoUser && ultimoUser!== user.id) localStorage.clear();
      localStorage.setItem("ultimo_user_id", user.id);

      const perfilPendente = localStorage.getItem("astro_perfil_pendente");
      if (perfilPendente) {
        const { data: existe } = await supabase.from("ongs").select("id").eq("usuario_id", user.id).maybeSingle();
        if (!existe) {
          await supabase.from("ongs").insert({
            usuario_id: user.id,
            nome_organizacao: localStorage.getItem("temp_ong_nome") || user.user_metadata.full_name || user.email?.split("@")[0] || "Minha ONG",
            tipo_perfil: perfilPendente, documento: "", telefone: "", cep: "", regiao: "",
            descricao: `Criado via Google - ${perfilPendente}`,
          });
        }
        localStorage.removeItem("astro_perfil_pendente");
        localStorage.removeItem("temp_ong_nome");
      }

      const nomeGoogle = user.user_metadata?.full_name || "";
      const pessoaSalva = localStorage.getItem("pessoa_nome") || nomeGoogle || user.email?.split("@")[0] || "explorador";
      setNomePessoa(pessoaSalva);
      localStorage.setItem("pessoa_nome", pessoaSalva);

      const { data: ong } = await supabase.from("ongs").select("id, nome_organizacao").eq("usuario_id", user.id).maybeSingle();
      if (ong) {
        localStorage.setItem("ong_nome", ong.nome_organizacao);
        const { data: pets } = await supabase.from("animais").select("*").eq("ong_id", ong.id).order("created_at", { ascending: false });
        setAnimais(pets || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{padding:24}}>Carregando...</div>;

  return (
    <div className={styles.painelContainer}>
      <div className={styles.topRow}>
        <div className={styles.boasVindas}>
          <h1>Olá {nomePessoa}! Que bom te ver no centro de controle!</h1>
          <p>Que tal fazer um Check-in para ganhar pontos?</p>
        </div>
        <div className={styles.lembretes}>
          <div className={styles.lembretesTitulo}>
            <img src="/lembrete.png" alt="lembretes" className={styles.iconeLembreteTitulo} /> Lembretes
          </div>
          <div className={styles.lembreteItem} style={{color:'#999', fontStyle:'italic'}}>Nenhum lembrete por enquanto.</div>
        </div>
      </div>
      <div className={styles.metricas}>
        <div className={styles.cardVerde}><strong>+{animais.length>0?35:0}%</strong><span>Alcance no bairro este mês</span></div>
        <div className={styles.cardRoxo}><strong>R$ {animais.length*120},00</strong><span>Economizados em saúde</span></div>
        <div className={styles.cardRosa}><strong>{animais.length}</strong><span>Interesses para adoção</span></div>
      </div>
      <div className={styles.petsGrid}>
        {animais.length===0? (
          <div className={styles.vazio}><p>Nenhum pet cadastrado ainda.</p><span>Vai em <b>Novo Pet</b>.</span></div>
        ) : animais.map((pet)=>(
          <div key={pet.id} className={styles.petCard}>
            <img src={pet.foto_url || "/logo-gato.png"} alt={pet.nome} className={styles.petFoto} />
            <h3>{pet.nome}</h3><small>{pet.especie} - {pet.porte}</small>
          </div>
        ))}
      </div>
    </div>
  );
}