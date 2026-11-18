"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { supabase } from "@/lib/supabase";
import { buscarMe } from "@/lib/perfil";
import { sair } from "@/lib/sair";

type Sessao = { logado: boolean; tutor: boolean };

export function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [sessao, setSessao] = useState<Sessao>({ logado: false, tutor: false });

  useEffect(() => {
    if (typeof window !== "undefined" && pathname !== "/login" && pathname !== "/recuperar-senha") {
      const hash = window.location.hash;
      if (hash.includes("type=recovery")) {
        router.replace(`/recuperar-senha?reset=true${hash}`);
        return;
      }
    }

    async function atualizar(userId?: string, perfilMeta?: string) {
      if (!userId) return setSessao({ logado: false, tutor: false });
      const tipoLocal =
        typeof window !== "undefined" ? localStorage.getItem("tipo_usuario") : null;
      const perfilConhecido = perfilMeta || tipoLocal;

      if (perfilConhecido === "explorador") {
        setSessao({ logado: true, tutor: true });
        return;
      }

      if (
        perfilConhecido === "guardiao" ||
        perfilConhecido === "base-estelar" ||
        perfilConhecido === "estacao" ||
        perfilConhecido === "ong"
      ) {
        setSessao({ logado: true, tutor: false });
        return;
      }

      // Mostra imediatamente como logado sem esperar o servidor do Render
      setSessao({ logado: true, tutor: false });
      const tutor = await buscarMe({ timeoutMs: 4000 })
        .then((me) => Boolean(me.tutor || me.tipo === "EXPLORADOR"))
        .catch(() => false);
      setSessao({ logado: true, tutor });
    }

    supabase.auth.getSession().then(({ data }) =>
      atualizar(
        data.session?.user?.id,
        data.session?.user?.user_metadata?.perfil as string | undefined
      )
    );
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, s) => {
      if (evento === "PASSWORD_RECOVERY" && pathname !== "/login" && pathname !== "/recuperar-senha") {
        router.replace("/recuperar-senha?reset=true");
        return;
      }
      atualizar(s?.user.id, s?.user?.user_metadata?.perfil as string | undefined);
    });
    return () => subscription.unsubscribe();
  }, [pathname, router]);

  useEffect(() => {
    queueMicrotask(() => setOpen(false));
    // destrava o scroll se travou
    document.body.style.overflow = "auto";
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const goTo = (path: string) => {
    setOpen(false);
    // espera o menu fechar pra navegar - é isso que destrava
    setTimeout(() => {
      router.push(path);
    }, 50);
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logoLink}>
        <img src="/logo-gato.png" alt="Astro" className={styles.logo} />
      </Link>

      <nav className={styles.nav}>
        <Link href="/">Início</Link>
        <Link href="/sobre-nos">Sobre nós</Link>
        <Link href="/adocao-clinicas">Adoção & Clínicas</Link>
        <Link href="/ajuda">Ajuda</Link>
      </nav>

      <div className={styles.acoes}>
        <div className={styles.botoes}>
          {sessao.logado ? (
            <>
              <Link href={sessao.tutor ? "/dashboard-explorador" : "/dashboard"} className={styles.btnEntrar}>Painel</Link>
              <button type="button" onClick={sair} className={styles.btnCadastro}>Sair</button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.btnEntrar}>Entrar</Link>
              <Link href="/cadastro" className={styles.btnCadastro}>Cadastro</Link>
            </>
          )}
        </div>
      </div>

      <button className={styles.menuBtn} onClick={() => setOpen(!open)} type="button">
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className={styles.mobileMenu}>
          {/* AGORA É BUTTON, NÃO LINK - NÃO TRAVA */}
          <button onClick={() => goTo("/")} className={styles.mobileLink}>Início</button>
          <button onClick={() => goTo("/sobre-nos")} className={styles.mobileLink}>Sobre nós</button>
          <button onClick={() => goTo("/adocao-clinicas")} className={styles.mobileLink}>Adoção & Clínicas</button>
          <button onClick={() => goTo("/ajuda")} className={styles.mobileLink}>Ajuda</button>

          <div className={styles.mobileAcoes}>
            <div className={styles.botoes}>
              {sessao.logado ? (
                <>
                  <button onClick={() => goTo(sessao.tutor ? "/dashboard-explorador" : "/dashboard")} className={styles.btnEntrar}>Painel</button>
                  <button onClick={() => { setOpen(false); sair(); }} className={styles.btnCadastro}>Sair</button>
                </>
              ) : (
                <>
                  <button onClick={() => goTo("/login")} className={styles.btnEntrar}>Entrar</button>
                  <button onClick={() => goTo("/cadastro")} className={styles.btnCadastro}>Cadastro</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
