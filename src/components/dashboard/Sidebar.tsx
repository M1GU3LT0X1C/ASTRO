"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./Sidebar.module.css";

const menu = [
  { label: "Painel", href: "/dashboard", icon: "/painel-vetor.png" },
  { label: "Meus Pets", href: "/dashboard/meus-pets", icon: "/gato-meuspets.png" },
  { label: "Novo Pet", href: "/dashboard/novo", icon: "/mais-novo-pet.png" },
  { label: "Recompensas", href: "/dashboard/recompensas", icon: "/recompensa.png" },
  { label: "Métricas", href: "/dashboard/metricas", icon: "/metricas.png" },
  { label: "Agenda", href: "/dashboard/agenda", icon: "/agenda.png" },
  { label: "Mensagens", href: "/dashboard/mensagens", icon: "/balao-dashboard.png" },
  { label: "Configurações", href: "/dashboard/config", icon: "/configuracao.png" },
];

export function Sidebar() {
  const [aberto, setAberto] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const [nomeONG, setNomeONG] = useState(() => {
    if (typeof window!== "undefined") return localStorage.getItem("ong_nome") || "astro";
    return "astro";
  });
  const [fotoONG, setFotoONG] = useState(() => {
    if (typeof window!== "undefined") return localStorage.getItem("ong_foto") || "/logo-gato.png";
    return "/logo-gato.png";
  });

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setAberto(false); // COMEÇA FECHADA NO MOBILE
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function carregarDados() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const ultimoUser = localStorage.getItem("ultimo_user_id");
      if (ultimoUser && ultimoUser!== user.id) {
        const fotoAntiga = localStorage.getItem("ong_foto");
        localStorage.clear();
        if (fotoAntiga) localStorage.setItem("ong_foto", fotoAntiga);
      }
      localStorage.setItem("ultimo_user_id", user.id);
      const fotoGoogle = user.user_metadata?.avatar_url;
      if (fotoGoogle) {
        setFotoONG(fotoGoogle);
        localStorage.setItem("ong_foto", fotoGoogle);
      }
      const { data: ong } = await supabase.from("ongs").select("nome_organizacao, logo_url").eq("usuario_id", user.id).maybeSingle();
      if (ong?.nome_organizacao) {
        setNomeONG(ong.nome_organizacao);
        localStorage.setItem("ong_nome", ong.nome_organizacao);
        const pessoaNome = user.user_metadata?.full_name || user.email?.split('@')[0] || ong.nome_organizacao;
        localStorage.setItem("pessoa_nome", pessoaNome);
        if (ong.logo_url) {
          setFotoONG(ong.logo_url);
          localStorage.setItem("ong_foto", ong.logo_url);
        }
      } else {
        const fallback = localStorage.getItem("ong_nome") || user.user_metadata?.full_name || user.email?.split('@')[0] || "astro";
        setNomeONG(fallback);
        localStorage.setItem("ong_nome", fallback);
        if (!localStorage.getItem("pessoa_nome")) localStorage.setItem("pessoa_nome", fallback);
      }
    }
    carregarDados();
  }, []);

  const fecharMobile = () => { if (isMobile) setAberto(false); };

  return (
    <>
      {isMobile && aberto && <div className={styles.overlay} onClick={() => setAberto(false)} />}
      <aside className={`${styles.sidebar} ${aberto? styles.aberto : styles.fechado} ${isMobile? styles.mobile : ""}`}>
        <div className={styles.topo}>
          {aberto? (
            <>
              <img src={fotoONG} alt={nomeONG} className={styles.avatarTopo} />
              <span className={styles.nomeOng}>{nomeONG}</span>
            </>
          ) : (
            <img src={fotoONG} alt={nomeONG} className={styles.avatarTopoFechado} />
          )}
          <button className={styles.hamburger} onClick={() => setAberto(!aberto)}>
            <img src="/3tracinhos.png" alt="menu" className={styles.tracinhos} />
          </button>
        </div>
        <nav className={styles.nav}>
          {menu.map((item) => {
            const ativo = pathname === item.href || (item.href!== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={fecharMobile} className={`${styles.item} ${ativo? styles.ativo : ""}`}>
                <img src={item.icon} alt={item.label} className={styles.iconeVetor} />
                {aberto && <span className={styles.label}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className={styles.rodape}>
          <Link href="/" className={styles.voltar}>{aberto? "Voltar para o site" : "←"}</Link>
        </div>
      </aside>
    </>
  );
}
export default Sidebar;