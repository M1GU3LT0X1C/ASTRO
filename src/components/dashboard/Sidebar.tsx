"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./Sidebar.module.css";

const menu = [
  { label: "Painel", href: "/dashboard", icon: "/painel-vetor.png", activeIcon: "/painel-vetor.png" },
  { label: "Meus Pets", href: "/dashboard/pets", icon: "/gato-meuspets.png" },
  { label: "Novo Pet", href: "/dashboard/novo", icon: "/mais-novo-pet.png" },
  { label: "Recompensas", href: "/dashboard/recompensas", icon: "/balao-dashboard.png" },
  { label: "Métricas", href: "/dashboard/metricas", icon: "/metricas.png" },
  { label: "Agenda", href: "/dashboard/agenda", icon: "/agenda.png" },
  { label: "Mensagens", href: "/dashboard/mensagens", icon: "/balao-dashboard.png" },
  { label: "Configurações", href: "/dashboard/config", icon: "/configuracao.png" },
];

export function Sidebar() {
  const [aberto, setAberto] = useState(true);
  const pathname = usePathname();
  const [nomeONG, setNomeONG] = useState("AstroTeste");
  const [fotoONG, setFotoONG] = useState("/logo-gato.png");

  useEffect(() => {
    const nomeSalvo = localStorage.getItem("ong_nome");
    const fotoSalva = localStorage.getItem("ong_foto");
    if (nomeSalvo) setNomeONG(nomeSalvo);
    if (fotoSalva) setFotoONG(fotoSalva);
  }, []);

  return (
    <aside className={`${styles.sidebar} ${aberto ? styles.aberto : styles.fechado}`}>
      {/* TOPO */}
      <div className={styles.topo}>
        {aberto ? (
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

      {/* MENU */}
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