"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle, PawPrint } from "lucide-react";
import { alerta } from "@/lib/alerta";
import {
  EM_ANDAMENTO, ROTULO_STATUS, decidirSolicitacao, solicitacoesRecebidas,
  type Solicitacao, type StatusAdocao,
} from "@/lib/adocoes";
import type { Questionario } from "@/lib/explorador";
import styles from "./Adocoes.module.css";

type Filtro = "andamento" | "encerradas" | "todas";

const PERGUNTAS: [keyof Questionario, string][] = [
  ["moradia", "Moradia"],
  ["condicao", "Condição do imóvel"],
  ["redes", "Telas de proteção"],
  ["quintal", "Quintal"],
  ["acessoRua", "Acesso à rua"],
  ["modeloTrabalho", "Modelo de trabalho"],
  ["tempoSozinho", "Tempo que o pet ficará sozinho"],
  ["pessoasCasa", "Pessoas na casa"],
  ["moradoresConcordam", "Moradores concordam"],
  ["petsResidencia", "Outros pets na residência"],
];

// proximas etapas que a ONG pode escolher a partir de cada status
const ACOES: Partial<Record<StatusAdocao, { decisao: Exclude<StatusAdocao, "PENDENTE" | "CANCELADA">; texto: string; perigo?: boolean }[]>> = {
  PENDENTE: [
    { decisao: "EM_ANALISE", texto: "Iniciar análise" },
    { decisao: "REPROVADA", texto: "Recusar", perigo: true },
  ],
  EM_ANALISE: [
    { decisao: "ENTREVISTA", texto: "Agendar entrevista" },
    { decisao: "APROVADA", texto: "Aprovar" },
    { decisao: "REPROVADA", texto: "Recusar", perigo: true },
  ],
  ENTREVISTA: [
    { decisao: "APROVADA", texto: "Aprovar" },
    { decisao: "REPROVADA", texto: "Recusar", perigo: true },
  ],
  APROVADA: [
    { decisao: "ADOCAO_CONCLUIDA", texto: "Concluir adoção" },
    { decisao: "REPROVADA", texto: "Cancelar aprovação", perigo: true },
  ],
};

export default function SolicitacoesRecebidas() {
  const [itens, setItens] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("andamento");
  const [aberta, setAberta] = useState<string | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);

  useEffect(() => {
    solicitacoesRecebidas()
      .then(setItens)
      .catch(() => alerta.erro("Não foi possível carregar as solicitações"))
      .finally(() => setCarregando(false));
  }, []);

  const visiveis = useMemo(() => itens.filter((s) =>
    filtro === "todas" || (filtro === "andamento") === EM_ANDAMENTO.includes(s.status)), [itens, filtro]);

  async function decidir(s: Solicitacao, decisao: Exclude<StatusAdocao, "PENDENTE" | "CANCELADA">, texto: string) {
    const confirmou = await alerta.confirmar({
      title: `${texto}?`,
      text: `Solicitação de ${s.nomeTutor} para adotar ${s.nomePet}.`,
      confirmText: texto,
      icon: decisao === "REPROVADA" ? "warning" : "question",
    });
    if (!confirmou) return;
    setProcessando(s.id);
    try {
      const atualizada = await decidirSolicitacao(s.id, decisao);
      setItens((lista) => lista.map((item) => (item.id === s.id ? atualizada : item)));
      // concluir encerra os outros pedidos do mesmo pet no back: recarrega a lista
      if (decisao === "ADOCAO_CONCLUIDA") setItens(await solicitacoesRecebidas());
      if (decisao === "ADOCAO_CONCLUIDA") alerta.sucesso("Adoção concluída! 🎉", `${s.nomePet} agora está marcado como adotado.`);
    } catch (erro) {
      alerta.erro("Não foi possível atualizar", erro instanceof Error ? erro.message : undefined);
    } finally {
      setProcessando(null);
    }
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1>Solicitações de adoção</h1>
          <p>Analise os pedidos recebidos para os seus pets e acompanhe cada etapa.</p>
        </div>
        <div className={styles.abas} role="tablist">
          {(["andamento", "encerradas", "todas"] as Filtro[]).map((f) => (
            <button key={f} role="tab" aria-selected={filtro === f} className={filtro === f ? styles.abaAtiva : ""} onClick={() => setFiltro(f)}>
              {f === "andamento" ? "Em andamento" : f === "encerradas" ? "Encerradas" : "Todas"}
            </button>
          ))}
        </div>
      </header>

      {carregando ? <p className={styles.vazio}>Carregando solicitações...</p>
        : visiveis.length === 0 ? (
          <div className={styles.vazio}>
            <PawPrint size={36} aria-hidden="true" />
            <strong>Nenhuma solicitação {filtro === "andamento" ? "em andamento" : filtro === "encerradas" ? "encerrada" : "recebida"}</strong>
            <p>Os pedidos de adoção dos seus pets aparecerão aqui.</p>
          </div>
        ) : (
          <div className={styles.lista}>
            {visiveis.map((s) => {
              const expandida = aberta === s.id;
              return (
                <article key={s.id} className={styles.cartao}>
                  <div className={styles.topo}>
                    <div className={styles.foto}>{s.fotoPet ? <img src={s.fotoPet} alt={s.nomePet} /> : <PawPrint size={26} />}</div>
                    <div className={styles.identidade}>
                      <h2>{s.nomePet}</h2>
                      <span>Pedido de <strong>{s.nomeTutor}</strong> · {new Date(s.criadoEm).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <span className={`${styles.status} ${styles["status_" + s.status]}`}>{ROTULO_STATUS[s.status]}</span>
                  </div>

                  {s.mensagem && <p className={styles.mensagem}>“{s.mensagem}”</p>}

                  <button type="button" className={styles.detalhes} aria-expanded={expandida} onClick={() => setAberta(expandida ? null : s.id)}>
                    Questionário e contato <ChevronDown size={16} className={expandida ? styles.girado : ""} />
                  </button>
                  {expandida && (
                    <div className={styles.questionario}>
                      <p><strong>E-mail:</strong> {s.emailTutor || "Não informado"}</p>
                      <p><strong>Telefone:</strong> {s.telefoneTutor || "Não informado"}</p>
                      {s.questionario ? (
                        <dl>
                          {PERGUNTAS.map(([campo, rotulo]) => (
                            <div key={campo}><dt>{rotulo}</dt><dd>{String(s.questionario?.[campo] || "—")}</dd></div>
                          ))}
                          {s.questionario.tiposPets.length > 0 && <div><dt>Quais pets</dt><dd>{s.questionario.tiposPets.join(", ")}</dd></div>}
                        </dl>
                      ) : <p className={styles.semQuestionario}>O explorador ainda não respondeu o questionário de adoção.</p>}
                    </div>
                  )}

                  <div className={styles.acoes}>
                    <Link href={`/dashboard/mensagens?destinatario=${s.tutorId}`} className={styles.botaoSecundario}>
                      <MessageCircle size={15} /> Mensagem
                    </Link>
                    {(ACOES[s.status] ?? []).map((acao) => (
                      <button key={acao.decisao} type="button" disabled={processando === s.id}
                        className={acao.perigo ? styles.botaoPerigo : styles.botao}
                        onClick={() => decidir(s, acao.decisao, acao.texto)}>
                        {acao.texto}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
    </div>
  );
}
