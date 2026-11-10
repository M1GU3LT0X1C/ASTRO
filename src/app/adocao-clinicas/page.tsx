
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "./adocao.module.css";
import ListaDestaques from "./ListaDestaques";

export default function AdocaoEClinicasPage() {
  return (
    <>
      <Header />

      <main className={styles.main}>
        {/* ===== BLOCO 1 - BUSCA ===== */}
        <section className={styles.searchSection}>
          <h1>
            Insira sua localização e encontre novos Astros e
            clínicas que estão orbitando perto de você
          </h1>

          <p>
            Sua localização é usada exclusivamente para mapear
            ONGs e clínicas parceiras no seu bairro. O Astro
            não compartilha e nem faz uso indevido das suas
            informações.
          </p>

          
          <form
            className={styles.searchBox}
            action="/adocao-clinicas/resultados"
            method="GET"
          >
            <input
              type="text"
              name="endereco"
              placeholder="Digite o seu endereço"
              aria-label="Digite o seu endereço"
              required
              maxLength={200}
            />

            <button type="submit">
              Mapear Região
            </button>
          </form>

        </section>

        {/* ===== BLOCO 2 - ECOSSISTEMA ===== */}
        <section className={styles.ecosystem}>
          <h2>Entenda nosso Ecossistema Local</h2>

          <div className={styles.ecoGrid}>
            {/* BASES ESTELARES */}
            <div className={styles.ecoCard}>
              <div className={styles.ecoIcon}>
                <img
                  src="/cadastro/base-estelar-rosa.svg"
                  alt="Bases Estelares"
                />
              </div>

              <div>
                <strong>Bases Estelares</strong>
                <p>
                  ONGs e abrigos estruturados de
                  acolhimento animal
                </p>
              </div>
            </div>

            {/* GUARDIÃO DE ÓRBITA */}
            <div className={styles.ecoCard}>
              <div className={styles.ecoIcon}>
                <img
                  src="/cadastro/guardiao-rosa.svg"
                  alt="Guardião de Órbita"
                />
              </div>

              <div>
                <strong>Guardião de Órbita</strong>
                <p>
                  Protetores independentes com lares
                  temporários acolhedores
                </p>
              </div>
            </div>

            {/* ESTAÇÕES DE CUIDADO */}
            <div className={styles.ecoCard}>
              <div className={styles.ecoIcon}>
                <img
                  src="/cadastro/estacao-rosa.svg"
                  alt="Estações de Cuidado"
                />
              </div>

              <div>
                <strong>Estações de Cuidado</strong>
                <p>
                  Clínicas e hospitais parceiros com
                  preços acessíveis
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== BLOCO 3 - BASES ESTELARES ===== */}
        <section className={styles.listSection}>
          <h2>Bases Estelares e Guardiões mais visitados</h2>

          <ListaDestaques
            tipo="bases"
            ordem="visitas"
            textoVazio="Nenhuma base visitada ainda. Seja a primeira ONG a aparecer aqui!"
            dicaVazio="Os perfis mais visitados aparecerão aqui"
          />
        </section>

        {/* ===== BLOCO 4 - ESTAÇÕES DE CUIDADO ===== */}
        <section className={styles.listSection}>
          <h2>Estações de Cuidado bem avaliadas</h2>

          <ListaDestaques
            tipo="clinicas"
            ordem="avaliacao"
            textoVazio="Nenhuma clínica avaliada ainda."
            dicaVazio="As clínicas bem avaliadas aparecerão aqui"
          />
        </section>
      </main>

      <Footer />
    </>
  );
}
