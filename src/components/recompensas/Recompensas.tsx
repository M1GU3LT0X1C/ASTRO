"use client";

import { useEffect, useState } from "react";
import styles from "./Recompensas.module.css";

type Perfil = "ong" | "explorador";
type Dados = { pontos: number; checks: Record<string, boolean>; tarefas: Record<string, boolean>; semana: string; cupons: string[] };
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const MISSOES = [
  { id: "avaliar", titulo: "Avaliar estágio de cuidado", pontos: 50 },
  { id: "vacina", titulo: "Atualizar carteira de vacinação", pontos: 100 },
  { id: "consulta", titulo: "Consulta em clínica parceira", pontos: 150 },
  { id: "adotar", titulo: "Adotar pet com o Astro", pontos: 500 },
];
const VAZIO: Dados = { pontos: 0, checks: {}, tarefas: {}, semana: "", cupons: [] };

function semanaAtual(data: Date) {
  const primeiro = new Date(data.getFullYear(), 0, 1);
  const numero = Math.ceil(((data.getTime() - primeiro.getTime()) / 86400000 + primeiro.getDay() + 1) / 7);
  return `${data.getFullYear()}-${numero}`;
}

export default function Recompensas({ perfil }: { perfil: Perfil }) {
  const chave = `astro_recompensas_${perfil}_v2`;
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [carregado, setCarregado] = useState(false);
  const [mostrarCupons, setMostrarCupons] = useState(true);
  const [hoje, setHoje] = useState(-1);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const agora = new Date();
    const indice = agora.getDay() - 1;
    const semana = semanaAtual(agora);
    setHoje(indice >= 0 && indice < 5 ? indice : -1);
    try {
      const anterior = JSON.parse(localStorage.getItem(chave) || "null") as Partial<Dados> | null;
      if (anterior) {
        setDados({ pontos: Number(anterior.pontos) || 0, checks: anterior.semana === semana ? anterior.checks || {} : {}, tarefas: anterior.tarefas || {}, semana, cupons: anterior.cupons || [] });
      } else {
        // Compatibilidade com os pontos anteriores, sem alterar o armazenamento legado.
        const legado = perfil === "ong" ? "astro_pontos" : "astro_explorador_pontos";
        setDados({ ...VAZIO, pontos: Number(localStorage.getItem(legado)) || 0, semana });
      }
    } catch { setDados({ ...VAZIO, semana }); }
    setCarregado(true);
  }, [chave, perfil]);

  function atualizar(proximo: Dados) {
    setDados(proximo);
    try { localStorage.setItem(chave, JSON.stringify(proximo)); }
    catch { setAviso("Não foi possível salvar os dados neste navegador."); }
  }

  function checkin(indice: number) {
    if (!carregado || indice !== hoje || dados.checks[DIAS[indice]]) return;
    atualizar({ ...dados, pontos: dados.pontos + 10, checks: { ...dados.checks, [DIAS[indice]]: true } });
    setAviso("Check-in realizado! Você ganhou 10 pontos.");
  }

  function concluirMissao(id: string, pontos: number, titulo: string) {
    if (!carregado || dados.tarefas[id]) return;
    if (!window.confirm(`Você concluiu “${titulo}”? Esta confirmação registra ${pontos} pontos localmente.`)) return;
    atualizar({ ...dados, pontos: dados.pontos + pontos, tarefas: { ...dados.tarefas, [id]: true } });
    setAviso(`Missão registrada: +${pontos} pontos.`);
  }

  function resgatar(indice: number) {
    const custo = 200;
    if (!carregado || dados.pontos < custo) return;
    if (!window.confirm(`Registrar o resgate de 25% OFF por ${custo} pontos? O cupom não será validado em um estabelecimento até existir integração.`)) return;
    atualizar({ ...dados, pontos: dados.pontos - custo, cupons: [...dados.cupons, `banho-${indice}-${Date.now()}`] });
    setAviso("Resgate registrado neste navegador. A utilização depende de validação pelo parceiro.");
  }

  return (
    <main className={styles.pagina}>
      <div className={styles.layout}>
        <section className={styles.painel} aria-label="Pontos e check-in">
          <div className={styles.pontos}>{carregado ? dados.pontos.toLocaleString("pt-BR") : "—"}</div>
          <div className={styles.subtitulo}>pontos acumulados</div>
          <p className={styles.validade}>Os pontos vencem em 60 dias conforme as regras do programa.</p>

          <h2 className={styles.tituloCheckin}>Check-in Diário</h2>
          <div className={styles.dias}>
            {DIAS.map((dia, indice) => {
              const feito = !!dados.checks[dia];
              const disponivel = indice === hoje && !feito;
              return (
                <button key={dia} type="button" className={`${styles.dia} ${feito ? styles.diaFeito : ""} ${disponivel ? styles.diaHoje : ""}`} disabled={!carregado || !disponivel} onClick={() => checkin(indice)} aria-label={`${dia}: ${feito ? "check-in realizado" : disponivel ? "fazer check-in" : "indisponível"}`}>
                  <span className={styles.diaNome}>{dia}</span>
                  <span className={styles.diaValor}>{feito ? "✓" : "+10"}</span>
                </button>
              );
            })}
          </div>
          <p className={styles.dica}>{hoje === -1 ? "Check-in disponível de segunda a sexta." : `O check-in de hoje vale 10 pontos.`}</p>

          <div className={styles.missoes} aria-label="Missões">
            {MISSOES.map(missao => (
              <button key={missao.id} type="button" className={styles.missao} disabled={!carregado || !!dados.tarefas[missao.id]} onClick={() => concluirMissao(missao.id, missao.pontos, missao.titulo)}>
                <span>{missao.titulo}</span>
                <span className={`${styles.pontosMissao} ${dados.tarefas[missao.id] ? styles.concluida : ""}`}>{dados.tarefas[missao.id] ? "✓ Feito" : `+${missao.pontos} pontos`}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.recompensas} aria-label="Recompensas ativas">
          <button className={styles.cabecalho} type="button" onClick={() => setMostrarCupons(v => !v)} aria-expanded={mostrarCupons}>
            <span><strong>Recompensas Ativas</strong><span className={styles.periodo}>Semanalmente</span></span>
            <img src="/icons-recompensas/seta-baixo.svg" alt="" className={`${styles.seta} ${mostrarCupons ? "" : styles.setaFechada}`} aria-hidden="true" />
          </button>
          {mostrarCupons && <div className={styles.cupons}>
            {[0, 1].map(indice => (
              <article className={styles.cupom} key={indice}>
                <strong>25% OFF</strong>
                <span>em banho e tosa</span>
                <small>200 pontos</small>
                <button type="button" disabled={!carregado || dados.pontos < 200} onClick={() => resgatar(indice)}>{dados.pontos < 200 ? `Faltam ${200 - dados.pontos} pts` : "Usar cupom"}</button>
              </article>
            ))}
          </div>}
        </section>
      </div>
      {aviso && <p className={styles.aviso} role="status">{aviso}</p>}
    </main>
  );
}
