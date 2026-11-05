"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ClipboardCheck, Heart, MessageCircle, Search, PawPrint, CalendarDays } from "lucide-react";
import { CHAVES, lerLocal, type Adocao } from "../dados-locais";
import styles from "./Adocoes.module.css";

type Etapa = 0 | 1 | 2 | 3;
const etapas = ["Solicitação enviada", "Em análise", "Entrevista", "Adoção concluída"] as const;

function etapaAtual(status: string): Etapa {
  const valor = status.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (valor.includes("conclu") || valor.includes("aprovad") || valor.includes("adotad")) return 3;
  if (valor.includes("entrevista")) return 2;
  if (valor.includes("analise") || valor.includes("avaliacao")) return 1;
  return 0;
}

const icones = [ClipboardCheck, Search, MessageCircle, Heart];

export default function MinhasAdocoes() {
  const [solicitacoes, setSolicitacoes] = useState<Adocao[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [selecionada, setSelecionada] = useState<string | null>(null);

  useEffect(() => {
    setSolicitacoes(lerLocal<Adocao[]>(CHAVES.adocoes, []));
    setCarregado(true);
  }, []);

  const atual = solicitacoes.find((item) => item.id === selecionada) ?? solicitacoes[0];
  const progresso = atual ? etapaAtual(atual.status) : 0;

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
              const etapa = etapaAtual(solicitacao.status);
              return (
                <article key={solicitacao.id} className={`${styles.cartao} ${ativo ? styles.cartaoAtivo : ""}`}>
                  <div className={styles.cartaoTopo}>
                    <div className={styles.petIcone}><PawPrint size={22} aria-hidden="true" /></div>
                    <div className={styles.cartaoIdentidade}>
                      <h2>{solicitacao.nomePet || "Pet sem nome informado"}</h2>
                      <span>Solicitação de adoção</span>
                    </div>
                  </div>
                  <div className={styles.cartaoDetalhes}>
                    <span className={styles.etiqueta}>{etapas[etapa]}</span>
                    {solicitacao.data && <span className={styles.data}><CalendarDays size={14} aria-hidden="true" />{solicitacao.data}</span>}
                  </div>
                  <button type="button" className={styles.acompanhar} aria-pressed={ativo} onClick={() => setSelecionada(solicitacao.id)}>
                    {ativo ? "Solicitação selecionada" : "Acompanhar solicitação"}
                  </button>
                </article>
              );
            })}
          </section>
          <section className={styles.acompanhamento} aria-label={`Andamento da adoção de ${atual.nomePet}`}>
            <div className={styles.acompanhamentoTopo}>
              <h2>Andamento da adoção</h2>
              <p>{atual.nomePet} · {atual.status}</p>
            </div>
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
          </section>
        </>
      )}
    </div>
  );
}
