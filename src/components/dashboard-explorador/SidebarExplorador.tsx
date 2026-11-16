"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { buscarPerfil } from "@/lib/explorador";
import { sair } from "@/lib/sair";
import styles from "./SidebarExplorador.module.css";

const menu = [
  { label: "Painel", href: "/dashboard-explorador", icon: "/painel-vetor.png" },
  { label: "Meus Pets & Saúde", href: "/dashboard-explorador/meus-pets", icon: "/gato-meuspets.png" },
  { label: "Estações & Clínicas", href: "/dashboard-explorador/clinicas", icon: "/ver-estacao.svg" },
  { label: "Meu Carrinho", href: "/dashboard-explorador/carrinho", icon: "/cupom-ativo.svg" },
  { label: "Meus Favoritos", href: "/dashboard-explorador/favoritos", icon: "/meus-favs.svg" },
  { label: "Minhas adoções", href: "/dashboard-explorador/adocoes", icon: "/adocaos.svg" },
  { label: "Recompensas & Pontos", href: "/dashboard-explorador/recompensas", icon: "/recompensa.png" },
  { label: "Agenda", href: "/dashboard-explorador/agenda", icon: "/agenda.png" },
  { label: "Mensagens", href: "/dashboard-explorador/mensagens", icon: "/balao-dashboard.png" },
  { label: "Configurações", href: "/dashboard-explorador/config", icon: "/configuracao.png" },
];

export function SidebarExplorador() {
  const pathname = usePathname();

  const [aberto, setAberto] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [fotoExplorador, setFotoExplorador] = useState<string | null>(null);

  useEffect(() => {
    function verificarTela() {
      const mobile = window.innerWidth <= 768;

      setIsMobile(mobile);

      if (mobile) {
        setAberto(false);
      }
    }

    verificarTela();

    window.addEventListener("resize", verificarTela);

    return () => {
      window.removeEventListener("resize", verificarTela);
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    function lerCacheLocal() {
      try {
        const fotoDireta = localStorage.getItem("explorador_foto");
        const cacheBruto = localStorage.getItem("astro_perfil_explorador_cache");
        const cache = cacheBruto ? JSON.parse(cacheBruto) : null;
        const fotoFinal = cache?.fotoUrl || fotoDireta || null;
        if (ativo && fotoFinal) {
          setFotoExplorador(fotoFinal);
        }
      } catch {
        // ignora erro de leitura
      }
    }

    lerCacheLocal();

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!ativo || !data.user) return;
        const avatarMeta = data.user.user_metadata?.avatar_url as string | undefined;
        if (avatarMeta) {
          setFotoExplorador((atual) => atual || avatarMeta);
        }
      })
      .catch(() => null);

    buscarPerfil()
      .then((perfil) => {
        if (!ativo || !perfil.fotoUrl) return;
        setFotoExplorador(perfil.fotoUrl);
        try {
          localStorage.setItem("explorador_foto", perfil.fotoUrl);
        } catch {
          // ignora
        }
      })
      .catch(() => null);

    window.addEventListener("astro-perfil-atualizado", lerCacheLocal);
    window.addEventListener("storage", lerCacheLocal);
    window.addEventListener("focus", lerCacheLocal);
    return () => {
      ativo = false;
      window.removeEventListener("astro-perfil-atualizado", lerCacheLocal);
      window.removeEventListener("storage", lerCacheLocal);
      window.removeEventListener("focus", lerCacheLocal);
    };
  }, []);

  function fecharMobile() {
    if (isMobile) {
      setAberto(false);
    }
  }

  return (
    <>
      {isMobile && aberto && (
        <div
          className={styles.overlay}
          onClick={() => setAberto(false)}
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          aberto ? styles.aberto : styles.fechado
        }`}
      >
        {/* TOPO DO SIDEBAR */}

        <div className={styles.topo}>
          <Link
            href="/perfil-explorador"
            className={styles.avatarLink}
            aria-label="Acessar meu perfil"
            title="Meu perfil"
            onClick={fecharMobile}
          >
            {fotoExplorador ? (
              <img
                src={fotoExplorador}
                alt="Foto do Explorador"
                className={styles.avatarTopo}
              />
            ) : (
              <span className={styles.avatar} />
            )}
          </Link>

          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setAberto(!aberto)}
            aria-label={
              aberto ? "Recolher menu" : "Expandir menu"
            }
            aria-expanded={aberto}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* MENU DE NAVEGAÇÃO */}

        <nav className={styles.nav}>
          {menu.map((item) => {

            const ativo =
              pathname === item.href ||
              (item.href !== "/dashboard-explorador" &&
                pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!aberto ? item.label : undefined}
                onClick={fecharMobile}
                className={`${styles.item} ${
                  ativo ? styles.ativo : ""
                }`}
              >
                <span
                  className={styles.iconeVetor}
                  style={{ maskImage: `url("${item.icon}")`, WebkitMaskImage: `url("${item.icon}")` }}
                  aria-hidden="true"
                />

                {aberto && (
                  <span className={styles.label}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* RODAPÉ DO SIDEBAR */}

        <div className={styles.rodape}>
          <Link
            href="/"
            className={styles.voltar}
            onClick={fecharMobile}
            title="Voltar para o site"
          >
            {aberto ? "Voltar para o site" : "←"}
          </Link>

          <button
            type="button"
            onClick={sair}
            className={styles.sair}
            title="Sair da conta"
          >
            {aberto ? (
              <>
                <LogOut size={16} />
                Sair
              </>
            ) : (
              <LogOut size={18} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default SidebarExplorador;
