import styles from "./SobreNos.module.css";

export function SobreNos() {
  return (
    <>
      <main className={styles.sobreNos}>

        {/* BLOCO 1 */}
        <section className={styles.blocoUm}>
          <div className={styles.blocoUmTexto}>
            <h1>Surgimento de um projeto de Impacto</h1>

            <p>
              O Astro nasceu do olhar atento e do compromisso real com a causa
              animal. Tudo começou durante o desenvolvimento de um projeto
              acadêmico voltado para uma ONG dedicada exclusivamente ao
              resgate de gatos.
            </p>

            <p>
              Ao nos aprofundarmos nessa realidade, nos deparamos com um
              desafio doloroso: muitos animais passavam anos no abrigo sem
              serem adotados. A baixa rotatividade sobrecarregava a ONG,
              limitava novos resgates e aumentava os custos de manutenção, já
              que os pets cresciam e suas necessidades de saúde se tornavam
              cada vez mais complexas.
            </p>
          </div>

          <img
            src="/sobre-nos/sobre-nos-1.png"
            alt="Cachorro e gato"
            className={styles.blocoUmImagem}
          />
        </section>


        {/* BLOCO 2 */}
        <section className={styles.blocoDois}>
          <div className={styles.blocoDoisConteudo}>
            <h2>Da sala de aula para o mundo real</h2>

            <p>
              A entrega daquele projeto foi só o primeiro passo. Percebemos que
              o problema não parava nos abrigos: dentro das casas, muitos
              tutores também enfrentavam imensas dificuldades para arcar com
              tratamentos e exames veterinários, já que os planos de saúde
              animais nem sempre são acessíveis ou vantajosos.
            </p>

            <p>
              Unindo o carinho pelos animais ao desejo de resolver as dores de
              quem cuida — sejam ONGs ou tutores —, decidimos ir além. Assim
              nasceu o Astro: uma plataforma criada para transformar a forma
              como a sociedade adota, cuida e garante a saúde dos pets, do
              resgate até o lar definitivo.
            </p>
          </div>
        </section>


        {/* BLOCO 3 */}
          <section className={styles.blocoTres}>
            <div className={styles.blocoTresEsquerda}>
              <h2>O ecossistema que conecta o universo Pet</h2>

              <p>
                O Astro é o hub intermediário que une quem resgata, quem ama e
                quem oferece cuidados de saúde animal.
              </p>

              <img
                src="/sobre-nos/sobre-nos-2.png"
                alt="Pessoa segurando cachorro"
                className={styles.blocoTresImagem}
              />
            </div>

            <div className={styles.blocoTresDireita}>
              <div className={`${styles.cardBeneficio} ${styles.cardAzul}`}>
                <div className={styles.cardTitulo}>
                  <img
                    src="/sobre-nos/estrela-rosa.svg"
                    alt=""
                    className={styles.estrela}
                  />

                  <h3>Cuidado contínuo</h3>
                </div>

                <p>
                  Transformamos a plataforma em uma grande vitrine gratuita para
                  ONGs, acelerando a adoção dos resgatados.
                </p>
              </div>

              <div className={`${styles.cardBeneficio} ${styles.cardRosa}`}>
                <div className={styles.cardTitulo}>
                  <img
                    src="/sobre-nos/estrela-azul.svg"
                    alt=""
                    className={styles.estrela}
                  />

                  <h3>Democratização da saúde animal</h3>
                </div>

                <p>
                  Mapeamos e aproximamos clínicas veterinárias parceiras com
                  preços e tratamentos que cabem no bolso.
                </p>
              </div>

              <div className={`${styles.cardBeneficio} ${styles.cardBranco}`}>
                <div className={styles.cardTitulo}>
                  <img
                    src="/sobre-nos/estrela-rosa.svg"
                    alt=""
                    className={styles.estrela}
                  />

                  <h3>Aumento do alcance de doações</h3>
                </div>

                <p>
                  Unificamos ferramentas para organizar a rotina, o histórico de
                  saúde e o bem-estar do pet em todas as fases da vida.
                </p>
              </div>
            </div>
          </section>


        {/* BLOCO 4 */}
          <section className={styles.blocoQuatro}>
            <h2>Tecnologia, Parceria e rede colaborativa</h2>

            <div className={styles.recursos}>
              <div className={styles.recurso}>
                <img
                  src="/sobre-nos/vitrine-unificada.svg"
                  alt="Vitrine unificada"
                  className={styles.iconeRecurso}
                />

                <h3>
                  Vitrine unificada
                  <br />
                  & divulgação
                </h3>

                <p>
                  Atraímos um fluxo contínuo de usuários e convertemos essa
                  visibilidade em adoções rápidas para as ONGs cadastradas.
                </p>
              </div>

              <div className={styles.recurso}>
                <img
                  src="/sobre-nos/economia-gamificacao.svg"
                  alt="Economia e gamificação"
                  className={styles.iconeRecurso}
                />

                <h3 className={styles.tituloRosa}>
                  Economia &
                  <br />
                  Gamificação
                </h3>

                <p>
                  Garantimos cupons de desconto frequentes para serviços
                  veterinários e premiamos avaliações na plataforma com pontos
                  que viram novos descontos.
                </p>
              </div>

              <div className={styles.recurso}>
                <img
                  src="/sobre-nos/conexao-geolocalizao.svg"
                  alt="Conexão por geolocalização"
                  className={styles.iconeRecurso}
                />

                <h3>
                  Conexão por
                  <br />
                  Geolocalização
                </h3>

                <p>
                  Conectamos tutores e ONGs às clínicas e serviços veterinários
                  mais próximos e convenientes da sua região.
                </p>
              </div>
            </div>
          </section>

      </main>
    </>
  );
}