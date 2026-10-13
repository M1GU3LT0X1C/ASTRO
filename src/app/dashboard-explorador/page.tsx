
"use client";

import Link from "next/link";
import {
  PawPrint,
  CalendarDays,
  TicketPercent,
  Stethoscope,
  ChevronDown,
  AlertTriangle,
  MapPin,
} from "lucide-react";

import styles from "./Painel.module.css";

const acoes = [
  {
    titulo: "Adicionar Pet",
    href: "/dashboard-explorador/meus-pets",
    icone: PawPrint,
    cor: "azul",
  },
  {
    titulo: "Agendar Consulta",
    href: "/dashboard-explorador/agenda",
    icone: CalendarDays,
    cor: "rosa",
  },
  {
    titulo: "Cupons Ativos",
    href: "/dashboard-explorador/recompensas",
    icone: TicketPercent,
    cor: "azul",
  },
  {
    titulo: "Ver Estações",
    href: "/adocao-clinicas",
    icone: Stethoscope,
    cor: "rosa",
  },
] as const;

export default function DashboardExploradorPage() {
  return (
    <div className={styles.pagina}>
      <section className={styles.boasVindas}>
        <h1>
          Olá, Explorador! Que bom te ver no centro de controle!
        </h1>
        <p>
          Que tal fazer um Check-in para ganhar pontos?
        </p>
      </section>

      <section className={styles.acoesRapidas}>
        <h2>Acesso rápido</h2>

        <div className={styles.acoesGrid}>
          {acoes.map((acao) => {
            const Icone = acao.icone;

            return (
              <Link
                key={acao.titulo}
                href={acao.href}
                className={`${styles.acao} ${
                  acao.cor === "azul"
                    ? styles.acaoAzul
                    : styles.acaoRosa
                }`}
              >
                <Icone size={18} aria-hidden="true" />
                <span>{acao.titulo}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className={styles.cardsGrid}>
        {/* CARD DE SAÚDE DO PET */}
        <section
          className={styles.cardSaude}
          aria-label="Saúde do pet - dados demonstrativos"
        >
          <div className={styles.cabecalhoSaude}>
            <div className={styles.seletorPet}>
              <span className={styles.bolinhaPet} />
              <span>Nome do Pet</span>
              <ChevronDown size={15} aria-hidden="true" />
            </div>

            <div className={styles.statusAtencao}>
              <span className={styles.bolinhaAmarela} />
              <span>Precisa de Atenção</span>
            </div>
          </div>

          <div className={styles.conteudoSaude}>
            <div
              className={styles.barraProtecao}
              role="progressbar"
              aria-label="Proteção demonstrativa do pet"
              aria-valuenow={80}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={styles.progressoProtecao}>
                <strong>80% de proteção</strong>
              </div>
            </div>

            <div className={styles.listaAlertas}>
              <div className={styles.alerta}>
                <AlertTriangle size={16} aria-hidden="true" />
                <p>
                  <strong>Alerta do Astro:</strong> Reforço da
                  Vacina V10 vence em 8 dias (19/10)
                </p>
              </div>

              <div className={styles.alerta}>
                <AlertTriangle size={16} aria-hidden="true" />
                <p>
                  <strong>Alerta do Astro:</strong> O pet
                  (nome do pet) está a um ano sem check-up
                </p>
              </div>
            </div>
          </div>

          <div className={styles.botoesCard}>
            <Link
              href="/dashboard-explorador/agenda"
              className={styles.botaoRosa}
            >
              Agendar na clínica
            </Link>

            <Link
              href="/dashboard-explorador/meus-pets"
              className={styles.botaoAzul}
            >
              Prontuário completo
            </Link>
          </div>
        </section>

        {/* CARD DO PRÓXIMO COMPROMISSO */}
        <section
          className={styles.cardCompromisso}
          aria-label="Próximo compromisso - dados demonstrativos"
        >
          <div className={styles.cabecalhoCompromisso}>
            <div className={styles.tituloCompromisso}>
              <CalendarDays size={19} aria-hidden="true" />
              <strong>Próximo Compromisso</strong>
            </div>

            <span className={styles.prazoCompromisso}>
              Daqui a 2 dias
            </span>
          </div>

          <div className={styles.conteudoCompromisso}>
            <div className={styles.dadosPet}>
              <div className={styles.nomePetCompromisso}>
                <span className={styles.bolinhaAzul} />
                <span>Nome do pet</span>
              </div>

              <span className={styles.dataCompromisso}>
                14/10
              </span>
            </div>

            <div className={styles.detalhesCompromisso}>
              <p>Vacina V10 (reforço)</p>

              <div className={styles.localCompromisso}>
                <MapPin size={17} aria-hidden="true" />
                <span>Hospital Veterinário Recife</span>
              </div>
            </div>
          </div>

          <div className={styles.botoesCard}>
            <Link
              href="/dashboard-explorador/agenda"
              className={styles.botaoRosa}
            >
              Agendar na clínica
            </Link>

            <Link
              href="/dashboard-explorador/meus-pets"
              className={styles.botaoAzul}
            >
              Prontuário completo
            </Link>
          </div>
        </section>
      </div>

      <p className={styles.avisoDemonstracao}>
        Pré-visualização: informações de saúde e agendamento
        meramente ilustrativas.
      </p>
    </div>
  );
}
