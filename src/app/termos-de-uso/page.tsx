"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "./TermosDeUso.module.css";

type CategoriaTermo =
  | "elegibilidade"
  | "ecossistema"
  | "adocao"
  | "ocorrencias"
  | "beneficios"
  | "conduta";

type SecaoTermo = {
  id: string;
  numero: string;
  categoria: CategoriaTermo;
  titulo: string;
  destaque?: boolean;
  paragrafos: string[];
  itens?: string[];
  alerta?: string;
  mostrarPerfis?: boolean;
};

const topicos: { id: CategoriaTermo; label: string; cor: "azul" | "rosa" }[] = [
  { id: "elegibilidade", label: "Maioridade (+18) e Cadastro", cor: "rosa" },
  { id: "ecossistema", label: "Perfis e Escopo do Astro", cor: "azul" },
  { id: "adocao", label: "Adoção Responsável", cor: "rosa" },
  { id: "ocorrencias", label: "Ocorrências e Resgates", cor: "azul" },
  { id: "beneficios", label: "Clínicas, Cupons, Doações e Premium", cor: "rosa" },
  { id: "conduta", label: "Segurança e Condutas Proibidas", cor: "azul" },
];

const secoesTermos: SecaoTermo[] = [
  {
    id: "aceitacao-escopo",
    numero: "01",
    categoria: "ecossistema",
    titulo: "Aceitação dos Termos e Escopo da Plataforma",
    paragrafos: [
      "Bem-vindo(a) ao Astro (AstroPets)! Estes Termos e Condições Gerais de Uso regulam o acesso e a utilização da nossa plataforma web desenvolvida no modelo B2B2C (SocialTech e PetTech), cujo objetivo é conectar tutores e adotantes, Organizações Não Governamentais (ONGs), protetores independentes e clínicas veterinárias em um único ecossistema.",
      "Ao criar uma conta, navegar pelo catálogo ou utilizar qualquer funcionalidade da plataforma, você declara ter lido, compreendido e aceitado integralmente as regras estabelecidas neste documento e na nossa Política de Privacidade.",
    ],
    alerta:
      "Importante: O Astro atua exclusivamente como ferramenta tecnológica de intermediação, divulgação e apoio. A plataforma não realiza resgate físico, transporte de animais, abrigo próprio nem atendimento médico-veterinário direto.",
  },
  {
    id: "elegibilidade-maioridade",
    numero: "02",
    categoria: "elegibilidade",
    titulo: "Restrição Etária: Proibido para Menores de 18 Anos",
    destaque: true,
    paragrafos: [
      "A criação de conta e o uso das funcionalidades cadastrais da plataforma Astro são estritamente restritos a pessoas físicas maiores de 18 (dezoito) anos completos e plenamente capazes na forma da legislação civil brasileira, ou representantes legais devidamente autorizados de pessoas jurídicas.",
      "Não é permitida, em nenhuma hipótese, a criação de conta por menores de 18 anos — seja como Explorador (adotante/tutor), Guardião de Órbita (protetor independente) ou responsável por instituição parceira, tendo em vista que a guarda responsável de animais e a assinatura de termos de adoção exigem maioridade civil.",
    ],
    itens: [
      "Ao se cadastrar no Astro, o usuário declara sob as penas da lei possuir 18 (dezoito) anos completos ou mais.",
      "Para adotar um animal, o usuário deverá comprovar maioridade (+18 anos) mediante documento oficial com foto e comprovante de residência diretamente à ONG ou protetor responsável.",
      "Contas identificadas com dados pertencentes a menores de 18 anos ou com informações falsas de idade serão imediatamente bloqueadas e excluídas da plataforma sem aviso prévio.",
    ],
  },
  {
    id: "perfis-cadastro",
    numero: "03",
    categoria: "ecossistema",
    titulo: "Perfis de Usuário, Cadastro e Segurança de Acesso",
    paragrafos: [
      "Para orbitar em nossa comunidade, o usuário deve selecionar o perfil que corresponde à sua atuação e fornecer informações verdadeiras, completas e atualizadas (nome ou razão social, e-mail válido, telefone, CEP e, para perfis parceiros, CPF ou CNPJ). Contas institucionais passam por verificação antes da liberação completa das permissões.",
    ],
    mostrarPerfis: true,
    itens: [
      "Credenciais de acesso: A senha criada é pessoal e intransferível, devendo cumprir os requisitos mínimos de segurança (de 8 a 18 caracteres, letras maiúsculas, minúsculas, números e caractere especial). Também disponibilizamos autenticação integrada via Google OAuth.",
      "Proteção contra acessos indevidos: Por segurança, o sistema aplica bloqueio temporário automático (Rate Limit) caso sejam identificadas múltiplas tentativas consecutivas de login com falha.",
    ],
  },
  {
    id: "adocao-responsavel",
    numero: "04",
    categoria: "adocao",
    titulo: "Intermediação de Adoção, Triagem e Guarda Responsável",
    paragrafos: [
      "O Astro disponibiliza uma vitrine digital unificada para divulgação de cães e gatos disponíveis para adoção responsável, exibindo fotos, idade, porte, sexo, comportamento, histórico de vacinação, castração, localização aproximada e, no caso de felinos, informações declaradas sobre diagnóstico de FIV (Vírus da Imunodeficiência Felina) e FeLV (Vírus da Leucemia Felina).",
      "Embora a plataforma ofereça filtros inteligentes de busca e triagem automatizada de compatibilidade e geolocalização, toda a condução final do processo de adoção — incluindo entrevista, avaliação de perfil, visita ao lar, assinatura do Termo de Responsabilidade e entrega do animal — pertence exclusivamente à Base Estelar (ONG) ou ao Guardião de Órbita responsável pelo pet.",
    ],
    itens: [
      "Gratuidade e proibição de venda: É terminantemente proibida a comercialização ou cobrança pela venda de animais dentro do ecossistema Astro.",
      "Veracidade das informações do pet: As ONGs e protetores são integralmente responsáveis pela precisão dos dados de saúde, temperamento e status vacinal informados no perfil de cada animal.",
      "Vinculação de adoção e microchip: Quando concretizada a adoção ou informado número de identificação de microchip, os dados ficam vinculados para fins de histórico e segurança, lembrando que o microchip é um identificador cadastral e não fornece rastreamento GPS em tempo real.",
    ],
  },
  {
    id: "ocorrencias-rua",
    numero: "05",
    categoria: "ocorrencias",
    titulo: "Registro de Ocorrências, Animais Perdidos e Orientações",
    paragrafos: [
      "A plataforma permite que usuários autenticados registrem ocorrências de animais perdidos, encontrados, feridos ou em situação de rua mediante envio de foto, descrição e localização (via GPS autorizado ou preenchimento manual), notificando Bases Estelares e Guardiões em raio próximo.",
    ],
    itens: [
      "Disponibilidade das ONGs: O registro de uma ocorrência na plataforma não gera obrigação de resgate imediato pelas ONGs notificadas, que atuam de acordo com sua capacidade física, financeira e disponibilidade operacional, podendo encerrar o chamado após o acolhimento.",
      "Orientações e recursos de IA: Os conteúdos educativos sobre primeiros cuidados para animais feridos e eventuais recursos de correspondência visual por Inteligência Artificial possuem caráter estritamente informativo e auxiliar, não substituindo o diagnóstico ou o atendimento presencial por médico-veterinário.",
      "É vedado o registro de ocorrências falsas (trotes), imagens manipuladas ou endereços inexistentes, sob pena de banimento definitivo da conta.",
    ],
  },
  {
    id: "clinicas-cupons-doacoes-premium",
    numero: "06",
    categoria: "beneficios",
    titulo: "Estações de Cuidado, Cupons, Doações e Assinatura Premium",
    paragrafos: [
      "Para sustentar e expandir o impacto social da rede mantendo o acesso às funcionalidades essenciais de adoção 100% gratuito, o Astro integra benefícios comunitários, canais de apoio às ONGs e recursos opcionais:",
    ],
    itens: [
      "Cupons e Sistema de Pontos: Tutores e ONGs podem resgatar cupons promocionais oferecidos pelas Estações de Cuidado (clínicas parceiras) e acumular pontos ao avaliar atendimentos realizados. A prestação do serviço médico-veterinário e o cumprimento da oferta anunciada são de responsabilidade exclusiva da clínica parceira.",
      "Doações para ONGs: O usuário pode visualizar listas de materiais solicitados pelas instituições ou apoiar financeiramente via PIX ou cartão. O usuário deve sempre conferir os dados da instituição destinatária antes de confirmar a transferência.",
      "Modalidade Premium: Usuários e parceiros podem contratar planos opcionais de assinatura Premium para desbloquear personalizações visuais de perfil (temas, banners, cores e molduras) e recursos extras de destaque. Em caso de cancelamento ou expiração da assinatura, o perfil retorna automaticamente ao visual padrão sem perda das funções essenciais de adoção.",
    ],
  },
  {
    id: "condutas-proibidas",
    numero: "07",
    categoria: "conduta",
    titulo: "Obrigações do Usuário, Upload de Imagens e Condutas Proibidas",
    paragrafos: [
      "O Astro promove a guarda responsável e o respeito incondicional à vida animal. Ao enviar fotos, mensagens ou cadastros na plataforma, o usuário compromete-se a respeitar a legislação brasileira vigente, incluindo a Lei de Crimes Ambientais (Lei nº 9.605/1998 e Lei nº 14.064/2020 — Lei Sansão).",
    ],
    itens: [
      "Não utilizar a plataforma para abandonar animais, incentivar maus-tratos, promover rinhas, realizar comércio ilegal de espécies ou solicitar vantagens financeiras indevidas.",
      "Enviar apenas fotografias reais e pertinentes aos animais cadastrados ou às ocorrências relatadas, sendo proibido o upload de conteúdo ofensivo, violento, ilegal ou que viole direitos de terceiros.",
      "Não tentar burlar mecanismos de autenticação, políticas de segurança do banco de dados (Row Level Security), limites de requisição ou acessar áreas restritas a outros perfis.",
    ],
  },
  {
    id: "disponibilidade-disposicoes-gerais",
    numero: "08",
    categoria: "conduta",
    titulo: "Disponibilidade do Sistema, Propriedade Intelectual e Foro",
    paragrafos: [
      "A equipe técnica do Astro trabalha para manter a plataforma disponível 24 horas por dia, 7 dias por semana (com meta mínima de 95% de disponibilidade), podendo ocorrer manutenções programadas ou interrupções temporárias decorrentes de serviços de infraestrutura em nuvem.",
      "Todos os elementos visuais, logotipos, mascotes, textos, códigos-fonte e arquitetura do sistema Astro são protegidos pela legislação de propriedade intelectual, sendo vedada sua reprodução ou engenharia reversa sem autorização expressa.",
      "Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer dúvida, comunicação ou solicitação poderá ser encaminhada diretamente ao nosso canal oficial de atendimento: contato@astropets.com.br.",
    ],
  },
];

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function TermosDeUsoPage() {
  const [busca, setBusca] = useState("");
  const [topicoAtivo, setTopicoAtivo] = useState<CategoriaTermo | null>(null);

  const irParaSecao = (secaoId: string) => {
    setBusca("");
    setTopicoAtivo(null);
    setTimeout(() => {
      document.getElementById(secaoId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const secoesFiltradas = useMemo(() => {
    const termo = normalizarTexto(busca);
    return secoesTermos.filter((secao) => {
      const matchCategoria = !topicoAtivo || secao.categoria === topicoAtivo;
      if (!termo) return matchCategoria;

      const textoPerfis = secao.mostrarPerfis
        ? "explorador tutor adotante guardiao de orbita protetor independente cpf base estelar ong abrigo cnpj estacao de cuidado clinica hospital veterinario"
        : "";

      const blocoCompleto = normalizarTexto(
        [
          secao.numero,
          secao.titulo,
          ...secao.paragrafos,
          ...(secao.itens ?? []),
          secao.alerta ?? "",
          textoPerfis,
        ].join(" ")
      );

      return matchCategoria && blocoCompleto.includes(termo);
    });
  }, [busca, topicoAtivo]);

  return (
    <>
      <Header />

      <main className={styles.pagina}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroTopo}>
            <span className={styles.badge}>
              <span className={styles.badgeEstrela} aria-hidden="true">
                ✦
              </span>
              Documentação Legal • AstroPets
            </span>

            <nav
              className={styles.switchLegal}
              aria-label="Alternar entre Central de Ajuda e documentos legais"
            >
              <Link href="/ajuda" className={styles.switchItem}>
                Central de Ajuda
              </Link>
              <Link
                href="/termos-de-uso"
                className={`${styles.switchItem} ${styles.switchAtivo}`}
                aria-current="page"
              >
                Termos de Uso
              </Link>
              <Link
                href="/politica-de-privacidade"
                className={styles.switchItem}
              >
                Política de Privacidade
              </Link>
            </nav>
          </div>

          <h1>
            Termos e Condições Gerais de Uso do{" "}
            <span className={styles.destaqueRosa}>Astro</span>
          </h1>

          <p className={styles.heroSubtitulo}>
            Conheça as regras de convivência, responsabilidades e diretrizes que
            protegem adotantes, ONGs, protetores independentes, clínicas
            veterinárias e, acima de tudo, o bem-estar dos animais na nossa
            órbita.
          </p>

          <div className={styles.metaInfo}>
            <span>
              <strong className={styles.metaDot}>✦</strong> Vigência: Outubro de
              2026
            </span>
            <span>
              <strong className={styles.metaDot}>✦</strong> Público: Exclusivo
              para maiores de 18 anos
            </span>
            <span>
              <strong className={styles.metaDot}>✦</strong> Conformidade: Marco
              Civil da Internet & LGPD
            </span>
          </div>
        </section>

        {/* FAIXA DE RESUMO RÁPIDO */}
        <section className={styles.faixaResumo} aria-label="Resumo dos termos">
          <div className={styles.faixaConteudo}>
            <h2 className={styles.faixaTitulo}>
              <span>✦</span> O essencial que você precisa saber
            </h2>

            <div className={styles.gridResumo}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => irParaSecao("elegibilidade-maioridade")}
                onKeyDown={(e) =>
                  e.key === "Enter" && irParaSecao("elegibilidade-maioridade")
                }
                className={`${styles.cardResumo} ${styles.cardRosa}`}
              >
                <span className={styles.tagIdade}>OBRIGATÓRIO +18 ANOS</span>
                <div className={styles.cardResumoTopo}>
                  <span
                    className={`${styles.estrelaCard} ${styles.estrelaBranca}`}
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  <h2>Proibido para menores de 18 anos</h2>
                </div>
                <p>
                  Não permitimos a criação de conta nem solicitações de adoção
                  por menores de 18 anos. A guarda responsável exige maioridade
                  civil plena.
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => irParaSecao("aceitacao-escopo")}
                onKeyDown={(e) =>
                  e.key === "Enter" && irParaSecao("aceitacao-escopo")
                }
                className={`${styles.cardResumo} ${styles.cardAzul}`}
              >
                <div className={styles.cardResumoTopo}>
                  <span
                    className={`${styles.estrelaCard} ${styles.estrelaRosa}`}
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  <h2>Hub de Conexão e Apoio</h2>
                </div>
                <p>
                  O Astro conecta tutores, abrigos e clínicas, mas não realiza
                  resgate físico ou transporte. A triagem e entrega do pet são
                  feitas pela ONG ou protetor.
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => irParaSecao("adocao-responsavel")}
                onKeyDown={(e) =>
                  e.key === "Enter" && irParaSecao("adocao-responsavel")
                }
                className={`${styles.cardResumo} ${styles.cardRosa}`}
              >
                <div className={styles.cardResumoTopo}>
                  <span
                    className={`${styles.estrelaCard} ${styles.estrelaBranca}`}
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  <h2>Adoção 100% Gratuita e Ética</h2>
                </div>
                <p>
                  As funcionalidades essenciais de busca e adoção são gratuitas.
                  É estritamente proibida qualquer forma de venda ou comércio de
                  animais no site.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BUSCA E PILLS DE FILTRO */}
        <section className={styles.navegacaoSecao}>
          <div className={styles.buscaContainer}>
            <div className={styles.buscaWrap}>
              <img
                src="/lupa.svg"
                alt=""
                aria-hidden="true"
                className={styles.buscaIcone}
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    document
                      .getElementById("lista-clausulas-termos")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                placeholder="Pesquisar nos Termos (ex: 18 anos, adoção, cupom, ONG)..."
                aria-label="Pesquisar nos Termos de Uso"
                className={styles.buscaInput}
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className={styles.limparBusca}
                  aria-label="Limpar pesquisa"
                >
                  ✕
                </button>
              )}
            </div>

            {(busca.trim() !== "" || topicoAtivo !== null) && (
              <span className={styles.statusBusca}>
                ✦ Exibindo {secoesFiltradas.length} de {secoesTermos.length}{" "}
                cláusulas
              </span>
            )}
          </div>

          <p className={styles.labelTopicos}>
            Filtrar cláusulas por tema (clique novamente para exibir todas):
          </p>
          <div className={styles.pills}>
            {topicos.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  setTopicoAtivo(topicoAtivo === t.id ? null : t.id)
                }
                className={`${styles.pill} ${
                  t.cor === "azul" ? styles.pillAzul : styles.pillRosa
                } ${topicoAtivo === t.id ? styles.pillAtivo : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* SEÇÕES DETALHADAS */}
        <section id="lista-clausulas-termos" className={styles.conteudo}>
          {secoesFiltradas.length === 0 ? (
            <div className={styles.semResultado}>
              <p>
                Nenhuma cláusula encontrada para &ldquo;{busca}&rdquo; neste
                filtro.
              </p>
              <button
                type="button"
                className={styles.btnLimpar}
                onClick={() => {
                  setBusca("");
                  setTopicoAtivo(null);
                }}
              >
                Mostrar todos os Termos de Uso
              </button>
            </div>
          ) : (
            secoesFiltradas.map((secao) => (
              <article
                key={secao.id}
                id={secao.id}
                className={`${styles.cardSecao} ${
                  secao.destaque ? styles.cardSecaoDestaque : ""
                }`}
              >
                <div className={styles.secaoHeader}>
                  <span className={styles.numeroSecao}>{secao.numero}</span>
                  <h2>{secao.titulo}</h2>
                </div>

                {secao.paragrafos.map((paragrafo, idx) => (
                  <p key={idx}>{paragrafo}</p>
                ))}

                {secao.mostrarPerfis && (
                  <div className={styles.gridPerfis}>
                    <div className={styles.perfilItem}>
                      <strong>Explorador</strong>
                      <span>Tutor / Adotante (+18 anos)</span>
                      <p>
                        Pessoa física maior de 18 anos que busca adotar um pet,
                        favoritar animais, registrar ocorrências e utilizar
                        cupons em clínicas parceiras.
                      </p>
                    </div>

                    <div className={styles.perfilItem}>
                      <strong>Guardião de Órbita</strong>
                      <span>Protetor Independente (CPF)</span>
                      <p>
                        Pessoa física maior de 18 anos que atua de forma
                        autônoma no resgate, acolhimento em lar temporário e
                        divulgação responsável de animais.
                      </p>
                    </div>

                    <div className={styles.perfilItem}>
                      <strong>Base Estelar</strong>
                      <span>ONG / Abrigo Estruturado (CNPJ/CPF)</span>
                      <p>
                        Organização sem fins lucrativos ou abrigo de proteção
                        animal que gerencia vitrine de pets, capacidade de
                        lotação, ocorrências e doações.
                      </p>
                    </div>

                    <div className={styles.perfilItem}>
                      <strong>Estação de Cuidado</strong>
                      <span>Clínica / Hospital Veterinário</span>
                      <p>
                        Estabelecimento ou profissional veterinário parceiro que
                        divulga serviços de saúde animal acessíveis e oferece
                        descontos à comunidade.
                      </p>
                    </div>
                  </div>
                )}

                {secao.itens && (
                  <ul className={styles.listaItens}>
                    {secao.itens.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}

                {secao.alerta && (
                  <div className={styles.alertaBox}>{secao.alerta}</div>
                )}
              </article>
            ))
          )}

          {/* CTA FINAL */}
          <div className={styles.ctaFinal}>
            <div className={styles.ctaTexto}>
              <h2>Ficou com alguma dúvida sobre os nossos Termos?</h2>
              <p>
                Nossa equipe está pronta para ajudar você. Consulte também nossa
                Política de Privacidade para entender como protegemos seus dados
                pessoais conforme a LGPD.
              </p>
            </div>

            <div className={styles.ctaBotoes}>
              <Link href="/politica-de-privacidade" className={styles.btnRosa}>
                Ver Política de Privacidade
              </Link>
              <Link href="/ajuda" className={styles.btnOutline}>
                Central de Ajuda
              </Link>
              <a
                href="mailto:contato@astropets.com.br"
                className={styles.btnOutline}
              >
                contato@astropets.com.br
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
