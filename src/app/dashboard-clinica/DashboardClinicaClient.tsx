"use client";

import { usePathname } from "next/navigation";
import { SidebarClinica } from "@/components/dashboard-clinica/SidebarClinica";
import styles from "./dashboard.module.css";

export default function DashboardClinicaClient({
  children,
  nomeClinica,
}: {
  children: React.ReactNode;
  nomeClinica?: string;
}) {
  const pathname = usePathname();
  const ocultarCabecalho = pathname === "/dashboard-clinica/cupons" || pathname === "/dashboard-clinica/metricas" || pathname === "/dashboard-clinica/servicos/novo" || pathname === "/dashboard-clinica/config" || pathname.startsWith("/dashboard-clinica/config/");

  return (
    <div className={styles.container}>
      <SidebarClinica />
      <div className={styles.main}>
        <div className={styles.painel}>
          {!ocultarCabecalho && (
            <header className={styles.topbar}>
              <div className={styles.direita}>
                <span className={styles.bolinha} aria-hidden="true" />
                <strong className={styles.nomeTopo}>{nomeClinica || "Clínica"}</strong>
              </div>
            </header>
          )}
          <main className={styles.conteudo}>{children}</main>
        </div>
      </div>
    </div>
  );
}
