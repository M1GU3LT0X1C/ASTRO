import Link from "next/link";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      
      {/* LOGO */}
      <Link href="/" className={styles.logoLink}>
        <img
          src="/logo-gato.png"
          alt="Astro"
          className={styles.logo}
        />
      </Link>


      {/* NAVEGAÇÃO */}
      <nav className={styles.nav}>
        <Link href="/">Início</Link>
        <Link href="/sobre-nos">Sobre nós</Link>
        <Link href="/animais">Adoção & Clínicas</Link>
        <Link href="/">Ajuda</Link>
      </nav>


      {/* ÁREA DIREITA */}
      <div className={styles.acoes}>

        {/* BUSCA */}
        <div className={styles.busca}>
          <img
            src="/lupa.svg"
            alt=""
            className={styles.buscaIcone}
          />

          <input
            type="text"
            className={styles.buscaInput}
            aria-label="Pesquisar"
          />
        </div>


        {/* ENTRAR / CADASTRO */}
        <div className={styles.botoes}>
          <Link href="/login" className={styles.btnEntrar}>
            Entrar
          </Link>

          <Link href="/cadastro" className={styles.btnCadastro}>
            Cadastro
          </Link>
        </div>

      </div>
    </header>
  );
}