"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "./PerguntasFrequentes.module.css";

type Categoria = "adocao" | "consultas" | "ongs" | "conta";

type ItemFAQ = {
  id: string;
  categoria: Categoria;
  tag: string;
  pergunta: string;
  resposta: string;
};

const perguntas: ItemFAQ[] = [
  {
    id: "1",
    categoria: "adocao",
    tag: "Adoção",
    pergunta: "O Astro realiza adoções diretamente?",
    resposta:
      "Não. O Astro conecta tutores, abrigos e protetores gratuitamente, mas a entrevista, triagem e assinatura do termo de responsabilidade são feitas diretamente com a ONG (Base Estelar) ou Protetor (Guardião de Órbita).",
  },
  {
    id: "2",
    categoria: "adocao",
    tag: "Adoção",
    pergunta: "Quais são os requisitos para adotar um pet pelo site?",
    resposta:
      "Ter 18 anos completos ou mais, apresentar documento com foto, comprovante de residência e passar pela avaliação da ONG ou protetor responsável pelo animal.",
  },
  {
    id: "3",
    categoria: "consultas",
    tag: "Clínicas",
    pergunta: "Como funcionam os cupons e pontos nas clínicas parceiras?",
    resposta:
      "Você resgata cupons nas Estações de Cuidado da sua região e apresenta o código na clínica. Ao avaliar o atendimento depois, você acumula pontos para trocar por novos descontos.",
  },
  {
    id: "4",
    categoria: "ongs",
    tag: "ONGs",
    pergunta: "Como cadastro minha ONG ou abrigo no Astro?",
    resposta:
      "O cadastro é 100% gratuito. Acesse a página de Cadastro, escolha 'Base Estelar' (ONG) ou 'Guardião de Órbita' (Protetor), informe os dados de verificação e comece a divulgar seus pets.",
  },
  {
    id: "5",
    categoria: "ongs",
    tag: "ONGs",
    pergunta: "Como acionar a tag de urgência ou registrar animal de rua?",
    resposta:
      "ONGs podem ativar o selo 'Lotado / Urgente' no painel ao atingir capacidade máxima. Já tutores podem registrar ocorrências de animais em situação de rua com foto e localização para notificar abrigos próximos.",
  },
  {
    id: "6",
    categoria: "conta",
    tag: "Conta & LGPD",
    pergunta: "Menores de 18 anos podem criar conta no Astro?",
    resposta:
      "Não. O cadastro na plataforma e os processos de adoção são exclusivos para maiores de 18 anos, conforme nossos Termos de Uso e Política de Privacidade.",
  },
  {
    id: "7",
    categoria: "conta",
    tag: "Conta & LGPD",
    pergunta: "Como altero meus dados e permissões de privacidade?",
    resposta:
      "Acesse 'Minha Conta / Configurações' no seu painel para editar nome, e-mail, senha e CEP, ou envie uma solicitação LGPD para contato@astropets.com.br.",
  },
];

const filtros: { id: Categoria | null; label: string; cor: "azul" | "rosa" }[] =
  [
    { id: null, label: "Todas", cor: "azul" },
    { id: "adocao", label: "Adoção", cor: "rosa" },
    { id: "consultas", label: "Clínicas e Cupons", cor: "azul" },
    { id: "ongs", label: "ONGs e Protetores", cor: "rosa" },
    { id: "conta", label: "Conta e LGPD (+18)", cor: "azul" },
  ];

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function PerguntasFrequentesPage() {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria | null>(null);
  const [aberto, setAberto] = useState<string | null>("1");

  const listaFiltrada = useMemo(() => {
    const termo = normalizar(busca);
    return perguntas.filter((item) => {
      const matchCat = !categoriaAtiva || item.categoria === categoriaAtiva;
      if (!termo) return matchCat;
      const textoCompleto = normalizar(
        `${item.tag} ${item.pergunta} ${item.resposta}`
      );
      return matchCat && textoCompleto.includes(termo);
    });
  }, [busca, categoriaAtiva]);

  return (
    <>
      <Header />

      <main className={styles.pagina}>
        <div className={styles.container}>
          {/* TOPO RESUMIDO */}
          <header className={styles.topo}>
            <div className={styles.topoLinha}>
              <span className={styles.badge}>
                <span aria-hidden="true">✦</span> FAQ Rápido • AstroPets
              </span>

              <nav
                className={styles.atalhosTopo}
                aria-label="Atalhos da Central de Ajuda e documentos legais"
              >
                <Link href="/ajuda" className={styles.atalhoItem}>
                  Central de Ajuda
                </Link>
                <Link
                  href="/perguntas-frequentes"
                  className={`${styles.atalhoItem} ${styles.atalhoAtivo}`}
                  aria-current="page"
                >
                  Perguntas Frequentes
                </Link>
                <Link href="/termos-de-uso" className={styles.atalhoItem}>
                  Termos de Uso
                </Link>
                <Link
                  href="/politica-de-privacidade"
                  className={styles.atalhoItem}
                >
                  Privacidade
                </Link>
              </nav>
            </div>

            <h1>
              Perguntas <span className={styles.destaqueRosa}>Frequentes</span>
            </h1>
            <p>
              Respostas rápidas e diretas sobre adoção responsável, clínicas
              parceiras, ONGs e sua conta no Astro.
            </p>
          </header>

          {/* BUSCA E PILLS COMPACTAS */}
          <div className={styles.filtrosBox}>
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
                placeholder="Buscar dúvida rápida (ex: adoção, 18 anos, cupom, ONG)..."
                aria-label="Buscar nas perguntas frequentes"
                className={styles.buscaInput}
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className={styles.limparBusca}
                  aria-label="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.pills}>
              {filtros.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() =>
                    setCategoriaAtiva(
                      f.id !== null && categoriaAtiva === f.id ? null : f.id
                    )
                  }
                  className={`${styles.pill} ${
                    f.cor === "azul" ? styles.pillAzul : styles.pillRosa
                  } ${categoriaAtiva === f.id ? styles.pillAtivo : ""}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA DIRETA DE PERGUNTAS */}
          <section className={styles.listaFAQ} aria-label="Lista de perguntas">
            {listaFiltrada.length === 0 ? (
              <div className={styles.vazio}>
                Nenhuma pergunta encontrada para &ldquo;{busca}&rdquo;.
              </div>
            ) : (
              listaFiltrada.map((item) => {
                const isOpen = aberto === item.id;
                return (
                  <div
                    key={item.id}
                    className={`${styles.cardItem} ${
                      isOpen ? styles.cardAberto : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.perguntaBtn}
                      aria-expanded={isOpen}
                      onClick={() => setAberto(isOpen ? null : item.id)}
                    >
                      <span className={styles.perguntaEsquerda}>
                        <span className={styles.tagCat}>{item.tag}</span>
                        <span>{item.pergunta}</span>
                      </span>
                      <span className={styles.iconeMais}>
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && <p className={styles.resposta}>{item.resposta}</p>}
                  </div>
                );
              })
            )}
          </section>

          {/* RODAPÉ COMPACTO */}
          <div className={styles.rodapeBox}>
            <p>Não encontrou sua dúvida aqui?</p>
            <div className={styles.rodapeAcoes}>
              <Link href="/ajuda" className={styles.btnAzul}>
                Abrir Central de Ajuda
              </Link>
              <a
                href="mailto:contato@astropets.com.br"
                className={styles.btnRosa}
              >
                contato@astropets.com.br
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
