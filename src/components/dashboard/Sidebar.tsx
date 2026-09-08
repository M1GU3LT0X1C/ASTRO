"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./Sidebar.module.css";

const menu = [
  { label: "Painel", href: "/dashboard", icon: "/painel-vetor.png", activeIcon: "/painel-vetor.png" },
  { label: "Meus Pets", href: "/dashboard/meus-pets", icon: "/gato-meuspets.png" },
  { label: "Novo Pet", href: "/dashboard/novo-pet", icon: "/mais-novo-pet.png" },
  { label: "Recompensas", href: "/dashboard/recompensas", icon: "/recompensa.png" },
  { label: "Métricas", href: "/dashboard/metricas", icon: "/metricas.png" },
  { label: "Agenda", href: "/dashboard/agenda", icon: "/agenda.png" },
  { label: "Mensagens", href: "/dashboard/mensagens", icon: "/balao-dashboard.png" },
  { label: "Configurações", href: "/dashboard/config", icon: "/configuracao.png" },
];

export function Sidebar() {
  const [aberto, setAberto] = useState(true);
  const pathname = usePathname();
  const [nomeONG, setNomeONG] = useState(""); // começa vazio
  const [fotoONG, setFotoONG] = useState("/logo-gato.png");

  useEffect(() => {
    async function carregarDados() {
      // 1. tenta localStorage primeiro
      const nomeSalvo = localStorage.getItem("ong_nome");
      const fotoSalva = localStorage.getItem("ong_foto");
      if (nomeSalvo) setNomeONG(nomeSalvo);
      if (fotoSalva) setFotoONG(fotoSalva);

      // 2. pega do Supabase Auth (Google)
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      const nomeGoogle = user.user_metadata?.full_name;
      const fotoGoogle = user.user_metadata?.avatar_url;

      if (fotoGoogle) {
        setFotoONG(fotoGoogle);
        localStorage.setItem("ong_foto", fotoGoogle);
      }

      // 3. pega da tabela ongs o nome oficial
      const { data: ong } = await supabase
        .from("ongs")
        .select("nome_organizacao, logo_url")
        .eq("usuario_id", user.id)
        .single();

      if (ong?.nome_organizacao) {
        setNomeONG(ong.nome_organizacao);
        localStorage.setItem("ong_nome", ong.nome_organizacao);
        if (ong.logo_url) {
          setFotoONG(ong.logo_url);
          localStorage.setItem("ong_foto", ong.logo_url);
        }
      } else if (nomeGoogle && !nomeSalvo) {
        // fallback se ainda não tem ONG criada
        setNomeONG(nomeGoogle);
        localStorage.setItem("ong_nome", nomeGoogle);
      }
    }
    carregarDados();
  }, []);

  return (
    <aside className={`${styles.sidebar} ${aberto ? styles.aberto : styles.fechado}`}>
      <div className={styles.topo}>
        {aberto ? (
          <>
            <img src={fotoONG} alt={nomeONG} className={styles.avatarTopo} />
            <span className={styles.nomeOng}>{nomeONG || "Carregando..."}</span>
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
          const ativo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.item} ${ativo ? styles.ativo : ""}`}
              title={!aberto ? item.label : undefined}
            >
              <img src={item.icon} alt={item.label} className={styles.iconeVetor} />
              {aberto && <span className={styles.label}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.rodape}>
        <Link href="/" className={styles.voltar}>
          {aberto ? "Voltar para o site" : "←"}
        </Link>
      </div>
    </aside>
  );
}
export default Sidebar;