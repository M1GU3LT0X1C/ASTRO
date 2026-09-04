"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import styles from "./dashboard.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [nomeOng, setNomeOng] = useState("AstroTeste");

  useEffect(() => {
    const salvo = localStorage.getItem("ong_nome");
    if (salvo) setNomeOng(salvo);
  }, []);

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.main}>
        <div className={styles.painel}>
          <header className={styles.topbar}>
            <div className={styles.busca}>
              <img src="/lupa.svg" alt="buscar" className={styles.lupaIcone} />
              <input placeholder="Procure clínicas próximas..." />
            </div>
            <div className={styles.direita}>
              <button className={styles.iconBtn}>
                <img src="/balao-dashboard.png" alt="msg" className={styles.iconeTopo} />
              </button>
              <button className={styles.iconBtn}>
                <img src="/sino-dashboard.png" alt="sino" className={styles.iconeTopo} />
              </button>
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