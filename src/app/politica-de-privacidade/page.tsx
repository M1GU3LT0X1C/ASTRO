"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "./PoliticaDePrivacidade.module.css";

type CategoriaPrivacidade =
  | "dados"
  | "menores"
  | "finalidades"
  | "seguranca"
  | "cookies"
  | "direitos";

type SecaoPrivacidade = {
  id: string;
  numero: string;
  categoria: CategoriaPrivacidade;
  titulo: string;
  destaque?: boolean;
  paragrafos: string[];
  itens?: string[];
  alerta?: string;
  mostrarDadosGrid?: boolean;
  mostrarDireitosGrid?: boolean;
};

const topicos: {
  id: CategoriaPrivacidade;
  label: string;
  cor: "azul" | "rosa";
}[] = [
  { id: "dados", label: "Dados Coletados", cor: "azul" },
  { id: "menores", label: "Vedação a Menores de 18 Anos", cor: "rosa" },
  { id: "finalidades", label: "Geolocalização e Finalidades", cor: "azul" },
  { id: "seguranca", label: "Segurança, RLS e Infraestrutura", cor: "rosa" },
  { id: "cookies", label: "Cookies e Sessão", cor: "azul" },
  { id: "direitos", label: "Seus Direitos (LGPD)", cor: "rosa" },
];

