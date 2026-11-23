"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useClinica } from "../useClinica";
import styles from "./Servicos.module.css";

const moeda = (valor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

export default function Servicos() {
  const { dados, pronto, atualizar } = useClinica();
  const servicos = [...dados.servicos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  const [pendente, setPendente] = useState<{ id: string; nome: string } | null>(null);
  const [confirmacao, setConfirmacao] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const campoConfirmacao = useRef<HTMLInputElement>(null);

  const confirmado = confirmacao.trim() === "EXCLUIR";

  useEffect(() => {
    if (!pendente) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    campoConfirmacao.current?.focus();
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setPendente(null);
        setConfirmacao("");
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [pendente]);

  function solicitarExclusao(id: string, nome: string) {
    setConfirmacao("");
    setPendente({ id, nome });
  }

  function excluir() {
    if (!pendente || !confirmado || excluindo) return;
    setExcluindo(true);
    try {
      atualizar(d => ({
        ...d,
        servicos: d.servicos.filter(s => s.id !== pendente.id),
      }));
      setPendente(null);
      setConfirmacao("");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <Link className={styles.novo} href="/dashboard-clinica/servicos/novo"><span aria-hidden="true">＋</span> Novo serviço</Link>
      <div className={styles.lista}>
        {pronto && servicos.length === 0 && <p className={styles.vazio}>Nenhum serviço cadastrado. Clique em “Novo serviço” para começar.</p>}
        {servicos.map(servico => (
          <article key={servico.id} className={`${styles.cartao} ${!servico.ativo ? styles.inativo : ""}`}>
            <div className={styles.info}>
              <h2>{servico.nome} {!servico.ativo && <span className={styles.estado}>Inativo</span>}</h2>
              <p>{servico.descricao}</p>
              <small>{servico.categoria}</small>
            </div>
            <div className={styles.lateral}>
              <Link className={styles.editar} href={`/dashboard-clinica/servicos/novo?id=${encodeURIComponent(servico.id)}`} aria-label={`Editar ${servico.nome}`} title="Editar serviço"><Image src="/icons-clinica/editar.svg" alt="" width={27} height={27}/></Link>
              <span className={styles.preco}>{servico.tipo === "adicionais" ? "A partir de " : ""}{moeda(servico.preco)}</span>
              <div className={styles.acoes}>
                <button type="button" onClick={() => atualizar(d => ({ ...d, servicos: d.servicos.map(s => s.id === servico.id ? { ...s, ativo: !s.ativo } : s) }))}>{servico.ativo ? "Desativar" : "Ativar"}</button>
                <button type="button" onClick={() => solicitarExclusao(servico.id, servico.nome)}>Excluir</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {pendente && (
        <div className={styles.modalFundo} onMouseDown={evento => {
          if (evento.target === evento.currentTarget) {
            setPendente(null);
            setConfirmacao("");
          }
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-exclusao" aria-describedby="descricao-exclusao">
            <div className={styles.modalIcone} aria-hidden="true">!</div>
            <h2 id="titulo-exclusao">Excluir serviço?</h2>
            <p id="descricao-exclusao" className={styles.modalDescricao}>
              Você está prestes a excluir <strong>{pendente.nome}</strong>.
              Essa ação é permanente e não poderá ser desfeita. As informações deste serviço serão removidas da clínica.
            </p>
            <label className={styles.modalLabel} htmlFor="confirmar-exclusao">
              Para confirmar, digite <strong>EXCLUIR</strong> no campo abaixo:
            </label>
            <input
              ref={campoConfirmacao}
              id="confirmar-exclusao"
              className={styles.modalInput}
              type="text"
              value={confirmacao}
              onChange={evento => setConfirmacao(evento.target.value)}
              placeholder="Digite EXCLUIR"
              autoComplete="off"
              spellCheck={false}
            />
            <div className={styles.modalAcoes}>
              <button type="button" className={styles.modalCancelar} onClick={() => {
                setPendente(null);
                setConfirmacao("");
              }}>Cancelar</button>
              <button type="button" className={styles.modalExcluir} disabled={!confirmado || excluindo} onClick={excluir}>
                {excluindo ? "Excluindo..." : "Excluir definitivamente"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
