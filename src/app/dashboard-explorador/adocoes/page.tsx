"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ClipboardCheck, Heart, MessageCircle, Search, PawPrint, CalendarDays, XCircle } from "lucide-react";
import { alerta } from "@/lib/alerta";
import { acordarServidor } from "@/lib/api";
import { garantirTutor } from "@/lib/perfil";
import { EM_ANDAMENTO, ROTULO_STATUS, cancelarSolicitacao, minhasSolicitacoes, type Solicitacao, type StatusAdocao } from "@/lib/adocoes";
import styles from "./Adocoes.module.css";

type Etapa = 0 | 1 | 2 | 3;
const etapas = ["Solicitação enviada", "Em análise", "Entrevista", "Adoção concluída"] as const;

// status do back -> etapa da linha do tempo
const ETAPA_DO_STATUS: Record<StatusAdocao, Etapa> = {
  PENDENTE: 0, EM_ANALISE: 1, ENTREVISTA: 2, APROVADA: 2, ADOCAO_CONCLUIDA: 3, REPROVADA: 0, CANCELADA: 0,
};

const icones = [ClipboardCheck, Search, MessageCircle, Heart];

export default function MinhasAdocoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [selecionada, setSelecionada] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    acordarServidor();

    async function carregar() {
      try {
        const lista = await minhasSolicitacoes();
        if (ativo) setSolicitacoes(lista);
      } catch {
        const nome =
          (typeof window !== "undefined" && localStorage.getItem("pessoa_nome")) || "Explorador";
        await garantirTutor(nome).catch(() => null);
        const listaRetry = await minhasSolicitacoes().catch(() => []);
        if (ativo) setSolicitacoes(listaRetry);
      } finally {
        if (ativo) setCarregado(true);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const atual = solicitacoes.find((item) => item.id === selecionada) ?? solicitacoes[0];
  const progresso = atual ? ETAPA_DO_STATUS[atual.status] : 0;
  const encerrada = atual && (atual.status === "REPROVADA" || atual.status === "CANCELADA");

  async function cancelar(s: Solicitacao) {
    const confirmou = await alerta.confirmar({ title: `Cancelar a solicitação de ${s.nomePet}?`, confirmText: "Cancelar solicitação", cancelText: "Voltar", icon: "warning" });
    if (!confirmou) return;
    try {
      const atualizada = await cancelarSolicitacao(s.id);
      setSolicitacoes((lista) => lista.map((item) => (item.id === s.id ? atualizada : item)));
    } catch (erro) {
      alerta.erro("Não foi possível cancelar", erro instanceof Error ? erro.message : undefined);
    }
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1>Minhas adoções</h1>
          <p>Acompanhe suas solicitações e o andamento de cada adoção.</p>
        </div>
        <Link href="/adocao-clinicas" className={styles.encontrar}>Encontrar pets</Link>
      </header>

      {!carregado ? (
        <div className={styles.vazio} role="status">Carregando solicitações...</div>
      ) : solicitacoes.length === 0 ? (
        <section className={styles.vazio}>
          <PawPrint size={42} aria-hidden="true" />
          <h2>Nenhuma solicitação de adoção</h2>
          <p>Você ainda não possui solicitações de adoção.</p>
          <Link href="/adocao-clinicas" className={styles.encontrar}>Conhecer pets disponíveis</Link>
        </section>
      ) : (
        <>
          <section aria-label="Solicitações de adoção" className={styles.lista}>
            {solicitacoes.map((solicitacao) => {
              const ativo = atual?.id === solicitacao.id;
              return (
                <article key={solicitacao.id} className={`${styles.cartao} ${ativo ? styles.cartaoAtivo : ""}`}>
                  <div className={styles.cartaoTopo}>
                    <div className={styles.petIcone}>
                      {solicitacao.fotoPet ? <img src={solicitacao.fotoPet} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : <PawPrint size={22} aria-hidden="true" />}
                    </div>
                    <div className={styles.cartaoIdentidade}>
                      <h2>{solicitacao.nomePet || "Pet sem nome informado"}</h2>
                      <span>{solicitacao.nomeOng}</span>
                    </div>
                  </div>
                  <div className={styles.cartaoDetalhes}>
                    <span className={styles.etiqueta}>{ROTULO_STATUS[solicitacao.status]}</span>
                    <span className={styles.data}><CalendarDays size={14} aria-hidden="true" />{new Date(solicitacao.criadoEm).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <button type="button" className={styles.acompanhar} aria-pressed={ativo} onClick={() => setSelecionada(solicitacao.id)}>
                    {ativo ? "Solicitação selecionada" : "Acompanhar solicitação"}
                  </button>
                </article>
              );
            })}
          </section>
          {atual && (
            <section className={styles.acompanhamento} aria-label={`Andamento da adoção de ${atual.nomePet}`}>
              <div className={styles.acompanhamentoTopo}>
                <h2>Andamento da adoção</h2>
                <p>{atual.nomePet} · {ROTULO_STATUS[atual.status]}</p>
              </div>
              {encerrada ? (
                <p style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                  <XCircle size={20} aria-hidden="true" />
                  {atual.status === "CANCELADA" ? "Você cancelou esta solicitação." : "A ONG não aprovou esta solicitação. Que tal conhecer outros pets?"}
                </p>
              ) : (
                <ol className={styles.etapas}>
                  {etapas.map((titulo, indice) => {
                    const Icone = icones[indice];
                    const concluida = indice < progresso || (progresso === 3 && indice === 3);
                    const ativa = indice === progresso && progresso !== 3;
                    return (
                      <li key={titulo} className={`${styles.etapa} ${concluida ? styles.concluida : ""} ${ativa ? styles.ativa : ""}`} aria-current={ativa ? "step" : undefined}>
                        <Icone size={34} strokeWidth={2.6} aria-hidden="true" />
                        <strong>{titulo}</strong>
                        {concluida && <BadgeCheck size={16} className={styles.confirmacao} aria-label="Concluída" />}
                      </li>
                    );
                  })}
                </ol>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                {atual.ongUsuarioId && <Link href={`/dashboard-explorador/mensagens?destinatario=${atual.ongUsuarioId}`} className={styles.encontrar}>Falar com a ONG</Link>}
                <Link href={`/adocao-clinicas/pet/${atual.petId}`} className={styles.encontrar}>Ver pet</Link>
                {EM_ANDAMENTO.includes(atual.status) && (
                  <button type="button" className={styles.acompanhar} onClick={() => cancelar(atual)}>Cancelar solicitação</button>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
