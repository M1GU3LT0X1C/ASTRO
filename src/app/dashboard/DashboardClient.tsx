"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import styles from "./dashboard.module.css";

export default function DashboardClient({ children, nomeOng }: { children: React.ReactNode, nomeOng: string }) {
  const [busca, setBusca] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const emMensagens = pathname === "/dashboard/mensagens";
  const emPerfil = pathname === "/dashboard/perfil";
  const semCabecalho = emMensagens || emPerfil;

  const fazerBusca = () => {
    if (!busca.trim()) return;
    router.push(`/dashboard/meus-pets?busca=${encodeURIComponent(busca)}`);
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.main}>
        <div className={`${styles.painel} ${semCabecalho ? styles.painelSemCabecalho : ""}`}>
          {!semCabecalho && (
          <header className={styles.topbar}>
            <div className={styles.busca}>
              <img src="/lupa.svg" alt="buscar" className={styles.lupaIcone} onClick={fazerBusca} />
              <input placeholder="Procure pets..." value={busca} onChange={(e)=>setBusca(e.target.value)} onKeyDown={(e)=> e.key === "Enter" && fazerBusca()} />
            </div>
            <div className={styles.direita}>
              <Link href="/dashboard/perfil" aria-label="Abrir perfil da ONG" title="Perfil da ONG" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",textDecoration:"none",cursor:"pointer"}}><div className={styles.bolinha}></div></Link>
              <strong className={styles.nomeTopo}>{nomeOng}</strong>
            </div>
          </header>
          )}
          <div className={styles.conteudo}>{children}</div>
        </div>
      </div>
    </div>
  );
}