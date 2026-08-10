import styles from "./Footer.module.css"

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topo}>
        <h2 className={styles.titulo}>Pronto para entrar na órbita do Astro?</h2>
        <p className={styles.descricao}>
          O cadastro no Astro é 100% gratuito para tutores, ONGs e clínicas. Junte-se a nós para transformar o cuidado animal e aproximar quem ama, quem resgata e quem cuida!
        </p>

        <div className={styles.lista}>
          <div className={styles.item}>
            <div className={styles.icone}>🏠</div>
            <div><b className={styles.itemTitulo}>É uma ONG?</b><p className={styles.itemTexto}>Cadastre seus bichinhos na nossa vitrine e amplie seu alcance de adoções.</p></div>
          </div>
          <div className={styles.item}>
            <div className={styles.icone}>👤</div>
            <div><b className={styles.itemTitulo}>É um tutor?</b><p className={styles.itemTexto}>Encontre seu novo amigo e cuide da saúde dele com descontos e praticidade.</p></div>
          </div>
          <div className={styles.item}>
            <div className={styles.icone}>+</div>
            <div><b className={styles.itemTitulo}>É uma clínica?</b><p className={styles.itemTexto}>Conecte-se a tutores da sua região e mostre seu trabalho na comunidade.</p></div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitulo}>Crie sua conta Astro</h3>
        <input className={styles.input} placeholder="Seu nome..." />
        <input className={styles.input} placeholder="Seu e-mail..." />
        <input className={styles.input} placeholder="Sua senha..." type="password" />
        <button className={styles.botao}>Continuar</button>
      </div>
    </footer>
  )
}