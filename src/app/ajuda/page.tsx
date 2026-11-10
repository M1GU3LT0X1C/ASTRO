"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "./Ajuda.module.css";

type CategoriaFAQ = "adocao" | "ongs" | "consultas" | "conta";

type FAQ = {
  id: string;
  categoria: CategoriaFAQ;
  pergunta: string;
  resposta: string;
};

const faqs: FAQ[] = [
  {
    id: "1",
    categoria: "adocao",
    pergunta: "O Astro realiza adoções diretamente?",
    resposta:
      "Não. O Astro funciona como um hub de conexão gratuita entre tutores, abrigos e protetores. Nós facilitamos o encontro e a divulgação dos animais, mas todo o processo de entrevista, triagem e assinatura do termo de responsabilidade é feito diretamente com a Base Estelar (ONG) ou Guardião de Órbita responsável.",
  },
  {
    id: "2",
    categoria: "adocao",
    pergunta: "Quais são os requisitos para adotar um pet pelo site?",
    resposta:
      "Os requisitos padrão incluem: ter 18 anos completos ou mais, apresentar documento oficial com foto, comprovante de residência e passar pela entrevista de avaliação da ONG ou protetor parceiro para garantir um lar seguro, amoroso e compatível.",
  },
  {
    id: "8",
    categoria: "adocao",
    pergunta: "Como posso saber se um gatinho tem FIV ou FeLV?",
    resposta:
      "No perfil de cada felino cadastrado, a ONG ou protetor responsável informa o status de FIV (Vírus da Imunodeficiência Felina) e FeLV (Vírus da Leucemia Felina) — indicando se o teste é negativo, positivo ou se ainda não foi testado, garantindo total transparência para uma adoção consciente.",
  },
  {
    id: "3",
    categoria: "consultas",
    pergunta: "Como funcionam os cupons de desconto nas clínicas parceiras?",
    resposta:
      "Ao navegar pelas Estações de Cuidado (clínicas e hospitais veterinários parceiros) da sua região, você pode resgatar cupons promocionais exclusivos. Basta apresentar o código gerado pela plataforma na recepção da clínica parceira.",
  },
  {
    id: "4",
    categoria: "consultas",
    pergunta: "Como funciona o sistema de pontos e avaliações?",
    resposta:
      "Após cada atendimento realizado em uma Estação de Cuidado parceira, você pode avaliar a experiência na plataforma. Essa avaliação gera pontos no seu perfil que podem ser trocados por novos descontos em consultas, exames e vacinas.",
  },
  {
    id: "5",
    categoria: "ongs",
    pergunta: "Minha ONG está superlotada. Como acionar a tag de urgência?",
    resposta:
      "Dentro do seu painel administrativo, você pode atualizar o status de capacidade do abrigo. Ao atingir o limite crítico, o selo 'Lotado / Urgente' é ativado automaticamente e ganha destaque prioritário para adotantes da sua região.",
  },
  {
    id: "6",
    categoria: "ongs",
    pergunta:
      "Sou uma ONG ou Protetor Independente. Como cadastro meus resgatados?",
    resposta:
      "O cadastro é 100% gratuito! Acesse a página de Cadastro, escolha 'Base Estelar' para ONGs/abrigos ou 'Guardião de Órbita' para protetores independentes, preencha os dados de verificação (CNPJ ou CPF) e comece a divulgar seus animais.",
  },
  {
    id: "9",
    categoria: "ongs",
    pergunta:
      "Como funcionam as ocorrências de animais em situação de rua e as doações?",
    resposta:
      "Usuários podem registrar ocorrências com foto e localização de animais perdidos, feridos ou em situação de rua, notificando ONGs próximas. Além disso, no perfil das Bases Estelares é possível visualizar itens necessários ou apoiar financeiramente via PIX ou cartão.",
  },
  {
    id: "7",
    categoria: "conta",
    pergunta: "Como altero meus dados cadastrais e preferências de privacidade?",
    resposta:
      "No seu Painel, acesse a aba 'Configurações / Minha Conta' para editar nome, e-mail, senha, telefone ou CEP e gerenciar suas permissões de dados em conformidade com a LGPD (Lei nº 13.709/2018).",
  },
  {
    id: "10",
    categoria: "conta",
    pergunta: "Menores de 18 anos podem criar conta no Astro?",
    resposta:
      "Não. Conforme nossos Termos de Uso e Política de Privacidade, a criação de conta e a solicitação de adoção são estritamente restritas a maiores de 18 anos plenamente capazes, pois a guarda responsável de animais exige maioridade civil.",
  },
];

