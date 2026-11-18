"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { supabase } from "@/lib/supabase";
import { buscarMe } from "@/lib/perfil";
import styles from "./dashboard.module.css";

export default function DashboardClient({ children, nomeOng }: { children: React.ReactNode; nomeOng: string }) {
  const [busca, setBusca] = useState("");
  const [fotoOng, setFotoOng] = useState<string>("");
  const [nomeExibido, setNomeExibido] = useState(nomeOng);
  const router = useRouter();
  const pathname = usePathname();
  const emMensagens = pathname === "/dashboard/mensagens";
  const emPerfil = pathname === "/dashboard/perfil";
  const semCabecalho = emMensagens || emPerfil;

  useEffect(() => {
    queueMicrotask(() => setNomeExibido(nomeOng));
  }, [nomeOng]);

  useEffect(() => {
    let ativo = true;

    function lerCacheLocal() {
      try {
        const fotoSalva = localStorage.getItem("ong_foto") || "";
        const nomeSalvo = localStorage.getItem("ong_nome") || nomeOng;
        if (ativo) {
          if (fotoSalva) setFotoOng(fotoSalva);
          if (nomeSalvo) setNomeExibido(nomeSalvo);
        }
      } catch {
        // ignora erro de leitura
      }
    }

    queueMicrotask(lerCacheLocal);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const user = data.session?.user;
        if (!ativo || !user) return;
        const avatarMeta = user.user_metadata?.avatar_url as string | undefined;
        if (avatarMeta) {
          setFotoOng((atual) => atual || avatarMeta);
        }
      })
      .catch(() => null);

    buscarMe()
      .then((me) => {
        if (!ativo) return;
        const tipoLocal = localStorage.getItem("tipo_usuario");
        const escolheuOngLocal =
          tipoLocal === "guardiao" ||
          tipoLocal === "base-estelar" ||
          tipoLocal === "estacao" ||
          tipoLocal === "ong";

        if (!escolheuOngLocal && !me.ong && (me.tutor || me.tipo === "EXPLORADOR")) {
          router.replace("/dashboard-explorador");
          return;
        }

        if (me.parceiro?.logoUrl) {
          setFotoOng(me.parceiro.logoUrl);
          try {
            localStorage.setItem("ong_foto", me.parceiro.logoUrl);
          } catch {
            // ignora
          }
        }
        if (me.ong?.nomeOrganizacao) {
          setNomeExibido(me.ong.nomeOrganizacao);
          try {
            localStorage.setItem("ong_nome", me.ong.nomeOrganizacao);
          } catch {
            // ignora
          }
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
  }, [nomeOng]);

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
                <input
                  placeholder="Procure pets..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fazerBusca()}
                />
              </div>
              <div className={styles.direita}>
                <Link
                  href="/dashboard/perfil"
                  aria-label="Abrir perfil da ONG"
                  title="Perfil da ONG"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  {fotoOng ? (
                    <img src={fotoOng} alt={nomeExibido} className={styles.fotoBolinha} />
                  ) : (
                    <div className={styles.bolinha}></div>
                  )}
                </Link>
                <strong className={styles.nomeTopo}>{nomeExibido}</strong>
              </div>
            </header>
          )}
          <div className={styles.conteudo}>{children}</div>
        </div>
      </div>
    </div>
  );
}
