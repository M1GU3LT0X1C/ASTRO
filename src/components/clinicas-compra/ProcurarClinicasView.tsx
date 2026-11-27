"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const termoUrl = searchParams.get("busca") || "";

  const [clinicas, setClinicas] = useState<Ong[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [ordenacao, setOrdenacao] = useState<"padrao" | "avaliacao" | "nome">(
    "padrao"
  );
  const [favoritas, setFavoritas] = useState<string[]>([]);

  useEffect(() => {
    let ativo = true;

    setCarregando(true);
    setErro(false);
    async function carregar() {
      try {
        const lista = await listarOngs({ tipo: "clinicas", ordem: "visitas" });
        if (ativo) setClinicas(lista);
      } catch (error) {
        console.error("[Clínicas] Falha ao carregar", error);
        if (ativo) setErro(true);
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    listarFavoritos().then((lista) => {
      if (ativo) setFavoritas(lista.filter((f) => f.tipo === "ong").map((f) => f.alvoId));
    }).catch(() => {
      if (ativo) setFavoritas(lerClinicasFavoritas());
    });
    return () => { ativo = false; };
  }, [tentativa]);

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
        const local = [localizacaoOng(clinica), clinica.endereco, clinica.regiao].filter(Boolean).join(" ").toLowerCase();
        if (!nome.includes(termo) && !local.includes(termo)) return false;
      }
      return true;
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
  }, [clinicas, termoUrl, ordenacao]);

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
            <SlidersHorizontal size={16} />
            <span>
              Filtro
            </span>
          </button>

          <button
            type="button"
            className={styles.btnLimparFiltro}
            disabled={!termoUrl}
            onClick={() => { const url = new URL(window.location.href); url.searchParams.delete("busca"); router.replace(url.pathname + url.search); }}
          >
            Limpar Filtro
          </button>
        </div>

        <div className={styles.ordenarWrap}>
          <select
            className={styles.ordenarSelect}
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)}
            aria-label="Ordenar estações e clínicas"
          >
            <option value="padrao">Mais visitadas</option>
            <option value="avaliacao">Melhor avaliação</option>
            <option value="nome">Ordem alfabética</option>
          </select>
          <ChevronDown size={16} className={styles.ordenarIcone} />
        </div>
      </div>

      {mostrarFiltros && (
        <div className={styles.caixaTags} role="group" aria-label="Filtros de clínicas">
          <p style={{ width: "100%", margin: 0, fontSize: 14, color: "#666" }}>
            Os filtros por serviços e proximidade ainda não estão disponíveis.
          </p>
          {FILTROS_CLINICAS.map((filtro) => (
            <button key={filtro} type="button" disabled className={styles.tagPill}
              style={{ opacity: 0.55, cursor: "not-allowed" }}>
              {filtro}
            </button>
          ))}
        </div>
      )}

      {carregando ? (
        <div
          className={styles.painelBorda}
          style={{ textAlign: "center", padding: "48px 24px" }}
        >
          <p style={{ margin: 0, color: "#555" }}>
            Carregando estações e clínicas...
          </p>
        </div>
      ) : erro ? (
        <div className={styles.painelBorda} role="alert" style={{ textAlign: "center", padding: "48px 24px" }}>
          <strong>Não foi possível carregar as clínicas</strong>
          <p>Tente novamente em instantes.</p>
          <button type="button" className={styles.btnFiltroBox} style={{ margin: "16px auto 0" }} onClick={() => setTentativa((v) => v + 1)}>Tentar novamente</button>
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
            {clinicas.length === 0 ? "Ainda não há clínicas cadastradas" : "Nenhuma clínica encontrada"}
          </strong>
          <p style={{ margin: 0, color: "#666", fontSize: 14, maxWidth: 420 }}>
            {clinicas.length === 0
              ? "Estamos credenciando as primeiras clínicas da sua região."
              : "Nenhuma clínica corresponde à sua busca. Tente outro nome ou localização."}
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
