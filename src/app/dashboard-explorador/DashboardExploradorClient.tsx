"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarExplorador } from "@/components/dashboard-explorador/SidebarExplorador";
import { supabase } from "@/lib/supabase";
import { buscarPerfil } from "@/lib/explorador";
import { garantirTutor } from "@/lib/perfil";
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
  const [fotoExplorador, setFotoExplorador] = useState<string | null>(null);
  const [nomeExibido, setNomeExibido] = useState(nomeExplorador);

  useEffect(() => {
    queueMicrotask(() => setNomeExibido(nomeExplorador));
  }, [nomeExplorador]);

  useEffect(() => {
    let ativo = true;

    function lerCacheLocal() {
      try {
        const fotoDireta = localStorage.getItem("explorador_foto");
        const nomeSalvo = localStorage.getItem("pessoa_nome");
        const cacheBruto = localStorage.getItem("astro_perfil_explorador_cache");
        const cache = cacheBruto ? JSON.parse(cacheBruto) : null;
        const fotoFinal = cache?.fotoUrl || fotoDireta || null;
        const nomeFinal = cache?.nome || nomeSalvo || nomeExplorador;
        if (ativo) {
          if (fotoFinal) setFotoExplorador(fotoFinal);
          if (nomeFinal) setNomeExibido(nomeFinal);
        }
      } catch {
        // ignora erro de leitura do localStorage
      }
    }

    queueMicrotask(lerCacheLocal);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const user = data.session?.user;
        if (!ativo || !user) return;
        const avatarMeta = user.user_metadata?.avatar_url as string | undefined;
        const nomeMeta =
          (user.user_metadata?.nome as string | undefined) ||
          (user.user_metadata?.full_name as string | undefined);
        if (avatarMeta) {
          setFotoExplorador((atual) => atual || avatarMeta);
        }
        if (nomeMeta) {
          setNomeExibido((atual) => (atual && atual !== "Explorador" ? atual : nomeMeta));
        }
      })
      .catch(() => null);

    buscarPerfil()
      .then((perfil) => {
        if (!ativo) return;
        if (perfil.fotoUrl) {
          setFotoExplorador(perfil.fotoUrl);
          try {
            localStorage.setItem("explorador_foto", perfil.fotoUrl);
          } catch {
            // ignora
          }
        }
        if (perfil.nome) {
          setNomeExibido(perfil.nome);
        }
      })
      .catch(() => {
        garantirTutor(nomeExplorador).catch(() => null);
      });

    window.addEventListener("astro-perfil-atualizado", lerCacheLocal);
    window.addEventListener("storage", lerCacheLocal);
    window.addEventListener("focus", lerCacheLocal);
    return () => {
      ativo = false;
      window.removeEventListener("astro-perfil-atualizado", lerCacheLocal);
      window.removeEventListener("storage", lerCacheLocal);
      window.removeEventListener("focus", lerCacheLocal);
    };
  }, [nomeExplorador]);

  function fazerBusca() {
    const termo = busca.trim();
    if (!termo) {
      router.push("/dashboard-explorador/clinicas");
      return;
    }
    router.push(`/dashboard-explorador/clinicas?busca=${encodeURIComponent(termo)}`);
  }

  return (
    <div className={styles.container}>
      <SidebarExplorador />

      <div className={styles.main}>
        <div className={styles.painel}>
          {!emMensagens && (
            <header className={styles.topbar}>
              <form
                className={styles.busca}
                onSubmit={(event) => {
                  event.preventDefault();
                  fazerBusca();
                }}
                role="search"
              >
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
                <Link
                  href="/perfil-explorador"
                  className={styles.avatarLink}
                  aria-label="Abrir perfil do Explorador"
                  title="Perfil do Explorador"
                >
                  {fotoExplorador ? (
                    <img
                      src={fotoExplorador}
                      alt={nomeExibido}
                      className={styles.fotoBolinha}
                    />
                  ) : (
                    <span className={styles.bolinha} />
                  )}
                </Link>
                <strong className={styles.nomeTopo}>{nomeExibido}</strong>
              </div>
            </header>
          )}

          <main className={styles.conteudo}>{children}</main>
        </div>
      </div>
    </div>
  );
}
