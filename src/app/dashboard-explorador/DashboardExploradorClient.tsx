"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarExplorador } from "@/components/dashboard-explorador/SidebarExplorador";
import styles from "./dashboard.module.css";

type Props = {
  children: React.ReactNode;
  nomeExplorador: string;
};

export default function DashboardExploradorClient({ children, nomeExplorador }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const emMensagens = pathname === "/dashboard-explorador/mensagens";
  const [busca, setBusca] = useState("");

  function fazerBusca() {
    const termo = busca.trim();
    if (!termo) return;
    router.push(`/adocao-clinicas?busca=${encodeURIComponent(termo)}`);
  }

  return (
    <div className={styles.container}>
      <SidebarExplorador />

      <div className={styles.main}>
        <div className={styles.painel}>
          {!emMensagens && (
          <header className={styles.topbar}>
            <form className={styles.busca} onSubmit={(event) => { event.preventDefault(); fazerBusca(); }} role="search">
              <button type="submit" className={styles.botaoBusca} aria-label="Pesquisar clínicas">
                <img
                  src="/lupa.svg"
                  alt=""
                  width={16}
                  height={16}
                  style={{
                    width: "16px",
                    height: "16px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </button>
              <input
                type="search"
                placeholder="Procure clínicas próximas..."
                aria-label="Pesquisar clínicas"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </form>

            <div className={styles.direita}>
              <Link href="/perfil-explorador" className={styles.avatarLink} aria-label="Abrir perfil do Explorador" title="Perfil do Explorador">
                <span className={styles.bolinha} />
              </Link>
              <strong className={styles.nomeTopo}>{nomeExplorador}</strong>
            </div>
          </header>
          )}

          <main className={styles.conteudo}>{children}</main>
        </div>
      </div>
    </div>
  );
}