const topicos: { id: CategoriaFAQ; label: string; cor: "azul" | "rosa" }[] = [
  { id: "adocao", label: "Adoção e Acompanhamento", cor: "azul" },
  { id: "consultas", label: "Consultas e Cupons", cor: "rosa" },
  { id: "ongs", label: "Para ONGs e Protetores", cor: "azul" },
  { id: "conta", label: "Minha Conta e Privacidade", cor: "rosa" },
];

const categoriasOrdem: {
  id: CategoriaFAQ;
  numero: string;
  titulo: string;
  anchorId: string;
}[] = [
  {
    id: "adocao",
    numero: "01",
    titulo: "Adoção Responsável e Acompanhamento",
    anchorId: "secao-adocao",
  },
  {
    id: "consultas",
    numero: "02",
    titulo: "Clínicas Parceiras, Consultas e Cupons",
    anchorId: "secao-consultas",
  },
  {
    id: "ongs",
    numero: "03",
    titulo: "ONGs, Protetores Independentes e Ocorrências",
    anchorId: "secao-ongs",
  },
  {
    id: "conta",
    numero: "04",
    titulo: "Minha Conta, Maioridade (+18) e Privacidade (LGPD)",
    anchorId: "secao-conta",
  },
];

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function AjudaPage() {
  const [busca, setBusca] = useState("");
  const [topicoAtivo, setTopicoAtivo] = useState<CategoriaFAQ | null>(null);
  const [aberto, setAberto] = useState<string | null>("1");

  const irParaSecao = (anchorId: string) => {
    setBusca("");
    setTopicoAtivo(null);
    setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const filtradas = useMemo(() => {
    const termo = normalizarTexto(busca);
    return faqs.filter((f) => {
      const matchTopico = !topicoAtivo || f.categoria === topicoAtivo;
      if (!termo) return matchTopico;

      const perguntaNorm = normalizarTexto(f.pergunta);
      const respostaNorm = normalizarTexto(f.resposta);
      return (
        matchTopico &&
        (perguntaNorm.includes(termo) || respostaNorm.includes(termo))
      );
    });
  }, [busca, topicoAtivo]);

  const porCat = (cat: CategoriaFAQ) =>
    filtradas.filter((f) => f.categoria === cat);

  return (
    <>
      <Header />

      <main className={styles.ajuda}>
        {/* HERO */}
        <section className={styles.topo}>
          <div className={styles.heroTopo}>
            <span className={styles.badge}>
              <span className={styles.badgeEstrela} aria-hidden="true">
                ✦
              </span>
              Central de Ajuda & FAQ • AstroPets
            </span>

            <nav
              className={styles.atalhosTopo}
              aria-label="Atalhos para documentos legais"
            >
              <Link
                href="/ajuda"
                className={`${styles.atalhoItem} ${styles.atalhoAtivo}`}
                aria-current="page"
              >
                Central de Ajuda
              </Link>
              <Link href="/termos-de-uso" className={styles.atalhoItem}>
                Termos de Uso
              </Link>
              <Link
                href="/politica-de-privacidade"
                className={styles.atalhoItem}
              >
                Política de Privacidade
              </Link>
            </nav>
          </div>

          <h1>
            Como podemos ajudar você e seu pet na nossa{" "}
            <span className={styles.destaqueRosa}>órbita</span> hoje?
          </h1>

          <p className={styles.heroSubtitulo}>
            Tire suas dúvidas sobre adoção responsável, cadastro de ONGs e
            protetores, cupons em clínicas veterinárias parceiras e proteção dos
            seus dados pessoais.
          </p>

          <div className={styles.metaInfo}>
            <span>
              <strong className={styles.metaDot}>✦</strong> Plataforma 100%
              gratuita para adoção
            </span>
            <span>
              <strong className={styles.metaDot}>✦</strong> Exclusivo para
              maiores de 18 anos
            </span>
            <span>
              <strong className={styles.metaDot}>✦</strong> Suporte oficial:
              contato@astropets.com.br
            </span>
          </div>
        </section>

        {/* FAIXA DE DESTAQUES (RESUMO RÁPIDO) */}
        <section
          className={styles.faixaResumo}
          aria-label="Principais temas de ajuda"
        >
          <div className={styles.faixaConteudo}>
            <h2 className={styles.faixaTitulo}>
              <span>✦</span> Guia rápido do ecossistema Astro
            </h2>

            <div className={styles.gridResumo}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => irParaSecao("secao-adocao")}
                onKeyDown={(e) =>
                  e.key === "Enter" && irParaSecao("secao-adocao")
                }
                className={`${styles.cardResumo} ${styles.cardRosa}`}
              >
                <span className={styles.tagCard}>EXPLORADORES (+18)</span>
                <div className={styles.cardResumoTopo}>
                  <span
                    className={`${styles.estrelaCard} ${styles.estrelaBranca}`}
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  <h2>Adoção Consciente</h2>
                </div>
                <p>
                  Encontre cães e gatos perto de você, conheça o histórico de
                  saúde de cada pet e conecte-se direto com a ONG responsável.
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => irParaSecao("secao-consultas")}
                onKeyDown={(e) =>
                  e.key === "Enter" && irParaSecao("secao-consultas")
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
                  <h2>Consultas, Cupons & Pontos</h2>
                </div>
                <p>
                  Resgate cupons nas Estações de Cuidado da sua região e avalie
                  os atendimentos para acumular pontos e novos descontos.
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => irParaSecao("secao-ongs")}
                onKeyDown={(e) =>
                  e.key === "Enter" && irParaSecao("secao-ongs")
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
                  <h2>ONGs, Protetores & LGPD</h2>
                </div>
                <p>
                  Divulgue animais resgatados gratuitamente, acompanhe
                  ocorrências próximas e gerencie sua conta com total segurança.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BARRA DE BUSCA E PILLS */}
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
                      .getElementById("lista-perguntas-faq")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                placeholder="Digite sua dúvida ou palavra-chave (ex: adoção, cupom, ONG, LGPD)..."
                aria-label="Pesquisar nas Perguntas Frequentes"
                className={styles.busca}
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
                ✦ Exibindo {filtradas.length} de {faqs.length} perguntas
              </span>
            )}
          </div>

          <div className={styles.topicosHeader}>
            <p>
              {busca
                ? `Filtrar resultados para "${busca}" por categoria:`
                : "Tópicos mais procurados (clique novamente para mostrar todos):"}
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
          </div>
        </section>

        {/* SEÇÕES DE FAQ (ACCORDION) */}
        <section id="lista-perguntas-faq" className={styles.conteudo}>
          <h2 className={styles.tituloFAQ}>
            <span>✦</span> Perguntas Frequentes (FAQ)
          </h2>

          {filtradas.length === 0 ? (
            <div className={styles.semResultado}>
              <p>
                Nenhuma pergunta encontrada para &ldquo;{busca}&rdquo; neste
                tópico.
              </p>
              <button
                type="button"
                className={styles.btnLimpar}
                onClick={() => {
                  setBusca("");
                  setTopicoAtivo(null);
                }}
              >
                Mostrar todas as perguntas
              </button>
            </div>
          ) : (
            categoriasOrdem.map((cat) => {
              const itensCat = porCat(cat.id);
              if (itensCat.length === 0) return null;

              return (
                <article
                  key={cat.id}
                  id={cat.anchorId}
                  className={styles.blocoCategoria}
                >
                  <div className={styles.categoriaHeader}>
                    <span className={styles.numeroCat}>{cat.numero}</span>
                    <h3 className={styles.categoria}>{cat.titulo}</h3>
                  </div>

                  <div className={styles.cardFAQ}>
                    {itensCat.map((f) => {
                      const estaAberto = aberto === f.id;
                      return (
                        <div key={f.id} className={styles.item}>
                          <button
                            type="button"
                            className={styles.pergunta}
                            aria-expanded={estaAberto}
                            onClick={() =>
                              setAberto(estaAberto ? null : f.id)
                            }
                          >
                            {f.pergunta}
                            <span className={styles.iconeToggle}>
                              {estaAberto ? "−" : "+"}
                            </span>
                          </button>
                          {estaAberto && (
                            <p className={styles.resposta}>{f.resposta}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })
          )}

          {/* CTA FINAL */}
          <div className={styles.ctaFinal}>
            <div className={styles.ctaTexto}>
              <h2>Ainda precisa de ajuda na sua jornada?</h2>
              <p>
                Se a sua dúvida não estiver listada acima, fale diretamente com
                a equipe do Astro ou consulte nossos documentos de Termos de Uso
                e Política de Privacidade.
              </p>
            </div>

            <div className={styles.ctaBotoes}>
              <a
                href="mailto:contato@astropets.com.br?subject=D%C3%BAvida%20-%20Central%20de%20Ajuda%20Astro"
                className={styles.btnRosa}
              >
                Falar com o Suporte
              </a>
              <Link href="/termos-de-uso" className={styles.btnOutline}>
                Termos de Uso
              </Link>
              <Link
                href="/politica-de-privacidade"
                className={styles.btnOutline}
              >
                Política de Privacidade
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
