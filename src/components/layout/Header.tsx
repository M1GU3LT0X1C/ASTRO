"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import styles from "./Header.module.css";

export function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
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
        <div className={styles.busca}>
          <img src="/lupa.svg" alt="" className={styles.buscaIcone} />
          <input type="text" className={styles.buscaInput} aria-label="Pesquisar" />
        </div>
        <div className={styles.botoes}>
          <Link href="/login" className={styles.btnEntrar}>Entrar</Link>
          <Link href="/cadastro" className={styles.btnCadastro}>Cadastro</Link>
        </div>
      </div>

      <button className={styles.menuBtn} onClick={() => setOpen(!open)} type="button">
        {open? "✕" : "☰"}
      </button>

      {open && (
        <div className={styles.mobileMenu}>
          {/* AGORA É BUTTON, NÃO LINK - NÃO TRAVA */}
          <button onClick={() => goTo("/")} className={styles.mobileLink}>Início</button>
          <button onClick={() => goTo("/sobre-nos")} className={styles.mobileLink}>Sobre nós</button>
          <button onClick={() => goTo("/adocao-clinicas")} className={styles.mobileLink}>Adoção & Clínicas</button>
          <button onClick={() => goTo("/ajuda")} className={styles.mobileLink}>Ajuda</button>

          <div className={styles.mobileAcoes}>
            <div className={styles.mobileBusca}>
              <img src="/lupa.svg" alt="" className={styles.buscaIcone} />
              <input type="text" className={styles.buscaInput} placeholder="Pesquisar" />
            </div>
            <div className={styles.botoes}>
              <button onClick={() => goTo("/login")} className={styles.btnEntrar}>Entrar</button>
              <button onClick={() => goTo("/cadastro")} className={styles.btnCadastro}>Cadastro</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;