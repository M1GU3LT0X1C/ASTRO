
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  MapPin,
  SlidersHorizontal,
  Heart,
  House,
  Stethoscope,
  X,
  ChevronDown,
} from "lucide-react";
import styles from "./resultados.module.css";
import modalStyles from "./favoritos-modal.module.css";
import cardStyles from "./cards-perfis.module.css";
import { supabase } from "@/lib/supabase";

/* ===== TIPOS ===== */

type Categoria =
  | "porte"
  | "sexo"
  | "especie"
  | "saude"
  | "personalidade"
  | "convivencia";

type GrupoFiltro = {
  id: Categoria;
  titulo: string;
  opcoes: string[];
};

type Filtros = Record<Categoria, string[]>;

type Item = {
  id: string;
  nome: string;
  localizacao: string;
  imagem?: string;
  descricao?: string;
  especie?: string;
  porte?: string;
  sexo?: string;
  castracao?: string;
  vacinacao?: string;
  vermifugacao?: string;
  cuidados?: string;
  personalidade?: string[];
  convivencia?: string[];
  href?: string;
  criadoEm?: string;
  idade?: string;
  capacidade?: "superlotada" | "lotada" | "disponivel";
  avaliacao?: number;
};

/* ===== OPÇÕES DE FILTRO ===== */

const grupos: GrupoFiltro[] = [
  {
    id: "porte",
    titulo: "Porte",
    opcoes: ["Pequeno", "Médio", "Grande"],
  },
  {
    id: "sexo",
    titulo: "Sexo",
    opcoes: ["Macho", "Fêmea"],
  },
  {
    id: "especie",
    titulo: "Espécie",
    opcoes: ["Cachorro", "Gato"],
  },
  {
    id: "saude",
    titulo: "Saúde e Cuidados",
    opcoes: [
      "Castrado(a)",
      "Vacinado(a)",
      "Vermifugado(a)",
      "Precisa de cuidados especiais",
    ],
  },
  {
    id: "personalidade",
    titulo: "Personalidade",
    opcoes: [
      "Energético",
      "Tímido",
      "Preguiçoso",
      "Medroso",
      "Sociável",
      "Carinhoso",
      "Apegado",
      "Curioso",
      "Protetor",
      "Independente",
    ],
  },
  {
    id: "convivencia",
    titulo: "Reatividade e Convivência",
    opcoes: [
      "Se dá bem com cães",
      "Se dá bem com gatos",
      "Se dá bem com crianças",
      "Precisa ser o único pet da casa",
    ],
  },
];

const filtrosIniciais: Filtros = {
  porte: [],
  sexo: [],
  especie: [],
  saude: [],
  personalidade: [],
  convivencia: [],
};

/* ===== DADOS TEMPORÁRIOS ===== */

// Serão substituídos pelos dados do banco futuramente.
const animais: Item[] = [];
const bases: Item[] = [];
const clinicas: Item[] = [];

/* ===== COMPONENTE ===== */

function ResultadosConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const endereco = searchParams.get("endereco")?.trim() || "";

  const [filtros, setFiltros] =
    useState<Filtros>(filtrosIniciais);

  const [filtrosAbertos, setFiltrosAbertos] =
    useState(false);

  const [ordenacao, setOrdenacao] =
    useState("padrao");

  const [favoritos, setFavoritos] =
    useState<string[]>([]);

  const [modalLoginAberto, setModalLoginAberto] = useState(false);
  const [verificandoLogin, setVerificandoLogin] = useState(false);

  const painelRef = useRef<HTMLDivElement>(null);
  const botaoFiltroRef = useRef<HTMLButtonElement>(null);

  /* ===== FECHAR FILTRO AO CLICAR FORA ===== */

  useEffect(() => {
    function clicarFora(event: MouseEvent) {
      const alvo = event.target as Node;

      if (
        !painelRef.current?.contains(alvo) &&
        !botaoFiltroRef.current?.contains(alvo)
      ) {
        setFiltrosAbertos(false);
      }
    }

    document.addEventListener("mousedown", clicarFora);

    return () => {
      document.removeEventListener(
        "mousedown",
        clicarFora
      );
    };
  }, []);

  /* ===== SELEÇÃO DE FILTROS ===== */

  function alternarFiltro(
    categoria: Categoria,
    opcao: string
  ) {
    setFiltros((anteriores) => {
      const atuais = anteriores[categoria];

      // Remover uma opção já selecionada
      if (atuais.includes(opcao)) {
        return {
          ...anteriores,
          [categoria]: atuais.filter(
            (valor) => valor !== opcao
          ),
        };
      }

      let novos = [...atuais];

      // Exclusividade de convivência
      if (categoria === "convivencia") {
        const unico =
          "Precisa ser o único pet da casa";

        if (opcao === unico) {
          novos = [];
        } else {
          novos = novos.filter(
            (valor) => valor !== unico
          );
        }
      }

      return {
        ...anteriores,
        [categoria]: [...novos, opcao],
      };
    });
  }

  /* ===== LIMPAR FILTROS ===== */

  function limparFiltros() {
    setFiltros({
      porte: [],
      sexo: [],
      especie: [],
      saude: [],
      personalidade: [],
      convivencia: [],
    });
  }

  const selecionados = grupos.flatMap((grupo) =>
    filtros[grupo.id].map((opcao) => ({
      categoria: grupo.id,
      opcao,
    }))
  );

  /* ===== FAVORITOS ===== */

  async function alternarFavorito(id: string) {
    if (verificandoLogin) return;

    setVerificandoLogin(true);
    try {
      // getUser valida a sessão com o Supabase Auth.
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setModalLoginAberto(true);
        return;
      }

      // Favoritos locais até a integração com a tabela de favoritos.
      setFavoritos((anteriores) =>
        anteriores.includes(id)
          ? anteriores.filter((favorito) => favorito !== id)
          : [...anteriores, id]
      );
    } finally {
      setVerificandoLogin(false);
    }
  }

  useEffect(() => {
    if (!modalLoginAberto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setModalLoginAberto(false);
    }

    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [modalLoginAberto]);

  /* ===== ORDENAÇÃO ===== */

  function ordenarItens(itens: Item[]) {
    const copia = [...itens];

    if (ordenacao === "az") {
      copia.sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
      );
    }

    if (ordenacao === "za") {
      copia.sort((a, b) =>
        b.nome.localeCompare(a.nome, "pt-BR")
      );
    }

    if (ordenacao === "recentes") {
      copia.sort(
        (a, b) =>
          new Date(b.criadoEm || 0).getTime() -
          new Date(a.criadoEm || 0).getTime()
      );
    }

    return copia;
  }

  /* ===== FILTRAGEM DOS ANIMAIS ===== */

  function filtrarAnimais(itens: Item[]) {
    const camposSaude: Record<
      string,
      keyof Item
    > = {
      "Castrado(a)": "castracao",
      "Vacinado(a)": "vacinacao",
      "Vermifugado(a)": "vermifugacao",
      "Precisa de cuidados especiais":
        "cuidados",
    };

    const resultado = itens.filter((item) => {
      // Porte, sexo e espécie
      const caracteristicasValidas = (
        ["porte", "sexo", "especie"] as const
      ).every((campo) => {
        const valores = filtros[campo];

        return (
          valores.length === 0 ||
          (
            typeof item[campo] === "string" &&
            valores.includes(item[campo])
          )
        );
      });

      // Saúde e cuidados
      const saudeValida = filtros.saude.every(
        (opcao) => {
          const campo = camposSaude[opcao];

          return campo
            ? item[campo] === opcao
            : false;
        }
      );

      // Personalidade
      const personalidadeValida =
        filtros.personalidade.length === 0 ||
        filtros.personalidade.some((valor) =>
          item.personalidade?.includes(valor)
        );

      // Convivência
      const convivenciaValida =
        filtros.convivencia.length === 0 ||
        filtros.convivencia.some((valor) =>
          item.convivencia?.includes(valor)
        );

      return (
        caracteristicasValidas &&
        saudeValida &&
        personalidadeValida &&
        convivenciaValida
      );
    });

    return ordenarItens(resultado);
  }

  /* ===== RENDERIZAÇÃO DOS CARDS ===== */

  function renderizarCards(
    itens: Item[],
    tipo: "animais" | "bases" | "clinicas",
    mensagem: string
  ) {
    if (itens.length === 0) {
      return (
        <div className={styles.vazio}>
          <div className={styles.iconeVazio}>
            {tipo === "animais" ? (
              <Heart size={26} />
            ) : tipo === "bases" ? (
              <House size={26} />
            ) : (
              <Stethoscope size={26} />
            )}
          </div>

          <strong>{mensagem}</strong>

          <span>
            Quando houver cadastros disponíveis,
            eles aparecerão aqui.
          </span>
        </div>
      );
    }

    return (
      <div className={styles.cardsGrid}>
        {itens.map((item) => {
          const chaveFavorito = `${tipo}:${item.id}`;
          const favorito = favoritos.includes(chaveFavorito);
          const statusCapacidade = item.capacidade;
          const statusTexto = statusCapacidade === "superlotada"
            ? "ONG superlotada"
            : statusCapacidade === "lotada"
              ? "ONG lotada"
              : "ONG com vagas disponíveis";

          return (
            <article key={item.id} className={`${styles.card} ${cardStyles.cardPerfil}`}>
              <button
                type="button"
                className={styles.favorito}
                onClick={() => alternarFavorito(chaveFavorito)}
                aria-label={favorito ? `Remover ${item.nome} dos favoritos` : `Adicionar ${item.nome} aos favoritos`}
                aria-pressed={favorito}
                disabled={verificandoLogin}
              >
                <Heart size={24} fill={favorito ? "currentColor" : "none"} />
              </button>

              <div className={cardStyles.fotoArea}>
                <div className={`${styles.imagemCard} ${cardStyles.fotoCircular}`}>
                  {item.imagem ? (
                    <img src={item.imagem} alt={item.nome} />
                  ) : (
                    <span className={cardStyles.fotoPlaceholder} aria-label="Sem foto disponível" />
                  )}
                </div>
                {tipo === "bases" && statusCapacidade && (
                  <span
                    className={`${cardStyles.statusOng} ${cardStyles[statusCapacidade]}`}
                    role="img"
                    aria-label={statusTexto}
                    title={statusTexto}
                  >
                    <span aria-hidden="true">!</span>
                  </span>
                )}
              </div>

              <div className={cardStyles.informacoes}>
                <strong className={`${styles.nomeCard} ${cardStyles.nome}`}>{item.nome}</strong>
                {tipo === "animais" && item.idade && (
                  <span className={cardStyles.idade}>{item.idade}</span>
                )}
                <span className={`${styles.localCard} ${cardStyles.local}`}>
                  {item.localizacao}
                </span>
                {tipo === "clinicas" && typeof item.avaliacao === "number" && (
                  <div className={cardStyles.estrelas} aria-label={`Avaliação: ${item.avaliacao} de 5 estrelas`}>
                    {Array.from({ length: 5 }, (_, indice) => (
                      <span
                        key={indice}
                        className={indice < Math.round(Math.max(0, Math.min(5, item.avaliacao!)))
                          ? cardStyles.estrelaAtiva
                          : cardStyles.estrelaInativa}
                        aria-hidden="true"
                      >★</span>
                    ))}
                  </div>
                )}
              </div>

              {item.href ? (
                <a href={item.href} className={`${styles.botaoCard} ${cardStyles.botaoPerfil}`}>
                  {tipo === "animais" ? "Adoção" : "Acessar perfil"}
                </a>
              ) : (
                <span className={`${styles.botaoIndisponivel} ${cardStyles.botaoPerfil} ${cardStyles.botaoSemLink}`}>
                  {tipo === "animais" ? "Adoção" : "Acessar perfil"}
                </span>
              )}
            </article>
          );
        })}
      </div>
    );
  }

  const animaisFiltrados =
    filtrarAnimais(animais);

  /* ===== INTERFACE ===== */

  return (
    <>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>

          {/* LOCALIZAÇÃO */}

          <div className={styles.barraSuperior}>
            <div className={styles.localizacao}>
              <MapPin
                size={18}
                fill="currentColor"
              />

              <span>
                {endereco ||
                  "Nenhuma localização informada"}
              </span>

              <button
                type="button"
                onClick={() =>
                  router.push("/adocao-clinicas")
                }
              >
                Alterar
              </button>
            </div>
          </div>

          {/* FILTROS */}

          <div className={styles.areaFiltros}>

            <div className={styles.barraFiltros}>

              <div className={styles.acoesFiltros}>

                <button
                  ref={botaoFiltroRef}
                  type="button"
                  className={styles.botaoFiltro}
                  onClick={() =>
                    setFiltrosAbertos(
                      !filtrosAbertos
                    )
                  }
                  aria-expanded={filtrosAbertos}
                  aria-controls="painel-filtros"
                >
                  <SlidersHorizontal size={17} />
                  Filtro
                </button>

                <button
                  type="button"
                  className={styles.limparFiltros}
                  onClick={limparFiltros}
                  disabled={
                    selecionados.length === 0
                  }
                >
                  Limpar Filtros
                </button>
              </div>

              {/* ORDENAÇÃO */}

              <div className={styles.ordenacao}>
                <label
                  htmlFor="ordenar-resultados"
                  className={styles.srOnly}
                >
                  Ordenar resultados
                </label>

                <select
                  id="ordenar-resultados"
                  value={ordenacao}
                  onChange={(e) =>
                    setOrdenacao(e.target.value)
                  }
                >
                  <option value="padrao">
                    Ordenar
                  </option>

                  <option value="az">
                    Nome: A–Z
                  </option>

                  <option value="za">
                    Nome: Z–A
                  </option>

                  <option value="recentes">
                    Mais recentes
                  </option>
                </select>

                <ChevronDown
                  size={18}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* PAINEL HORIZONTAL */}

            {filtrosAbertos && (
              <div
                ref={painelRef}
                id="painel-filtros"
                className={styles.painelFiltros}
              >
                <div
                  className={
                    styles.cabecalhoPainel
                  }
                >
                  <strong>Filtrar Astros</strong>

                  <button
                    type="button"
                    onClick={() =>
                      setFiltrosAbertos(false)
                    }
                    aria-label="Fechar filtros"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className={styles.ajudaFiltro}>
                  Selecione as características
                  que você procura.
                </p>

                <div className={styles.gruposFiltros}>

                  {/* PORTE, SEXO E ESPÉCIE */}

                  <div
                    className={
                      styles.linhaCaracteristicas
                    }
                  >
                    {grupos
                      .slice(0, 3)
                      .map((grupo) => (
                        <div
                          key={grupo.id}
                          className={
                            styles.grupoFiltro
                          }
                        >
                          <h3>{grupo.titulo}</h3>

                          <div
                            className={
                              styles.opcoesFiltro
                            }
                          >
                            {grupo.opcoes.map(
                              (opcao) => {
                                const ativo =
                                  filtros[
                                    grupo.id
                                  ].includes(opcao);

                                return (
                                  <button
                                    key={opcao}
                                    type="button"
                                    className={`${
                                      styles.tagOpcao
                                    } ${
                                      ativo
                                        ? styles.tagAtiva
                                        : ""
                                    }`}
                                    onClick={() =>
                                      alternarFiltro(
                                        grupo.id,
                                        opcao
                                      )
                                    }
                                    aria-pressed={
                                      ativo
                                    }
                                  >
                                    {opcao}

                                    {ativo && (
                                      <X size={12} />
                                    )}
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* SAÚDE, PERSONALIDADE E CONVIVÊNCIA */}

                  {grupos
                    .slice(3)
                    .map((grupo) => (
                      <div
                        key={grupo.id}
                        className={
                          styles.grupoFiltro
                        }
                      >
                        <h3>{grupo.titulo}</h3>

                        <div
                          className={
                            styles.opcoesFiltro
                          }
                        >
                          {grupo.opcoes.map(
                            (opcao) => {
                              const ativo =
                                filtros[
                                  grupo.id
                                ].includes(opcao);

                              return (
                                <button
                                  key={opcao}
                                  type="button"
                                  className={`${
                                    styles.tagOpcao
                                  } ${
                                    ativo
                                      ? styles.tagAtiva
                                      : ""
                                  }`}
                                  onClick={() =>
                                    alternarFiltro(
                                      grupo.id,
                                      opcao
                                    )
                                  }
                                  aria-pressed={
                                    ativo
                                  }
                                >
                                  {opcao}

                                  {ativo && (
                                    <X size={12} />
                                  )}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* CONCLUIR */}

                <div
                  className={
                    styles.rodapePainel
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.botaoConcluir
                    }
                    onClick={() =>
                      setFiltrosAbertos(false)
                    }
                  >
                    Concluir
                  </button>
                </div>
              </div>
            )}

            {/* TAGS SELECIONADAS */}

            <div
              className={
                styles.tagsSelecionadas
              }
            >
              {selecionados.length > 0 ? (
                selecionados.map(
                  ({ categoria, opcao }) => (
                    <button
                      key={`${categoria}-${opcao}`}
                      type="button"
                      className={
                        styles.tagSelecionada
                      }
                      onClick={() =>
                        alternarFiltro(
                          categoria,
                          opcao
                        )
                      }
                      aria-label={`Remover filtro ${opcao}`}
                    >
                      {opcao}

                      <span
                        className={
                          styles.removerTag
                        }
                      >
                        <X size={11} />
                      </span>
                    </button>
                  )
                )
              ) : (
                <span
                  className={
                    styles.semFiltros
                  }
                >
                  Nenhum filtro selecionado.
                </span>
              )}
            </div>
          </div>

          {/* ASTROS */}

          <section className={styles.secao}>
            <h2>Astros perto de você</h2>

            {renderizarCards(
              animaisFiltrados,
              "animais",
              animais.length === 0
                ? "Nenhum Astro disponível para adoção nesta região ainda."
                : "Nenhum Astro corresponde aos filtros selecionados."
            )}
          </section>

          {/* BASES ESTELARES */}

          <section className={styles.secao}>
            <h2>
              Bases Estelares na sua órbita
            </h2>

            {renderizarCards(
              ordenarItens(bases),
              "bases",
              "Nenhuma ONG ou abrigo cadastrada nesta região ainda."
            )}
          </section>

          {/* ESTAÇÕES DE APOIO */}

          <section className={styles.secao}>
            <h2>
              Estações de Apoio na sua órbita
            </h2>

            {renderizarCards(
              ordenarItens(clinicas),
              "clinicas",
              "Nenhuma clínica veterinária cadastrada nesta região ainda."
            )}
          </section>

        </div>
      </main>

      <Footer />

      {modalLoginAberto && (
        <div
          className={modalStyles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalLoginAberto(false);
            }
          }}
        >
          <div
            className={modalStyles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="aviso-favoritos"
          >
            <button
              type="button"
              className={modalStyles.fechar}
              onClick={() => setModalLoginAberto(false)}
              aria-label="Fechar aviso"
            >
              <X size={18} />
            </button>

            <p id="aviso-favoritos" className={modalStyles.mensagem}>
              Para salvar seus favoritos, acompanhar o andamento de adoções e
              cuidar da saúde do seu pet, faça seu login ou crie sua conta!
            </p>

            <div className={modalStyles.acoes}>
              <button
                type="button"
                className={modalStyles.criarConta}
                onClick={() => router.push("/cadastro")}
              >
                Criar conta
              </button>
              <button
                type="button"
                className={modalStyles.login}
                onClick={() => router.push("/login")}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===== SUSPENSE PARA NEXT.JS ===== */

export default function ResultadosPage() {
  return (
    <Suspense fallback={null}>
      <ResultadosConteudo />
    </Suspense>
  );
}
