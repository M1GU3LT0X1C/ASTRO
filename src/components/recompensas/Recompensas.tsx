"use client";

import { useEffect, useState } from "react";
import { alerta } from "@/lib/alerta";
import { minhasSolicitacoes, solicitacoesRecebidas } from "@/lib/adocoes";
import { listarMeusAnimais } from "@/lib/animais";
import { lerUltimoPedido } from "@/lib/clinicasCarrinho";
import { listarPetsTutor } from "@/lib/explorador";
import {
  buscarRecompensas,
  concluirTarefa,
  fazerCheckin,
  listarAgenda,
  resgatarCupom,
  type Cupom,
  type EstadoRecompensas,
} from "@/lib/painel";
import styles from "./Recompensas.module.css";

type Perfil = "ong" | "explorador";
type StatusMissao = { cumprida: boolean; motivo: string };

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const MISSOES = [
  {
    id: "avaliar",
    titulo: "Avaliar estação de cuidado",
    pontos: 50,
    dicaPendente: "Envie uma avaliação em uma Estação de Cuidado / clínica parceira para liberar estes pontos.",
  },
  {
    id: "vacina",
    titulo: "Atualizar carteira de vacinação",
    pontos: 100,
    dicaPendente: "Cadastre ou marque a vacinação de pelo menos um pet em Meus Pets para liberar estes pontos.",
  },
  {
    id: "consulta",
    titulo: "Consulta em clínica parceira",
    pontos: 150,
    dicaPendente: "Agende ou confirme um atendimento em uma Estação de Cuidado / clínica parceira para liberar estes pontos.",
  },
  {
    id: "adotar",
    titulo: "Adotar pet com o Astro",
    pontos: 500,
    dicaPendente: "Conclua uma adoção pela plataforma Astro para liberar estes pontos.",
  },
];

// Converte getDay() (0=Dom..6=Sáb) para índice da grade (0=Seg..5=Sáb, 6=Dom)
function indiceDiaSemana(data: Date): number {
  return (data.getDay() + 6) % 7;
}

// check-ins da semana (datas yyyy-mm-dd vindas do back) -> dias exibidos (Seg a Dom)
function diasComCheckin(datas: string[]): Record<string, boolean> {
  return Object.fromEntries(
    datas.map((data) => [DIAS[indiceDiaSemana(new Date(`${data}T12:00:00`))] ?? data, true])
  );
}

