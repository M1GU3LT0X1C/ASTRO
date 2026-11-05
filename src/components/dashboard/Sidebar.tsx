"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { buscarMe } from "@/lib/perfil";
import { sair } from "@/lib/sair";
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
    if (typeof window!== "undefined") return localStorage.getItem("ong_foto") || "";
    return "";
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
      const { ong, parceiro } = await buscarMe();
      if (ong?.nomeOrganizacao) {
        setNomeONG(ong.nomeOrganizacao);
        localStorage.setItem("ong_nome", ong.nomeOrganizacao);
        const pessoaNome = user.user_metadata?.full_name || user.email?.split('@')[0] || ong.nomeOrganizacao;
        localStorage.setItem("pessoa_nome", pessoaNome);
        if (parceiro?.logoUrl) {
          setFotoONG(parceiro.logoUrl);
          localStorage.setItem("ong_foto", parceiro.logoUrl);
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
      {isMobile && aberto && (
        <div className={styles.overlay} onClick={() => setAberto(false)} />
      )}

      <aside className={`${styles.sidebar} ${aberto ? styles.aberto : styles.fechado}`}>
        <div className={styles.topo}>
          <Link
            href="/perfil-ong"
            className={styles.avatarLink}
            onClick={fecharMobile}
            aria-label="Acessar perfil da ONG"
          >
            {fotoONG ? (
              <img src={fotoONG} alt={nomeONG} className={styles.avatarTopo} />
            ) : (
              <span className={styles.avatarPadrao} aria-hidden="true" />
            )}
          </Link>
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setAberto((valor) => !valor)}
            aria-label={aberto ? "Recolher menu" : "Expandir menu"}
            aria-expanded={aberto}
          >
            <Menu size={22} />
          </button>
        </div>

        <nav className={styles.nav}>
          {menu.map((item) => {
            const ativo = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!aberto ? item.label : undefined}
                onClick={fecharMobile}
                className={`${styles.item} ${ativo ? styles.ativo : ""}`}
              >
                <span
                  className={styles.iconeVetor}
                  style={{ maskImage: `url("${item.icon}")`, WebkitMaskImage: `url("${item.icon}")` }}
                  aria-hidden="true"
                />
                {aberto && <span className={styles.label}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.rodape}>
          <Link href="/" className={styles.voltar} onClick={fecharMobile}>
            {aberto ? "Voltar para o site" : "←"}
          </Link>
          <button type="button" onClick={sair} className={styles.sair} title="Sair da conta">
            <LogOut size={aberto ? 16 : 18} />
            {aberto && "Sair"}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
