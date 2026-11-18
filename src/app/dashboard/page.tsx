"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { listarMeusAnimais, type AnimalTela } from "@/lib/animais";
import { buscarMe, garantirOng } from "@/lib/perfil";
import { buscarMetricas, type Metricas } from "@/lib/ong";
import { horaCurta, listarAgenda, proximosCompromissos, type Compromisso } from "@/lib/painel";
import styles from "./Painel.module.css";

export default function DashboardPage() {
  const [nomePessoa, setNomePessoa] = useState("Explorador");
  const [animais, setAnimais] = useState<AnimalTela[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [lembretes, setLembretes] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;

    try {
      const salvo = localStorage.getItem("pessoa_nome") || localStorage.getItem("ong_nome");
      if (salvo) {
        queueMicrotask(() => {
          if (ativo) setNomePessoa(salvo);
        });
      }
    } catch {
      // ignora erro de leitura
    }

    async function load() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user =
          session?.user ??
          (await supabase.auth.getUser().then((r) => r.data.user).catch(() => null));

        if (!user || !ativo) return;

        const ultimoUser = localStorage.getItem("ultimo_user_id");
        if (ultimoUser && ultimoUser !== user.id) localStorage.clear();
        localStorage.setItem("ultimo_user_id", user.id);

        const nomeGoogle =
          user.user_metadata?.nome ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "";
        const pessoaSalva =
          localStorage.getItem("pessoa_nome") ||
          nomeGoogle ||
          user.email?.split("@")[0] ||
          "Explorador";
        if (ativo) setNomePessoa(pessoaSalva);
        localStorage.setItem("pessoa_nome", pessoaSalva);

        const perfilPendente = localStorage.getItem("astro_perfil_pendente");
        if (perfilPendente) {
          const nomeOngTemp = localStorage.getItem("temp_ong_nome");
          localStorage.removeItem("astro_perfil_pendente");
          localStorage.removeItem("temp_ong_nome");
          if (perfilPendente !== "explorador") {
            void garantirOng(
              nomeOngTemp || nomeGoogle || user.email?.split("@")[0] || "Minha ONG",
              perfilPendente
            ).catch(() => null);
          }
        }

        const [me, pets, numeros, agenda] = await Promise.all([
          buscarMe().catch(() => null),
          listarMeusAnimais().catch(() => []),
          buscarMetricas().catch(() => null),
          listarAgenda().catch(() => []),
        ]);

        if (!ativo) return;

        if (me?.ong?.nomeOrganizacao) {
          localStorage.setItem("ong_nome", me.ong.nomeOrganizacao);
        }
        setAnimais(pets);
        setMetricas(numeros);
        setLembretes(proximosCompromissos(agenda).slice(0, 3));
      } finally {
        if (ativo) setLoading(false);
      }
    }
    load();

    return () => {
      ativo = false;
    };
  }, []);

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
          {lembretes.length===0 ? (
            <div className={styles.lembreteItem} style={{color:'#999', fontStyle:'italic'}}>Nenhum lembrete por enquanto.</div>
          ) : lembretes.map((l)=>(
            <div key={l.id} className={styles.lembreteItem}>
              {new Date(l.data+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}{l.hora?` ${horaCurta(l.hora)}`:""} · {l.pet?`${l.pet}: `:""}{l.descricao}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.metricas}>
        <div className={styles.cardVerde}><strong>{metricas?.visualizacoesMes ?? 0}</strong><span>Visualizações dos seus perfis este mês</span></div>
        <div className={styles.cardRoxo}><strong>{metricas?.adocoesConcluidas ?? 0}</strong><span>Adoções concluídas</span></div>
        <Link href="/dashboard/adocoes" className={styles.cardRosa} style={{textDecoration:"none"}}><strong>{metricas?.solicitacoesPendentes ?? 0}</strong><span>Interesses para adoção</span></Link>
      </div>
      <div className={styles.petsGrid}>
        {loading ? (
          <div className={styles.vazio}><p>Carregando seus pets...</p></div>
        ) : animais.length===0? (
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