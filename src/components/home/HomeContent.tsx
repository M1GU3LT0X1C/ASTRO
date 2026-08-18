import styles from "./HomeContent.module.css";
import Link from "next/link";

export function HomeContent() {
  return (
    <div className={styles.container}>

      {/* =========================
          BLOCO 1 - HERO
      ========================= */}
      <section className={styles.hero}>

        <div className={styles.heroText}>
          <h1>Astro</h1>

          <h2>
            O ecossistema completo para você
            <br />
            encontrar e cuidar do seu pet{" "}
            <span className={styles.bold}>na sua órbita.</span>
          </h2>

          <p>
            Conectamos você às ONGs da sua região para adoção e às clínicas
            veterinárias mais acessíveis perto de você. Tudo em um só lugar,
            para o seu pet gravitar sempre com saúde e carinho.
          </p>

          <div className={styles.heroActions}>
            <Link href="/animais" className={styles.btnPrimary}>
              Encontrar meu pet
            </Link>

            <Link href="/animais" className={styles.btnSecondary}>
              Buscar clínicas próximas
            </Link>
          </div>
        </div>

        <div className={styles.heroImage}>
          <img
            src="/dog-astro.png"
            alt="Pet em destaque no Astro"
          />
        </div>

      </section>


      {/* =========================
          BLOCO 2 - COMO FUNCIONA
      ========================= */}
      <section className={styles.comoFunciona}>

        <div className={styles.comoFuncionaConteudo}>

          <h2 className={styles.sectionTitle}>
            Como o Astro funciona?
          </h2>

          <div className={styles.gridFunciona}>

            {/* CARD BRANCO */}
            <div className={`${styles.card} ${styles.cardLight}`}>

              <div className={styles.cardTituloLinha}>
                <span
                  className={`${styles.estrela} ${styles.estrelaRosa}`}
                >
                  ✦
                </span>

                <h3>
                  Adoção Consciente & Divulgação
                </h3>
              </div>

              <p>
                As ONGs cadastram os bichinhos que precisam de um lar. Nós
                cuidamos de toda a divulgação para que a história de cada um
                chegue até você sem burocracia.
              </p>

            </div>


            {/* CARD ROSA */}
            <div className={`${styles.card} ${styles.cardPink}`}>

              <div className={styles.cardTituloLinha}>
                <span
                  className={`${styles.estrela} ${styles.estrelaAzul}`}
                >
                  ✦
                </span>

                <h3>
                  Cuidado Contínuo na Sua Órbita
                </h3>
              </div>

              <p>
                Acompanhe os cuidados de saúde do seu amigo e garanta que
                ele tenha a melhor qualidade de vida com a previsibilidade e
                proteção que ele merece.
              </p>

            </div>


            {/* CARD AZUL */}
            <div className={`${styles.card} ${styles.cardDark}`}>

              <div className={styles.cardTituloLinha}>
                <span
                  className={`${styles.estrela} ${styles.estrelaRosa}`}
                >
                  ✦
                </span>

                <h3>
                  Saúde Acessível, Cupons & Recompensas
                </h3>
              </div>

              <p className={styles.cardDarkPrimeiroTexto}>
                Encontre clínicas veterinárias na sua região e aproveite cupons
                exclusivos disponibilizados frequentemente para ONGs e tutores
                cadastrados.
              </p>

              <div className={styles.cardDarkInferior}>

                <p className={styles.cardDarkSegundoTexto}>
                  Além disso, ao consultar seu pet pelas clínicas do nosso
                  sistema e deixar sua avaliação, você e as ONGs acumulam
                  pontos que podem ser trocados por descontos nas próximas
                  consultas e tratamentos!
                </p>

                <div className={styles.cupomArea}>
                  <img
                    src="/home/cupom.svg"
                    alt=""
                    className={styles.cupom}
                  />
                </div>

              </div>

            </div>

          </div>
        </div>

      </section>


      {/* =========================
          BLOCO 3 - UNIVERSO PET
      ========================= */}
      <section className={styles.universoWrapper}>

        <div className={styles.universo}>

          <div className={styles.universoTexto}>

            <h2>
              O universo pet gravita aqui!
            </h2>

            <p>
              Nascemos para reinventar a forma como cuidamos e adotamos:
              nenhum pet deve ficar sem um lar e nenhum tutor deve escolher
              entre a saúde do seu amigo e o próprio bolso.
            </p>

            <p>
              Conectamos{" "}
              <strong>
                quem ama, quem resgata e quem cuida
              </strong>{" "}
              para garantir que o carinho e a saúde estejam ao alcance de todos.
            </p>

          </div>

          <Link
            href="/sobre-nos"
            className={styles.btnUniverso}
          >
            Conheça nossa história
          </Link>

        </div>

      </section>


      {/* =========================
          BLOCO 4 - IMPACTO
      ========================= */}
      <section className={styles.impacto}>

        <h2 className={styles.impactoTitle}>
          O impacto que estamos construindo
        </h2>

        <div className={styles.gridImpacto}>


          {/* ADOÇÃO */}
          <div
            className={`${styles.impactoCard} ${styles.bordaRoxa}`}
          >

            <img
              src="/home/adocao.svg"
              alt=""
              className={styles.impactoIcon}
            />

            <h3>
              Adoção sem Fronteiras
            </h3>

            <p>
              Criando uma ponte direta entre ONGs parceiras e tutores,
              multiplicando as chances de cada pet encontrar um lar definitivo.
            </p>

          </div>


          {/* SAÚDE */}
          <div
            className={`${styles.impactoCard} ${styles.bordaRosa}`}
          >

            <img
              src="/home/saude.svg"
              alt=""
              className={styles.impactoIcon}
            />

            <h3>
              Saúde que Cabe no Bolso
            </h3>

            <p>
              Mapeamento de clínicas parceiras com opções acessíveis na sua
              região para que o cuidado veterinário nunca precise ser adiado.
            </p>

          </div>


          {/* RECOMPENSAS */}
          <div
            className={`${styles.impactoCard} ${styles.bordaRoxa}`}
          >

            <img
              src="/home/recompensas.svg"
              alt=""
              className={styles.impactoIcon}
            />

            <h3>
              Recompensas por Cuidar
            </h3>

            <p>
              Um sistema de pontos e cupons frequentes onde a sua avaliação
              sobre um atendimento gera descontos reais para as próximas
              consultas.
            </p>

          </div>


          {/* ÓRBITA */}
          <div
            className={`${styles.impactoCard} ${styles.bordaRosa}`}
          >

            <img
              src="/home/orbita.svg"
              alt=""
              className={styles.impactoIcon}
            />

            <h3>
              Órbita de Proteção
            </h3>

            <p>
              Acompanhamento prático da saúde do seu amigo, facilitando a
              rotina de exames, vacinas e tratamentos preventivos.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}