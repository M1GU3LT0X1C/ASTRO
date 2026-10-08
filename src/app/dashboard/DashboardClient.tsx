"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import styles from "./dashboard.module.css";

export default function DashboardClient({ children, nomeOng }: { children: React.ReactNode, nomeOng: string }) {
  const [busca, setBusca] = useState("");
  const router = useRouter();

  const fazerBusca = () => {
    if (!busca.trim()) return;
    router.push(`/dashboard/meus-pets?busca=${encodeURIComponent(busca)}`);
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.main}>
        <div className={styles.painel}>
          <header className={styles.topbar}>
            <div className={styles.busca}>
              <img src="/lupa.svg" alt="buscar" className={styles.lupaIcone} onClick={fazerBusca} />
              <input placeholder="Procure pets..." value={busca} onChange={(e)=>setBusca(e.target.value)} onKeyDown={(e)=> e.key === "Enter" && fazerBusca()} />
            </div>
            <div className={styles.direita}>
              <div className={styles.bolinha}></div>
              <strong className={styles.nomeTopo}>{nomeOng}</strong>
            </div>
          </header>
          <div className={styles.conteudo}>{children}</div>
        </div>
      </div>
    </div>
  );
}