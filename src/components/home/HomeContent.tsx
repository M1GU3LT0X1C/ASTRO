import styles from "./HomeContent.module.css"
import Link from "next/link"

export function HomeContent() {
  return (
    <div className={styles.container}>
      {/* HERO TOP */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>Astro</h1>
          <h2>O ecossistema completo para você<br /> encontrar e cuidar do seu pet<span className={styles.bold}> na sua órbita.</span></h2>
          <p>Conectamos você a ONGs da sua região para adoção e às clínicas veterinárias mais acessíveis perto de você. Tudo em um só lugar, para o seu pet gravitar sempre com saúde e carinho.</p>
          <div className={styles.heroActions}>
            <Link href="/animais" className={styles.btnPrimary}>Encontrar meu pet</Link>
            <Link href="/sobre" className={styles.btnSecondary}>Buscar clínicas próximas</Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src="/dog-astro.png" alt="Gato e cachorro" />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className={styles.comoFunciona}>
        <h2 className={styles.sectionTitle}>Como o Astro funciona?</h2>
        <div className={styles.gridFunciona}>
          <div className={`${styles.card} ${styles.cardLight}`}>
            <h3><span>✦</span> Adoção Consciente & Divulgação</h3>
            <p>Facilitamos a conexão entre ONGs, abrigos e adotantes, com filtros inteligentes para você encontrar o pet ideal. Uma vitrine completa para dar mais visibilidade aos animais.</p>
          </div>
          <div className={`${styles.card} ${styles.cardDark}`}>
            <h3><span>✦</span> Saúde Acessível, Cupons e Recompensas</h3>
            <p>Acesso a uma rede de clínicas parceiras, cupons de desconto exclusivos e cashback que retornam como créditos para você usar em serviços de saúde e bem-estar.</p>
            <div className={styles.badgePercent}>%</div>
          </div>
          <div className={`${styles.card} ${styles.cardPink}`}>
            <h3><span>✦</span> Cuidado Contínuo na Sua Órbita</h3>
            <p>Carteira de vacinação digital, lembretes de vermifugação, histórico de consultas e dicas personalizadas. Tudo para manter a saúde do seu pet em dia.</p>
          </div>
        </div>
      </section>

      {/* UNIVERSO PET */}
      <section className={styles.universo}>
        <div>
          <h2>O universo pet gravita aqui!</h2>
          <p>Nascemos para reinventar a forma como cuidamos e adotamos: nenhum pet deve ficar sem um lar e nenhum tutor deve escolher entre a saúde do seu amigo e o próprio bolso. <br /> Conectamos <strong>quem ama, quem resgata e quem cuida</strong> para garantir que o carinho e a saúde estejam ao alcance de todos.</p>
        </div>
        <Link href="/sobre" className={styles.btnUniverso}>Conheça nossa história</Link>
      </section>

      {/* IMPACTO - COM BORDAS DO FIGMA */}
      <section className={styles.impacto}>
        <h2 className={styles.impactoTitle}>O impacto que estamos construindo</h2>
        <div className={styles.gridImpacto}>
          
          <div className={`${styles.impactoCard} ${styles.bordaRoxa}`}>
            <div className={styles.impactoIcon}>🐱</div>
            <h4>Adoção sem Fronteiras</h4>
            <p>Criando uma ponte direta entre ONGs e tutores, multiplicando as chances de cada pet encontrar um lar definitivo.</p>
          </div>

          <div className={`${styles.impactoCard} ${styles.bordaRosa}`}>
            <div className={styles.impactoIcon}>❤️</div>
            <h4>Saúde que Cabe no Bolso</h4>
            <p>Mapeamento de clínicas parceiras com opções acessíveis na sua região para que o cuidado veterinário nunca precise ser adiado.</p>
          </div>

          <div className={`${styles.impactoCard} ${styles.bordaRoxa}`}>
            <div className={styles.impactoIcon}>%</div>
            <h4>Recompensas por Cuidar</h4>
            <p>Um sistema de pontos e cupons frequentes onde a sua avaliação sobre um atendimento gera descontos reais para as próximas consultas.</p>
          </div>

          <div className={`${styles.impactoCard} ${styles.bordaRosa}`}>
            <div className={styles.impactoIcon}>🐾</div>
            <h4>Órbita de Proteção</h4>
            <p>Acompanhamento prático da saúde do seu amigo, facilitando a rotina de exames, vacinas e tratamentos preventivos.</p>
          </div>

        </div>
      </section>
    </div>
  )
}