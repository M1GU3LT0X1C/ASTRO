
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Cat,
  Gift,
  ChartNoAxesColumn,
  CalendarDays,
  MessageCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { sair } from "@/lib/sair";
import styles from "./SidebarExplorador.module.css";

const menu = [
  {
    label: "Painel",
    href: "/dashboard-explorador",
    icon: LayoutDashboard,
  },
  {
    label: "Meus Pets",
    href: "/dashboard-explorador/meus-pets",
    icon: Cat,
  },
  {
    label: "Recompensas & Pontos",
    href: "/dashboard-explorador/recompensas",
    icon: Gift,
  },
  {
    label: "Métricas",
    href: "/dashboard-explorador/metricas",
    icon: ChartNoAxesColumn,
  },
  {
    label: "Agenda",
    href: "/dashboard-explorador/agenda",
    icon: CalendarDays,
  },
  {
    label: "Mensagens",
    href: "/dashboard-explorador/mensagens",
    icon: MessageCircle,
  },
  {
    label: "Configurações",
    href: "/dashboard-explorador/config",
    icon: Settings,
  },
];

export function SidebarExplorador() {
  const pathname = usePathname();

  const [aberto, setAberto] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
            <span className={styles.avatar} />
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
            const Icone = item.icon;

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
                <Icone
                  size={20}
                  className={styles.icone}
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