const secoesPrivacidade: SecaoPrivacidade[] = [
  {
    id: "compromisso-lgpd",
    numero: "01",
    categoria: "dados",
    titulo: "Compromisso com a Privacidade e a LGPD",
    paragrafos: [
      "O Astro (AstroPets) tem como missão conectar quem ama, quem resgata e quem cuida dos animais com total transparência, ética e segurança digital. Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos os seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei Federal nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014).",
      "O tratamento de dados realizado na plataforma observa estritamente os princípios da finalidade, adequação, necessidade, livre acesso, transparência e segurança, limitando-se ao mínimo indispensável para viabilizar a adoção responsável, o registro de ocorrências e o acesso a clínicas veterinárias parceiras.",
    ],
  },
  {
    id: "dados-coletados",
    numero: "02",
    categoria: "dados",
    titulo: "Quais Dados Coletamos na Plataforma",
    paragrafos: [
      "Os dados coletados variam de acordo com o perfil escolhido pelo usuário no momento do cadastro e com as funcionalidades utilizadas dentro do ecossistema Astro:",
    ],
    mostrarDadosGrid: true,
    itens: [
      "Autenticação via Google (OAuth): Caso opte por entrar com sua conta Google, recebemos apenas os identificadores básicos autorizados por você (nome, endereço de e-mail e identificador de autenticação).",
      "Fotos e Registros de Animais: Imagens enviadas via upload para o catálogo de adoção ou registro de animais em situação de rua, histórico de saúde do pet (vacinação, castração, status de FIV/FeLV) e eventual número de microchip.",
      "Histórico de Interações: Animais favoritados, preferências de filtragem, agendamentos e avaliações de atendimento realizadas nas Estações de Cuidado.",
    ],
  },
  {
    id: "proibicao-menores-18",
    numero: "03",
    categoria: "menores",
    titulo: "Proteção e Proibição de Cadastro para Menores de 18 Anos",
    destaque: true,
    paragrafos: [
      "A plataforma Astro é destinada exclusivamente a pessoas maiores de 18 (dezoito) anos completos. Não permitimos a criação de contas por crianças ou adolescentes (menores de 18 anos) e não coletamos nem tratamos intencionalmente dados pessoais de menores de idade.",
      "Essa restrição visa proteger tanto os direitos de proteção integral de crianças e adolescentes quanto a segurança jurídica dos processos de adoção, guarda responsável e parcerias institucionais.",
    ],
    itens: [
      "Bloqueio e exclusão imediata: Caso seja identificado que um cadastro foi realizado por pessoa menor de 18 anos, a conta será imediatamente desativada e todos os dados pessoais associados serão eliminados de forma segura do nosso banco de dados.",
      "Canal para pais e responsáveis: Se você for pai, mãe ou responsável legal e tomar conhecimento de que um menor de 18 anos forneceu dados pessoais na plataforma, entre em contato imediatamente pelo e-mail contato@astropets.com.br para providenciarmos a exclusão prioritária.",
    ],
  },
  {
    id: "finalidades-geolocalizacao",
    numero: "04",
    categoria: "finalidades",
    titulo: "Finalidades do Tratamento e Uso da Geolocalização",
    paragrafos: [
      "O Astro não comercializa, não aluga e não faz uso indevido das suas informações pessoais. Todos os dados coletados possuem finalidades claras e legítimas dentro do ecossistema:",
    ],
    itens: [
      "Mapeamento Regional e Geolocalização: Seu CEP ou sua localização aproximada (capturada via GPS apenas mediante sua permissão explícita no navegador, ou informada manualmente) são utilizados exclusivamente para exibir animais disponíveis para adoção perto de você, localizar clínicas parceiras no seu bairro e notificar ONGs em raio próximo sobre ocorrências de animais em situação de rua.",
      "Triagem e Compatibilidade: Cruzamento das preferências informadas pelo adotante com os perfis de animais cadastrados para facilitar encontros compatíveis e responsáveis.",
      "Conexão entre Adotante e ONG/Protetor: Compartilhamento dos dados necessários de contato quando o usuário inicia uma solicitação de adoção ou vinculação com o responsável pelo animal.",
      "Segurança e Prevenção a Fraudes: Verificação de contas institucionais (Bases Estelares, Guardiões e Estações de Cuidado) e controle de acesso individualizado por perfil.",
    ],
    alerta:
      "Você pode revogar a permissão de geolocalização do navegador a qualquer momento nas configurações do seu dispositivo e continuar utilizando a busca por endereço ou CEP manualmente.",
  },
  {
    id: "compartilhamento-infraestrutura",
    numero: "05",
    categoria: "seguranca",
    titulo: "Compartilhamento de Dados e Operadores Tecnológicos",
    paragrafos: [
      "Para manter a plataforma rápida, segura e disponível 24 horas por dia, contamos com provedores de infraestrutura em nuvem que atuam como operadores de dados sob padrões rigorosos de segurança:",
    ],
    itens: [
      "Supabase & PostgreSQL: Utilizados para autenticação segura de usuários, armazenamento de arquivos de imagem (Storage) e gerenciamento do banco de dados relacional PostgreSQL.",
      "Back-end Java (Spring Boot): Camada servidora responsável pela validação de tokens de sessão e processamento das regras de negócio entre os perfis.",
      "Vercel: Plataforma de hospedagem e entrega segura da aplicação web em Next.js.",
      "Visibilidade Pública de Parceiros: Dados comerciais e de contato público informados por Bases Estelares (ONGs) e Estações de Cuidado (clínicas) ficam visíveis na vitrine da plataforma para que tutores possam encontrá-los.",
    ],
  },
  {
    id: "seguranca-informacao",
    numero: "06",
    categoria: "seguranca",
    titulo: "Segurança da Informação e Blindagem Técnica",
    paragrafos: [
      "Adotamos medidas técnicas e administrativas alinhadas às melhores práticas de engenharia de software para proteger seus dados contra acessos não autorizados, perda, alteração ou divulgação indevida:",
    ],
    itens: [
      "Row Level Security (RLS): Todas as tabelas sensíveis do banco de dados contam com políticas ativas de segurança em nível de linha (RLS), garantindo que cada usuário acesse apenas os registros autorizados para o seu perfil.",
      "Criptografia em Trânsito e HSTS: Toda a comunicação entre o seu navegador, nosso front-end e nossas APIs ocorre sob protocolo criptografado HTTPS com política estrita de HTTP Strict Transport Security (HSTS).",
      "Defesa contra Força Bruta (Rate Limit): O formulário de autenticação bloqueia temporariamente o acesso por 15 minutos após 5 tentativas consecutivas de senha incorreta para o mesmo e-mail.",
      "Isolamento Server-Side e Middleware: As rotas de painel (/dashboard, /dashboard-explorador e /perfil-explorador) têm a sessão validada diretamente no servidor antes da renderização.",
    ],
  },
  {
    id: "cookies-armazenamento",
    numero: "07",
    categoria: "cookies",
    titulo: "Cookies e Armazenamento Local no Navegador",
    paragrafos: [
      "Utilizamos apenas cookies estritamente necessários e recursos de armazenamento local do navegador (localStorage e sessionStorage) para garantir a estabilidade da sua sessão e melhorar sua experiência:",
    ],
    itens: [
      "Cookies de Sessão (Supabase SSR): Mantêm você autenticado com segurança durante a navegação entre as páginas restritas da plataforma.",
      "Armazenamento Local (localStorage): Registra o tipo de perfil ativo para direcionamento correto do painel, favoritos locais temporários e o contador de proteção contra tentativas excessivas de login.",
      "Armazenamento de Sessão (sessionStorage): Preserva temporariamente os dados iniciais digitados durante a transição entre as etapas da tela de cadastro, sendo limpo assim que o registro é concluído.",
    ],
  },
  {
    id: "direitos-titular-lgpd",
    numero: "08",
    categoria: "direitos",
    titulo: "Seus Direitos como Titular de Dados (Art. 18 da LGPD)",
    paragrafos: [
      "Em total respeito ao artigo 18 da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você possui controle sobre as suas informações pessoais e pode exercer, a qualquer momento e gratuitamente, os seguintes direitos:",
    ],
    mostrarDireitosGrid: true,
    alerta:
      "Como exercer seus direitos: Você pode atualizar seus dados cadastrais (nome, e-mail, senha e CEP) diretamente na área 'Minha Conta / Configurações' do seu painel, ou enviar uma solicitação formal de acesso, portabilidade ou exclusão de dados para contato@astropets.com.br.",
  },
  {
    id: "retencao-contato",
    numero: "09",
    categoria: "direitos",
    titulo: "Retenção, Exclusão de Dados e Canal de Contato",
    paragrafos: [
      "Seus dados pessoais são mantidos apenas pelo período em que sua conta estiver ativa ou pelo tempo necessário para cumprir as finalidades descritas nesta Política e eventuais obrigações legais (como o prazo de guarda de registros de acesso previsto no Marco Civil da Internet).",
      "Quando você solicita a exclusão da sua conta, seus dados pessoais são removidos ou anonimizados de nossas bases operacionais, ressalvadas as hipóteses legais de conservação.",
      "Para dúvidas, solicitações relacionadas à LGPD ou comunicações sobre privacidade, entre em contato com nossa equipe pelo canal oficial: contato@astropets.com.br.",
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

export default function PoliticaDePrivacidadePage() {
  const [busca, setBusca] = useState("");
  const [topicoAtivo, setTopicoAtivo] = useState<CategoriaPrivacidade | null>(
    null
  );

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
    return secoesPrivacidade.filter((secao) => {
      const matchCategoria = !topicoAtivo || secao.categoria === topicoAtivo;
      if (!termo) return matchCategoria;

      const textoDados = secao.mostrarDadosGrid
        ? "explorador tutor adotante dados cadastrais basicos nome completo email telefone cep senha guardiao de orbita protetor cpf base estelar ong abrigo cnpj instagram estacao de cuidado clinica hospital veterinario"
        : "";

      const textoDireitos = secao.mostrarDireitosGrid
        ? "confirmacao e acesso art 18 lgpd correcao e atualizacao minha conta anonimizacao ou eliminacao exclusao revogacao do consentimento"
        : "";

      const blocoCompleto = normalizarTexto(
        [
          secao.numero,
          secao.titulo,
          ...secao.paragrafos,
          ...(secao.itens ?? []),
          secao.alerta ?? "",
          textoDados,
          textoDireitos,
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
              Privacidade & LGPD • AstroPets
            </span>

            <nav
              className={styles.switchLegal}
              aria-label="Alternar entre Central de Ajuda e documentos legais"
            >
              <Link href="/ajuda" className={styles.switchItem}>
                Central de Ajuda
              </Link>
              <Link href="/termos-de-uso" className={styles.switchItem}>
                Termos de Uso
              </Link>
              <Link
                href="/politica-de-privacidade"
                className={`${styles.switchItem} ${styles.switchAtivo}`}
                aria-current="page"
              >
                Política de Privacidade
              </Link>
            </nav>
          </div>

          <h1>
            Política de Privacidade e Proteção de Dados do{" "}
            <span className={styles.destaqueRosa}>Astro</span>
          </h1>

          <p className={styles.heroSubtitulo}>
            Transparência total sobre como coletamos, protegemos e utilizamos os
            seus dados pessoais em conformidade com a Lei Geral de Proteção de
            Dados (Lei nº 13.709/2018 — LGPD).
          </p>

          <div className={styles.metaInfo}>
            <span>
              <strong className={styles.metaDot}>✦</strong> Vigência: Outubro de
              2026
            </span>
            <span>
              <strong className={styles.metaDot}>✦</strong> Base Legal: Lei nº
              13.709/2018 (LGPD)
            </span>
            <span>
              <strong className={styles.metaDot}>✦</strong> Canal LGPD:
              contato@astropets.com.br
            </span>
          </div>
        </section>

        {/* FAIXA DE RESUMO RÁPIDO */}
        <section
          className={styles.faixaResumo}
          aria-label="Resumo de privacidade"
        >
          <div className={styles.faixaConteudo}>
            <h2 className={styles.faixaTitulo}>
              <span>✦</span> Sua privacidade na órbita do Astro
            </h2>

            <div className={styles.gridResumo}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => irParaSecao("proibicao-menores-18")}
                onKeyDown={(e) =>
                  e.key === "Enter" && irParaSecao("proibicao-menores-18")
                }
                className={`${styles.cardResumo} ${styles.cardRosa}`}
              >
                <span className={styles.tagDestaque}>VEDADO A MENORES</span>
                <div className={styles.cardResumoTopo}>
                  <span
                    className={`${styles.estrelaCard} ${styles.estrelaBranca}`}
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  <h2>Exclusivo para Maiores de 18 Anos</h2>
                </div>
                <p>
                  Não permitimos o cadastro nem coletamos intencionalmente dados
                  de menores de 18 anos. Contas irregulares são excluídas
                  imediatamente.
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => irParaSecao("compromisso-lgpd")}
                onKeyDown={(e) =>
                  e.key === "Enter" && irParaSecao("compromisso-lgpd")
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
                  <h2>Conformidade com a LGPD</h2>
                </div>
                <p>
                  Seus dados nunca são vendidos. Coletamos apenas o essencial
                  para conectar adotantes, ONGs, protetores e clínicas com
                  segurança.
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => irParaSecao("finalidades-geolocalizacao")}
                onKeyDown={(e) =>
                  e.key === "Enter" && irParaSecao("finalidades-geolocalizacao")
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
                  <h2>Geolocalização Consciente</h2>
                </div>
                <p>
                  Seu CEP e sua localização servem unicamente para mapear pets,
                  ocorrências e clínicas próximas na sua região.
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
                      .getElementById("lista-clausulas-privacidade")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                placeholder="Pesquisar na Política (ex: LGPD, 18 anos, CEP, cookies, exclusão)..."
                aria-label="Pesquisar na Política de Privacidade"
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
                ✦ Exibindo {secoesFiltradas.length} de{" "}
                {secoesPrivacidade.length} tópicos
              </span>
            )}
          </div>

          <p className={styles.labelTopicos}>
            Filtrar tópicos de privacidade (clique novamente para exibir todos):
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
        <section id="lista-clausulas-privacidade" className={styles.conteudo}>
          {secoesFiltradas.length === 0 ? (
            <div className={styles.semResultado}>
              <p>
                Nenhum tópico encontrado para &ldquo;{busca}&rdquo; neste
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
                Mostrar toda a Política de Privacidade
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

                {secao.mostrarDadosGrid && (
                  <div className={styles.gridCardsInternos}>
                    <div className={styles.cardInterno}>
                      <strong>Explorador (Tutor / Adotante)</strong>
                      <span>Dados Cadastrais Básicos</span>
                      <p>
                        Nome completo, endereço de e-mail, telefone de contato,
                        CEP para mapeamento regional e senha criptografada.
                      </p>
                    </div>

                    <div className={styles.cardInterno}>
                      <strong>Guardião de Órbita (Protetor)</strong>
                      <span>Dados de Verificação de Protetor</span>
                      <p>
                        Nome completo, CPF para validação de responsabilidade,
                        e-mail, telefone de contato e CEP da base de apoio.
                      </p>
                    </div>

                    <div className={styles.cardInterno}>
                      <strong>Base Estelar (ONG / Abrigo)</strong>
                      <span>Dados Institucionais e de Contato</span>
                      <p>
                        Nome da instituição, CNPJ ou CPF, nome do responsável
                        legal, e-mail, telefone, CEP e perfil do Instagram (@).
                      </p>
                    </div>

                    <div className={styles.cardInterno}>
                      <strong>Estação de Cuidado (Clínica)</strong>
                      <span>Dados de Parceiro de Saúde</span>
                      <p>
                        Nome da clínica ou hospital veterinário, CNPJ ou CPF do
                        responsável, e-mail comercial, telefone e CEP.
                      </p>
                    </div>
                  </div>
                )}

                {secao.mostrarDireitosGrid && (
                  <div className={styles.gridCardsInternos}>
                    <div className={styles.cardInterno}>
                      <strong>Confirmação e Acesso</strong>
                      <span>Art. 18, I e II da LGPD</span>
                      <p>
                        Confirmar a existência de tratamento e consultar de
                        forma clara todos os dados pessoais vinculados à sua
                        conta.
                      </p>
                    </div>

                    <div className={styles.cardInterno}>
                      <strong>Correção e Atualização</strong>
                      <span>Art. 18, III da LGPD</span>
                      <p>
                        Retificar dados incompletos, inexatos ou desatualizados
                        a qualquer momento pelo painel Minha Conta.
                      </p>
                    </div>

                    <div className={styles.cardInterno}>
                      <strong>Anonimização ou Eliminação</strong>
                      <span>Art. 18, IV e VI da LGPD</span>
                      <p>
                        Solicitar a exclusão da sua conta e a eliminação dos
                        dados pessoais tratados mediante seu consentimento.
                      </p>
                    </div>

                    <div className={styles.cardInterno}>
                      <strong>Revogação do Consentimento</strong>
                      <span>Art. 18, IX da LGPD</span>
                      <p>
                        Desativar permissões como geolocalização ou revogar o
                        consentimento de uso de dados de maneira facilitada.
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
              <h2>Deseja exercer seus direitos da LGPD ou tirar dúvidas?</h2>
              <p>
                Você pode gerenciar suas informações diretamente nas
                configurações da sua conta ou falar com o nosso canal de
                Privacidade e Proteção de Dados.
              </p>
            </div>

            <div className={styles.ctaBotoes}>
              <a
                href="mailto:contato@astropets.com.br?subject=Solicita%C3%A7%C3%A3o%20LGPD%20-%20Astro"
                className={styles.btnRosa}
              >
                Solicitar Atendimento LGPD
              </a>
              <Link href="/termos-de-uso" className={styles.btnOutline}>
                Ler Termos de Uso
              </Link>
              <Link href="/ajuda" className={styles.btnOutline}>
                Central de Ajuda
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
