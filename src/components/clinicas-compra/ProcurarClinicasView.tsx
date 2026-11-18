"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
  Heart,
  MapPin,
  Star,
  Stethoscope,
} from "lucide-react";
import {
  FILTROS_CLINICAS,
  alternarClinicaFavorita,
  lerClinicasFavoritas,
  type FiltroClinica,
} from "@/lib/clinicasCarrinho";
import { listarOngs, localizacaoOng, type Ong } from "@/lib/ong";
import {
  adicionarFavorito,
  listarFavoritos,
  removerFavorito,
} from "@/lib/painel";
import styles from "./ClinicasCompra.module.css";

interface ProcurarClinicasViewProps {
  basePath: "/dashboard-explorador" | "/dashboard";
}

export function ProcurarClinicasView({ basePath }: ProcurarClinicasViewProps) {
  const searchParams = useSearchParams();
  const termoUrl = searchParams.get("busca") || "";

  const [clinicas, setClinicas] = useState<Ong[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltroClinica[]>([]);
  const [ordenacao, setOrdenacao] = useState<"proximas" | "avaliacao" | "nome">(
    "proximas"
  );
  const [favoritas, setFavoritas] = useState<string[]>([]);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const [listaClinicas, listaFavs] = await Promise.all([
        listarOngs({
          tipo: "clinicas",
          endereco: termoUrl || undefined,
          ordem: ordenacao === "avaliacao" ? "avaliacao" : "visitas",
        }).catch(() => []),
        listarFavoritos().catch(() => null),
      ]);
      if (!ativo) return;
      setClinicas(listaClinicas);
      if (listaFavs) {
        setFavoritas(
          listaFavs.filter((f) => f.tipo === "ong").map((f) => f.alvoId)
        );
      } else {
        setFavoritas(lerClinicasFavoritas());
      }
      setCarregando(false);
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [termoUrl, ordenacao]);

  function toggleFiltro(filtro: FiltroClinica) {
    setFiltrosAtivos((atual) =>
      atual.includes(filtro)
        ? atual.filter((f) => f !== filtro)
        : [...atual, filtro]
    );
  }

  function limparFiltros() {
    setFiltrosAtivos([]);
  }

  async function handleToggleFavorito(ongId: string) {
    const jaFav = favoritas.includes(ongId);
    const otimista = alternarClinicaFavorita(ongId);
    setFavoritas(otimista);
    try {
      if (jaFav) await removerFavorito("ong", ongId);
      else await adicionarFavorito("ong", ongId);
    } catch {
      // mantém estado local caso não haja sessão ativa no back
    }
  }

  const clinicasFiltradas = useMemo(() => {
    const termo = termoUrl.trim().toLowerCase();
    const filtradas = clinicas.filter((clinica) => {
      if (termo) {
        const nome = (clinica.nomeOrganizacao || "").toLowerCase();
        const local = localizacaoOng(clinica).toLowerCase();
        if (!nome.includes(termo) && !local.includes(termo)) return false;
      }
      if (filtrosAtivos.length === 0) return true;
      const descricao = (clinica.descricao || "").toLowerCase();
      return filtrosAtivos.every((filtro) =>
        descricao.includes(filtro.toLowerCase())
      );
    });

    return [...filtradas].sort((a, b) => {
      if (ordenacao === "avaliacao")
        return (b.mediaAvaliacao || 0) - (a.mediaAvaliacao || 0);
      if (ordenacao === "nome")
        return (a.nomeOrganizacao || "").localeCompare(
          b.nomeOrganizacao || "",
          "pt-BR"
        );
      return 0;
    });
  }, [clinicas, termoUrl, filtrosAtivos, ordenacao]);

  return (
    <div className={styles.wrapper} data-node-id="1238:2050">
      <div className={styles.barraControles}>
        <div className={styles.esquerdaControles}>
          <button
            type="button"
            className={styles.btnFiltroBox}
            onClick={() => setMostrarFiltros((v) => !v)}
            aria-expanded={mostrarFiltros}
          >
            <SlidersHorizontal size={20} />
            <span>Filtro</span>
          </button>

          <button
            type="button"
            className={styles.btnLimparFiltro}
            onClick={limparFiltros}
            disabled={filtrosAtivos.length === 0}
          >
            Limpar Filtro
          </button>
        </div>

        <div className={styles.ordenarWrap}>
          <select
            className={styles.ordenarSelect}
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)}
            aria-label="Ordenar clínicas"
          >
            <option value="proximas">Ordenar</option>
            <option value="avaliacao">Melhor avaliação</option>
            <option value="nome">Ordem alfabética</option>
          </select>
          <ChevronDown size={18} className={styles.ordenarIcone} />
        </div>
      </div>

      {mostrarFiltros && (
        <div
          className={styles.caixaTags}
          role="group"
          aria-label="Filtros de clínicas"
        >
          {FILTROS_CLINICAS.map((filtro) => {
            const ativo = filtrosAtivos.includes(filtro);
            return (
              <button
                key={filtro}
                type="button"
                onClick={() => toggleFiltro(filtro)}
                className={`${styles.tagPill} ${
                  ativo ? styles.tagPillAtiva : ""
                }`}
                aria-pressed={ativo}
              >
                <span>{filtro}</span>
                {ativo && (
                  <span className={styles.tagRemoveCircle} aria-hidden="true">
                    ×
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {carregando ? (
        <div
          className={styles.painelBorda}
          style={{ textAlign: "center", padding: "48px 24px" }}
        >
          <p style={{ margin: 0, color: "#555" }}>Carregando clínicas...</p>
        </div>
      ) : clinicasFiltradas.length === 0 ? (
        <div
          className={styles.painelBorda}
          style={{
            textAlign: "center",
            padding: "48px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Stethoscope size={38} color="#0d0062" />
          <strong style={{ fontSize: 16, color: "#0d0062" }}>
            Nenhuma clínica encontrada
          </strong>
          <p style={{ margin: 0, color: "#666", fontSize: 14, maxWidth: 420 }}>
            {filtrosAtivos.length > 0 || termoUrl
              ? "Nenhuma clínica corresponde aos filtros selecionados. Tente limpar os filtros para ver todas as opções."
              : "Ainda não há clínicas parceiras cadastradas no momento."}
          </p>
        </div>
      ) : (
        <div className={styles.gridClinicas}>
          {clinicasFiltradas.map((clinica) => {
            const ehFav = favoritas.includes(clinica.id);
            const estrelasCheias = Math.round(clinica.mediaAvaliacao || 0);

            return (
              <div key={clinica.id} className={styles.cardClinica}>
                <button
                  type="button"
                  className={styles.btnFavCard}
                  aria-label={
                    ehFav
                      ? `Remover ${clinica.nomeOrganizacao} dos favoritos`
                      : `Favoritar ${clinica.nomeOrganizacao}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorito(clinica.id);
                  }}
                >
                  <Heart
                    size={24}
                    fill={ehFav ? "#de4067" : "none"}
                    stroke="#de4067"
                  />
                </button>

                <Link
                  href={`${basePath}/clinicas/${clinica.id}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textDecoration: "none",
                    color: "inherit",
                    width: "100%",
                  }}
                >
                  <div className={styles.logoClinicaCircle}>
                    {clinica.logoUrl ? (
                      <img
                        src={clinica.logoUrl}
                        alt={clinica.nomeOrganizacao}
                      />
                    ) : (
                      <Stethoscope size={42} color="#0d0062" />
                    )}
                  </div>

                  <h3 className={styles.nomeClinicaCard}>
                    {clinica.nomeOrganizacao}
                  </h3>

                  <div className={styles.localClinicaCard}>
                    <MapPin size={13} />
                    <span>{localizacaoOng(clinica)}</span>
                  </div>

                  <div
                    className={styles.estrelasLinha}
                    aria-label={`Avaliação ${clinica.mediaAvaliacao || 0} de 5`}
                  >
                    {[1, 2, 3, 4, 5].map((indice) => (
                      <Star
                        key={indice}
                        size={22}
                        className={
                          indice <= estrelasCheias
                            ? styles.estrelaCheia
                            : styles.estrelaVazia
                        }
                        fill={indice <= estrelasCheias ? "#de4067" : "#d6d3de"}
                        stroke={
                          indice <= estrelasCheias ? "#de4067" : "#d6d3de"
                        }
                      />
                    ))}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
