
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, RefreshCw, Search } from "lucide-react";
import { SidebarExplorador } from "@/components/dashboard-explorador/SidebarExplorador";
import styles from "./dashboard.module.css";

type DashboardExploradorClientProps = {
  children: React.ReactNode;
  nomeExplorador: string;
};

export default function DashboardExploradorClient({
  children,
  nomeExplorador,
}: DashboardExploradorClientProps) {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  function fazerBusca() {
    if (!busca.trim()) return;

    router.push(
      `/adocao-clinicas?busca=${encodeURIComponent(
        busca.trim()
      )}`
    );
  }

  return (
    <div className={styles.container}>
      {/* SIDEBAR */}

      <SidebarExplorador />

      {/* CONTEÚDO PRINCIPAL */}

      <div className={styles.main}>
        <div className={styles.painel}>
          {/* CABEÇALHO DO DASHBOARD */}

          <header className={styles.topbar}>
            {/* CAMPO DE BUSCA */}

            <div className={styles.busca}>
              <Search size={17} aria-hidden="true" />

              <input
                type="search"
                placeholder="Procure clínicas próximas..."
                aria-label="Pesquisar clínicas"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fazerBusca();
                  }
                }}
              />
            </div>

            {/* AÇÕES DO CABEÇALHO */}

            <div className={styles.direita}>
              <button
                type="button"
                className={styles.iconBtn}
                aria-label="Atualizar página"
                title="Atualizar página"
                onClick={() => router.refresh()}
              >
                <RefreshCw size={19} />
              </button>

              <button
                type="button"
                className={styles.iconBtn}
                aria-label="Notificações"
                title="Notificações"
              >
                <Bell size={19} />
              </button>

              {/* PERFIL DO EXPLORADOR */}

              <div className={styles.usuario}>
                <Link
                  href="/perfil-explorador"
                  aria-label="Acessar meu perfil"
                  title="Meu perfil"
                >
                  <span className={styles.avatar} />
                </Link>

                <strong className={styles.nomeTopo}>
                  {nomeExplorador}
                </strong>
              </div>
            </div>
          </header>

          {/* CONTEÚDO DAS PÁGINAS */}

          <main className={styles.conteudo}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
