import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from './adocao.module.css'

export default function AdocaoEClinicasPage() {
  const basesMaisVisitadas: any[] = [] // VAZIO POR ENQUANTO
  const estacoesBemAvaliadas: any[] = [] // VAZIO POR ENQUANTO

  return (
    <>
      <Header />
      <main className={styles.main}>

        {/* BUSCA */}
        <section className={styles.searchSection}>
          <h1>Insira sua localização e encontre novos Astros e clínicas que estão orbitando perto de você</h1>
          <p>Sua localização é usada exclusivamente para mapear ONGs e clínicas parceiras no seu bairro. O Astro não compartilha e nem faz uso indevido das suas informações.</p>
          <div className={styles.searchBox}>
            <input placeholder="Digite o seu endereço" />
            <button>Mapear<br/>Região</button>
          </div>
        </section>

        {/* ECOSSISTEMA */}
        <section className={styles.ecosystem}>
          <h2>Entenda nosso Ecossistema Local</h2>
          <div className={styles.ecoGrid}>
            <div className={styles.ecoCard}>
              <div className={styles.ecoIcon}><img src="/cadastro/base-estelar-rosa.svg" alt="Bases" /></div>
              <div>
                <strong>Bases Estelares</strong>
                <p>ONGs e abrigos estruturados de acolhimento animal</p>
              </div>
            </div>
            <div className={styles.ecoCard}>
              <div className={styles.ecoIcon}><img src="/cadastro/guardiao-rosa.svg" alt="Guardião" /></div>
              <div>
                <strong>Guardião de Órbita</strong>
                <p>Protetores independentes com lares temporários acolhedores</p>
              </div>
            </div>
            <div className={styles.ecoCard}>
              <div className={styles.ecoIcon}><img src="/cadastro/estacao-rosa.svg" alt="Estação" /></div>
              <div>
                <strong>Estações de Cuidado</strong>
                <p>Clínicas e hospitais parceiros com preços acessíveis</p>
              </div>
            </div>
          </div>
        </section>

        {/* BASES */}
        <section className={styles.listSection}>
          <h2>Bases Estelares e Guardiões mais visitados</h2>
          {basesMaisVisitadas.length === 0 ? (
            <div className={styles.vazio}>
              <p>Nenhuma base cadastrada ainda. Seja a primeira ONG a aparecer aqui!</p>
              <span>Os perfis mais visitados aparecerão aqui</span>
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {basesMaisVisitadas.map(b => <div key={b.id} className={styles.cardBase}>{b.nome}</div>)}
            </div>
          )}
        </section>

        {/* ESTAÇÕES */}
        <section className={styles.listSection}>
          <h2>Estações de Cuidado bem avaliadas</h2>
          {estacoesBemAvaliadas.length === 0 ? (
            <div className={styles.vazio}>
              <p>Nenhuma clínica avaliada ainda.</p>
              <span>As clínicas bem avaliadas aparecerão aqui</span>
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {estacoesBemAvaliadas.map(e => <div key={e.id} className={styles.cardEstacao}>{e.nome}</div>)}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </>
  )
}