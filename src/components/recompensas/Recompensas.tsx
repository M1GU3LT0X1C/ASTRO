"use client";

import { useEffect, useState } from "react";
import { alerta } from "@/lib/alerta";
import { buscarRecompensas, concluirTarefa, fazerCheckin, resgatarCupom, type Cupom, type EstadoRecompensas } from "@/lib/painel";
import styles from "./Recompensas.module.css";

type Perfil = "ong" | "explorador";
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const MISSOES = [
  { id: "avaliar", titulo: "Avaliar estágio de cuidado", pontos: 50 },
  { id: "vacina", titulo: "Atualizar carteira de vacinação", pontos: 100 },
  { id: "consulta", titulo: "Consulta em clínica parceira", pontos: 150 },
  { id: "adotar", titulo: "Adotar pet com o Astro", pontos: 500 },
];

// check-ins da semana (datas yyyy-mm-dd vindas do back) -> dias exibidos (Seg a Sex)
function diasComCheckin(datas: string[]): Record<string, boolean> {
  return Object.fromEntries(datas.map(data => [DIAS[new Date(`${data}T12:00:00`).getDay() - 1] ?? data, true]));
}

export default function Recompensas({ perfil }: { perfil: Perfil }) {
  const [estado, setEstado] = useState<EstadoRecompensas | null>(null);
  const [processando, setProcessando] = useState(false);
  const [mostrarCupons, setMostrarCupons] = useState(true);
  const [hoje, setHoje] = useState(-1);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let ativo = true;
    buscarRecompensas()
      .then(dados => {
        if (!ativo) return;
        setEstado(dados);
        const indice = new Date().getDay() - 1;
        setHoje(indice >= 0 && indice < 5 ? indice : -1);
      })
      .catch(() => { if (ativo) setAviso("Não foi possível carregar seus pontos. Tente novamente em instantes."); });
    return () => { ativo = false; };
  }, [perfil]);

  const carregado = estado !== null;
  const dados = {
    pontos: estado?.pontos ?? 0,
    checks: diasComCheckin(estado?.checkinsSemana ?? []),
    tarefas: Object.fromEntries((estado?.tarefas ?? []).map(t => [t, true])) as Record<string, boolean>,
  };

  async function checkin(indice: number) {
    if (!carregado || processando || indice !== hoje || dados.checks[DIAS[indice]]) return;
    setProcessando(true);
    try {
      setEstado(await fazerCheckin());
      setAviso("Check-in realizado! Você ganhou 10 pontos.");
    } catch {
      setAviso("Não foi possível fazer o check-in agora.");
    } finally {
      setProcessando(false);
    }
  }

  async function concluirMissao(id: string, pontos: number, titulo: string) {
    if (!carregado || processando || dados.tarefas[id]) return;
    const confirmou = await alerta.confirmar({
      title: `Você concluiu “${titulo}”?`,
      text: `Você vai ganhar +${pontos} pontos. Só confirme se realmente fez!`,
      confirmText: `Ganhar +${pontos}`, cancelText: "Ainda não",
    });
    if (!confirmou) return;
    setProcessando(true);
    try {
      setEstado(await concluirTarefa(id));
      setAviso(`Missão registrada: +${pontos} pontos.`);
    } catch {
      setAviso("Não foi possível registrar a missão.");
    } finally {
      setProcessando(false);
    }
  }

  async function resgatar(cupom: Cupom) {
    if (!carregado || processando || dados.pontos < cupom.custo) return;
    const confirmou = await alerta.confirmar({
      title: "Usar cupom?",
      text: `${cupom.titulo} ${cupom.descricao || ""} por ${cupom.custo} pontos.`,
      confirmText: "Usar agora",
    });
    if (!confirmou) return;
    setProcessando(true);
    try {
      const resgate = await resgatarCupom(cupom.id);
      setEstado(await buscarRecompensas());
      alerta.sucesso("Cupom liberado! 🎉", `Código: ${resgate.codigo}`);
    } catch (e) {
      alerta.erro("Não foi possível usar o cupom", e instanceof Error ? e.message : undefined);
    } finally {
      setProcessando(false);
    }
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
                <button key={dia} type="button" className={`${styles.dia} ${feito ? styles.diaFeito : ""} ${disponivel ? styles.diaHoje : ""}`} disabled={!carregado || processando || !disponivel} onClick={() => checkin(indice)} aria-label={`${dia}: ${feito ? "check-in realizado" : disponivel ? "fazer check-in" : "indisponível"}`}>
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
            {(estado?.cupons ?? []).length === 0 && <p className={styles.dica}>Nenhum cupom disponível no momento.</p>}
            {(estado?.cupons ?? []).map(cupom => (
              <article className={styles.cupom} key={cupom.id}>
                <strong>{cupom.titulo}</strong>
                <span>{cupom.descricao}</span>
                <small>{cupom.custo} pontos</small>
                <button type="button" disabled={!carregado || processando || dados.pontos < cupom.custo} onClick={() => resgatar(cupom)}>{dados.pontos < cupom.custo ? `Faltam ${cupom.custo - dados.pontos} pts` : "Usar cupom"}</button>
              </article>
            ))}
            {(estado?.resgates ?? []).length > 0 && (
              <p className={styles.dica}>Seus cupons: {(estado?.resgates ?? []).map(r => `${r.titulo} (${r.codigo})`).join(", ")}</p>
            )}
          </div>}
        </section>
      </div>
      {aviso && <p className={styles.aviso} role="status">{aviso}</p>}
    </main>
  );
}
