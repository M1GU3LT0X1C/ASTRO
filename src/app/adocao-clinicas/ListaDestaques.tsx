"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { House, Stethoscope } from "lucide-react";
import { listarOngs, localizacaoOng, type Ong } from "@/lib/ong";
import styles from "./adocao.module.css";

type Props = {
  tipo: "bases" | "clinicas";
  ordem: "visitas" | "avaliacao";
  textoVazio: string;
  dicaVazio: string;
};

/** Bases mais visitadas / Estações mais bem avaliadas (dados de /api/ongs). */
export default function ListaDestaques({ tipo, ordem, textoVazio, dicaVazio }: Props) {
  const [itens, setItens] = useState<Ong[] | null>(null);

  useEffect(() => {
    listarOngs({ tipo, ordem, limite: 10 }).then(setItens).catch(() => setItens([]));
  }, [tipo, ordem]);

  if (itens === null) {
    return <div className={styles.vazio}><span>Carregando...</span></div>;
  }

  if (itens.length === 0) {
    return (
      <div className={styles.vazio}>
        <p>{textoVazio}</p>
        <span>{dicaVazio}</span>
      </div>
    );
  }

  return (
    <div className={styles.cardsGrid}>
      {itens.map((ong) => (
        <Link
          key={ong.id}
          href={`/adocao-clinicas/ong/${ong.id}`}
          className={tipo === "bases" ? styles.cardBase : styles.cardEstacao}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 14, textDecoration: "none", color: "#221672", textAlign: "center" }}
        >
          <span style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "#fff0f4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {ong.logoUrl
              ? <img src={ong.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : tipo === "bases" ? <House size={28} /> : <Stethoscope size={28} />}
          </span>
          <strong style={{ fontSize: 13 }}>{ong.nomeOrganizacao}</strong>
          <small style={{ fontSize: 11, color: "#888" }}>{localizacaoOng(ong)}</small>
          {ordem === "avaliacao"
            ? <small style={{ fontSize: 12, color: "#f5a524" }} aria-label={`Nota ${ong.mediaAvaliacao.toFixed(1)} de 5`}>★ {ong.mediaAvaliacao.toFixed(1)} ({ong.totalAvaliacoes})</small>
            : <small style={{ fontSize: 11, color: "#888" }}>{ong.visualizacoes} visita{ong.visualizacoes === 1 ? "" : "s"}</small>}
        </Link>
      ))}
    </div>
  );
}
