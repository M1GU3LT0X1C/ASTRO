"use client";
import { useEffect, useState, type ReactNode } from "react";
import { listarMeusAnimais, type AnimalTela } from "@/lib/animais";
import { buscarMetricas, type Metricas } from "@/lib/ong";
import styles from "./Metricas.module.css";

type Registro = AnimalTela & {
  views?: number;
  visualizacoes?: number;
  likes?: number;
  curtidas?: number;
  msg?: number;
  mensagens?: number;
};

const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const numero = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);
const formatar = (v: number) => new Intl.NumberFormat("pt-BR").format(v);

function Cartao({
  titulo,
  children,
  subtitulo = "Últimos 7 dias",
}: {
  titulo: string;
  children: ReactNode;
  subtitulo?: string;
}) {
  const [aberto, setAberto] = useState(true);
  return (
    <section className={styles.cartao}>
      <div className={styles.cabecalhoCartao}>
        <div>
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            className={styles.tituloBotao}
          >
            {titulo}
            <span className={aberto ? styles.seta : styles.setaFechada}>⌄</span>
          </button>
          <p className={styles.subtitulo}>{subtitulo}</p>
        </div>
        <span className={styles.pontos} aria-hidden="true">
          •••
        </span>
      </div>
      {aberto && <div className={styles.corpoCartao}>{children}</div>}
    </section>
  );
}

