import Link from "next/link"
import styles from "./Header.module.css"

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logoLink}>
        <img src="/logo-gato.png" alt="Astro" className={styles.logo} />
      </Link>

      <nav className={styles.nav}>
        <Link href="/">Início</Link>
        <Link href="/">Sobre nós</Link>
        <Link href="/animais">Adoção & Clínicas</Link>
        <Link href="/">Ajuda</Link>
      </nav>

      <div className={styles.acoes}>
        <div className={styles.busca}>
          <input className={styles.buscaInput} placeholder="Pesquisar..."/>
          <span className={styles.buscaIcone}>🔍</span>
        </div>
        <div className={styles.botoes}>
          <Link href="/login" className={styles.btnEntrar}>Entrar</Link>
          <Link href="/cadastro" className={styles.btnCadastro}>Cadastro</Link>
        </div>
      </div>
    </header>
  )
}