export default function Recompensas({ perfil }: { perfil: Perfil }) {
  const [estado, setEstado] = useState<EstadoRecompensas | null>(null);
  const [processando, setProcessando] = useState(false);
  const [mostrarCupons, setMostrarCupons] = useState(true);
  const [hoje, setHoje] = useState(-1);
  const [aviso, setAviso] = useState("");
  const [progressoMissoes, setProgressoMissoes] = useState<Record<string, StatusMissao>>({});

  useEffect(() => {
    let ativo = true;

    async function carregarTudo() {
      try {
        const dados = await buscarRecompensas();
        if (!ativo) return;
        setEstado(dados);
        const dataRef = dados.hoje ? new Date(`${dados.hoje}T12:00:00`) : new Date();
        setHoje(indiceDiaSemana(dataRef));
      } catch {
        if (ativo) setAviso("Não foi possível carregar seus pontos. Tente novamente em instantes.");
      }

      // Verifica no back/estado real da conta quais missões o usuário realmente cumpriu
      const [petsTutor, petsOng, adocoes, agenda] = await Promise.all([
        perfil === "explorador" ? listarPetsTutor().catch(() => []) : Promise.resolve([]),
        perfil === "ong" ? listarMeusAnimais().catch(() => []) : Promise.resolve([]),
        perfil === "explorador"
          ? minhasSolicitacoes().catch(() => [])
          : solicitacoesRecebidas().catch(() => []),
        listarAgenda().catch(() => []),
      ]);

      if (!ativo) return;

      const temVacina =
        perfil === "explorador"
          ? petsTutor.some((p) => p.vacinado || (p.vacinas && p.vacinas.length > 0))
          : petsOng.some((p) => p.vacinado);

      const temAdocaoConcluida = adocoes.some((s) => s.status === "ADOCAO_CONCLUIDA");

      const ultimoPedido = lerUltimoPedido();
      const temConsultaClinica =
        Boolean(ultimoPedido?.numeroPedido) ||
        agenda.some(
          (c) =>
            Boolean(c.local?.trim()) &&
            /cl[ií]nica|vet|consulta|esta[cç][aã]o/i.test(`${c.descricao} ${c.local}`)
        );

      let temAvaliacao = false;
      try {
        const avaliacoesSalvas = localStorage.getItem("astro_avaliacoes_clinicas_v1");
        if (avaliacoesSalvas) {
          const parsed = JSON.parse(avaliacoesSalvas);
          temAvaliacao = Array.isArray(parsed) && parsed.length > 0;
        }
      } catch {
        temAvaliacao = false;
      }

      setProgressoMissoes({
        avaliar: {
          cumprida: temAvaliacao,
          motivo: MISSOES[0].dicaPendente,
        },
        vacina: {
          cumprida: temVacina,
          motivo: MISSOES[1].dicaPendente,
        },
        consulta: {
          cumprida: temConsultaClinica,
          motivo: MISSOES[2].dicaPendente,
        },
        adotar: {
          cumprida: temAdocaoConcluida,
          motivo: MISSOES[3].dicaPendente,
        },
      });
    }

    carregarTudo();
    return () => {
      ativo = false;
    };
  }, [perfil]);

  const carregado = estado !== null;
  const dados = {
    pontos: estado?.pontos ?? 0,
    checks: diasComCheckin(estado?.checkinsSemana ?? []),
    tarefas: Object.fromEntries((estado?.tarefas ?? []).map((t) => [t, true])) as Record<string, boolean>,
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

    const status = progressoMissoes[id];
    if (!status?.cumprida) {
      alerta.info(
        "Objetivo ainda não concluído",
        status?.motivo || `Complete o objetivo “${titulo}” antes de resgatar os +${pontos} pontos.`
      );
      return;
    }

    setProcessando(true);
    try {
      setEstado(await concluirTarefa(id));
      setAviso(`Missão concluída e verificada! Você ganhou +${pontos} pontos.`);
    } catch (e) {
      setAviso(
        e instanceof Error
          ? e.message
          : "Não foi possível registrar a missão no momento."
      );
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

  const checkinHojeFeito = hoje >= 0 && !!dados.checks[DIAS[hoje]];

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
                <button
                  key={dia}
                  type="button"
                  className={`${styles.dia} ${feito ? styles.diaFeito : ""} ${disponivel ? styles.diaHoje : ""}`}
                  disabled={!carregado || processando || !disponivel}
                  onClick={() => checkin(indice)}
                  aria-label={`${dia}: ${feito ? "check-in realizado" : disponivel ? "fazer check-in" : "indisponível"}`}
                >
                  <span className={styles.diaNome}>{dia}</span>
                  <span className={styles.diaValor}>{feito ? "✓" : "+10"}</span>
                </button>
              );
            })}
          </div>
          <p className={styles.dica}>
            {checkinHojeFeito
              ? "Check-in de hoje realizado! Volte amanhã para ganhar mais 10 pontos."
              : "Check-in disponível todos os dias (segunda a domingo) — o de hoje vale 10 pontos."}
          </p>

          <div className={styles.missoes} aria-label="Missões">
            {MISSOES.map((missao) => {
              const concluida = !!dados.tarefas[missao.id];
              const liberada = !!progressoMissoes[missao.id]?.cumprida;
              return (
                <button
                  key={missao.id}
                  type="button"
                  className={`${styles.missao} ${!concluida && !liberada ? styles.missaoPendente : ""}`}
                  disabled={!carregado || concluida || processando}
                  onClick={() => concluirMissao(missao.id, missao.pontos, missao.titulo)}
                  title={!concluida && !liberada ? missao.dicaPendente : undefined}
                >
                  <span>{missao.titulo}</span>
                  <span
                    className={`${styles.pontosMissao} ${
                      concluida
                        ? styles.concluida
                        : !liberada
                        ? styles.pendenteBadge
                        : ""
                    }`}
                  >
                    {concluida
                      ? "✓ Feito"
                      : liberada
                      ? `Resgatar +${missao.pontos} pts`
                      : `Pendente • +${missao.pontos} pts`}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.recompensas} aria-label="Recompensas ativas">
          <button className={styles.cabecalho} type="button" onClick={() => setMostrarCupons((v) => !v)} aria-expanded={mostrarCupons}>
            <span><strong>Recompensas Ativas</strong><span className={styles.periodo}>Semanalmente</span></span>
            <img src="/icons-recompensas/seta-baixo.svg" alt="" className={`${styles.seta} ${mostrarCupons ? "" : styles.setaFechada}`} aria-hidden="true" />
          </button>
          {mostrarCupons && (
            <div className={styles.cupons}>
              {(estado?.cupons ?? []).length === 0 && <p className={styles.dica}>Nenhum cupom disponível no momento.</p>}
              {(estado?.cupons ?? []).map((cupom) => (
                <article className={styles.cupom} key={cupom.id}>
                  <strong>{cupom.titulo}</strong>
                  <span>{cupom.descricao}</span>
                  <small>{cupom.custo} pontos</small>
                  <button type="button" disabled={!carregado || processando || dados.pontos < cupom.custo} onClick={() => resgatar(cupom)}>
                    {dados.pontos < cupom.custo ? `Faltam ${cupom.custo - dados.pontos} pts` : "Usar cupom"}
                  </button>
                </article>
              ))}
              {(estado?.resgates ?? []).length > 0 && (
                <p className={styles.dica}>Seus cupons: {(estado?.resgates ?? []).map((r) => `${r.titulo} (${r.codigo})`).join(", ")}</p>
              )}
            </div>
          )}
        </section>
      </div>
      {aviso && <p className={styles.aviso} role="status">{aviso}</p>}
    </main>
  );
}