export default function MetricasONG() {
  const [pets, setPets] = useState<Registro[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const [resPets, resMetricas] = await Promise.allSettled([
        listarMeusAnimais(),
        buscarMetricas(),
      ]);
      if (!ativo) return;
      if (resPets.status === "fulfilled") {
        setPets(resPets.value as Registro[]);
      }
      if (resMetricas.status === "fulfilled") {
        setMetricas(resMetricas.value);
      }
      setCarregando(false);
    }

    void carregar();
    const onFocus = () => {
      void carregar();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      ativo = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const ativos = pets.filter(
    (p) => !["adotado", "adotada", "adopted", "inativo", "inativa"].includes((p.status || "").toLowerCase())
  );
  const ativosContagem = metricas
    ? metricas.disponiveis + metricas.reservados
    : ativos.length;
  const adotados = metricas
    ? metricas.adocoesConcluidas
    : pets.filter((p) => ["adotado", "adotada", "adopted"].includes((p.status || "").toLowerCase())).length;
  const vagas = metricas?.capacidade && metricas.capacidade > 0 ? metricas.capacidade : 20;
  const percentual = Math.min(100, Math.round((ativosContagem / vagas) * 100));
  const faixa = percentual >= 90 ? "Lotação Crítica" : percentual >= 60 ? "Atenção" : "Disponível";

  const petsDesempenho = metricas?.pets?.length
    ? metricas.pets.map((p) => ({
        id: p.id,
        nome: p.nome,
        foto: p.foto || "",
        views: numero(p.visualizacoes),
        likes: numero(p.favoritos),
        msgs: numero(p.solicitacoes),
        temDados: true,
      }))
    : pets.map((p) => ({
        id: p.id,
        nome: p.nome,
        foto: p.foto_url || "",
        views: numero(p.views ?? p.visualizacoes),
        likes: numero(p.likes ?? p.curtidas),
        msgs: numero(p.msg ?? p.mensagens),
        temDados: false,
      }));

  const temMetricasApi = metricas !== null;
  const totalViews = metricas ? numero(metricas.visualizacoesTotal) : 0;
  const variacaoMes =
    metricas && metricas.visualizacoesMesAnterior > 0
      ? Math.round(
          ((metricas.visualizacoesMes - metricas.visualizacoesMesAnterior) /
            metricas.visualizacoesMesAnterior) *
            100
        )
      : null;

  const ranking = [...petsDesempenho]
    .filter((p) => p.likes > 0)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 4);
  const maxLikes = Math.max(1, ...ranking.map((p) => p.likes));

  const melhores = [...petsDesempenho]
    .sort((a, b) => b.views + b.likes + b.msgs - (a.views + a.likes + a.msgs))
    .slice(0, 6);

  const hoje = new Date();
  const semana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - (6 - i));
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    return { chave, rotulo: dias[d.getDay()] };
  });

  const mapaAlcance = new Map(
    (metricas?.alcance ?? []).map((item) => [item.data.slice(0, 10), numero(item.total)])
  );
  const barrasAlcance = semana.map((d) => ({
    ...d,
    total: mapaAlcance.get(d.chave) ?? 0,
  }));
  const maxAlcance = Math.max(1, ...barrasAlcance.map((b) => b.total));

  return (
    <div className={styles.pagina}>
      <div className={styles.colunaEsquerda}>
        <Cartao titulo="Alcance">
          <div className={styles.grafico}>
            <div className={styles.eixoY}>
              {[100, 80, 60, 40, 20, 0].map((n) => (
                <span key={n}>{Math.round((n / 100) * maxAlcance)}</span>
              ))}
            </div>
            <div className={styles.areaBarras}>
              {barrasAlcance.map((item) => (
                <div
                  className={styles.colunaBarra}
                  key={item.chave}
                  title={`${item.rotulo}: ${item.total} visualizações`}
                >
                  <div
                    className={styles.barra}
                    style={{
                      height: `${item.total > 0 ? Math.max(6, Math.round((item.total / maxAlcance) * 100)) : 2}%`,
                    }}
                  />
                  <span>{item.rotulo}</span>
                </div>
              ))}
            </div>
          </div>
        </Cartao>

        <Cartao titulo="Economia em Saúde">
          <div className={styles.economia}>
            <div className={styles.pizza} style={{ background: "#ebe8f1" }} />
            <div className={styles.legenda}>
              <span>
                <i className={styles.legendaVermelha} />
                Consultas Veterinárias — sem dados
              </span>
              <span>
                <i className={styles.legendaVerde} />
                Exames e diagnósticos — sem dados
              </span>
              <span>
                <i className={styles.legendaRoxa} />
                Vacinas e Imunização — sem dados
              </span>
            </div>
          </div>
          <p className={styles.informacao}>
            A economia será calculada quando houver registros financeiros de atendimentos.
          </p>
        </Cartao>

        <Cartao titulo="Matches e Interesses">
          {ranking.length ? (
            <div className={styles.ranking}>
              {ranking.map((p) => (
                <div key={p.id} className={styles.linhaRanking}>
                  <span title={p.nome}>{p.nome}</span>
                  <div className={styles.trilho}>
                    <div
                      className={styles.preenchimento}
                      style={{ width: `${(p.likes / maxLikes) * 100}%` }}
                    >
                      {p.likes} {p.likes === 1 ? "favorito" : "favoritos"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.semRanking}>
              Ainda não há favoritos vinculados aos animais.
            </p>
          )}
        </Cartao>
      </div>

      <div className={styles.colunaDireita}>
        <section className={styles.visaoGeral}>
          <h2>Visão geral da base</h2>
          <div className={styles.estatisticas}>
            <div className={styles.estatistica}>
              <h3>Capacidade</h3>
              <div className={styles.valorLinha}>
                <strong>{percentual}%</strong>
                <span
                  className={`${styles.etiqueta} ${
                    percentual >= 90 ? styles.vermelho : styles.roxo
                  }`}
                >
                  {faixa}
                </span>
              </div>
              <small>
                ({ativosContagem}/{vagas} vagas)
              </small>
            </div>

            <div className={styles.estatistica}>
              <h3>Visualizações</h3>
              <div className={styles.valorLinha}>
                <strong>{temMetricasApi ? formatar(totalViews) : "—"}</strong>
                {variacaoMes !== null && (
                  <span className={`${styles.etiqueta} ${styles.rosa}`}>
                    {variacaoMes >= 0 ? `+${variacaoMes}%` : `${variacaoMes}%`} este mês
                  </span>
                )}
              </div>
              <small>
                {temMetricasApi
                  ? `${formatar(metricas.visualizacoesMes)} visualizações este mês`
                  : "Aguardando dados da API"}
              </small>
            </div>

            <div className={styles.estatistica}>
              <h3>Adoções concluídas</h3>
              <div className={styles.valorLinha}>
                <strong>{formatar(adotados)}</strong>
              </div>
              <small>pets com adoção concluída</small>
            </div>

            <div className={styles.estatistica}>
              <h3>Interesses na semana</h3>
              <div className={styles.valorLinha}>
                <strong>
                  {temMetricasApi ? formatar(metricas.interessesSemana) : "—"}
                </strong>
              </div>
              <small>
                {temMetricasApi
                  ? `${formatar(metricas.solicitacoesPendentes)} solicitações pendentes`
                  : "Aguardando dados da API"}
              </small>
            </div>
          </div>
        </section>

        <section className={styles.desempenho}>
          <div className={styles.desempenhoTopo}>
            <h2>Desempenho de Astros</h2>
            <span className={styles.pontos}>•••</span>
          </div>
          <div className={styles.listaPets}>
            {melhores.length ? (
              melhores.map((p) => (
                <div className={styles.petLinha} key={p.id}>
                  {p.foto ? (
                    <img src={p.foto} alt="" className={styles.petFoto} />
                  ) : (
                    <span className={styles.petAvatar} />
                  )}
                  <strong>{p.nome}</strong>
                  <span>{p.temDados ? formatar(p.views) : "—"} visualizações</span>
                  <span>{p.temDados ? formatar(p.likes) : "—"} favoritos</span>
                  <span>{p.temDados ? formatar(p.msgs) : "—"} pedidos</span>
                  <span className={`${styles.favorito} ${styles.green}`}>★</span>
                </div>
              ))
            ) : (
              <p className={styles.estadoVazio}>
                {carregando
                  ? "Carregando animais..."
                  : "Nenhum animal cadastrado na ONG."}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}