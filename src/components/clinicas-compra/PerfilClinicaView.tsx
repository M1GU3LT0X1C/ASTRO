"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Search,
  BadgeCheck,
  MapPin,
  Star,
  MessageCircle,
  Phone,
  Stethoscope,
} from "lucide-react";
import {
  listarServicosClinica,
  listarCuponsClinica,
  alternarClinicaFavorita,
  lerClinicasFavoritas,
  salvarCupomCarrinho,
  formatarMoeda,
  type ServicoClinica,
  type CupomClinica,
} from "@/lib/clinicasCarrinho";
import { buscarOng, localizacaoOng, type Ong } from "@/lib/ong";
import {
  adicionarFavorito,
  listarFavoritos,
  removerFavorito,
} from "@/lib/painel";
import { alerta } from "@/lib/alerta";
import styles from "./ClinicasCompra.module.css";

interface PerfilClinicaViewProps {
  clinicaId: string;
  basePath: "/dashboard-explorador" | "/dashboard";
}

export function PerfilClinicaView({
  clinicaId,
  basePath,
}: PerfilClinicaViewProps) {
  const [clinica, setClinica] = useState<Ong | null>(null);
  const [servicos, setServicos] = useState<ServicoClinica[]>([]);
  const [cupons, setCupons] = useState<CupomClinica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [favorita, setFavorita] = useState(false);
  const [mostrarBuscaServico, setMostrarBuscaServico] = useState(false);
  const [termoServico, setTermoServico] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const [dadosOng, listaServicos, listaCupons, listaFavs] =
        await Promise.all([
          buscarOng(clinicaId).catch(() => null),
          listarServicosClinica(clinicaId).catch(() => []),
          listarCuponsClinica(clinicaId).catch(() => []),
          listarFavoritos().catch(() => null),
        ]);
      if (!ativo) return;
      setClinica(dadosOng);
      setServicos(listaServicos);
      setCupons(listaCupons);
      if (listaFavs) {
        setFavorita(
          listaFavs.some((f) => f.tipo === "ong" && f.alvoId === clinicaId)
        );
      } else {
        setFavorita(lerClinicasFavoritas().includes(clinicaId));
      }
      setCarregando(false);
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [clinicaId]);

  async function handleAlternarFavorito() {
    const proximo = alternarClinicaFavorita(clinicaId);
    const novoEstado = proximo.includes(clinicaId);
    setFavorita(novoEstado);
    try {
      if (novoEstado) await adicionarFavorito("ong", clinicaId);
      else await removerFavorito("ong", clinicaId);
    } catch {
      // mantém estado local
    }
  }

  function handleAplicarCupom(cupom: CupomClinica) {
    salvarCupomCarrinho({
      codigo: cupom.codigo,
      percentual: cupom.percentual,
      descontoValor: cupom.descontoValor,
    });
    alerta.sucesso(
      `Cupom ${cupom.codigo} ativado!`,
      `${cupom.titulo} foi salvo e será aplicado automaticamente no seu carrinho.`
    );
  }

  if (carregando) {
    return (
      <div className={styles.wrapper}>
        <div
          className={styles.painelBorda}
          style={{ textAlign: "center", padding: "48px 24px" }}
        >
          <p style={{ margin: 0, color: "#555" }}>
            Carregando perfil da clínica...
          </p>
        </div>
      </div>
    );
  }

  if (!clinica) {
    return (
      <div className={styles.wrapper}>
        <div
          className={styles.painelBorda}
          style={{
            textAlign: "center",
            padding: "48px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Stethoscope size={38} color="#0d0062" />
          <strong style={{ fontSize: 17, color: "#0d0062" }}>
            Clínica não encontrada
          </strong>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
            Esta clínica ainda não está disponível ou o link informado é
            inválido.
          </p>
          <Link
            href={`${basePath}/clinicas`}
            className={styles.btnContinuarComprando}
          >
            Voltar para a busca de clínicas
          </Link>
        </div>
      </div>
    );
  }

  const servicosVisiveis = servicos.filter((s) => {
    const q = termoServico.trim().toLowerCase();
    if (!q) return true;
    return (
      s.titulo.toLowerCase().includes(q) ||
      s.descricao.toLowerCase().includes(q)
    );
  });

  const instagramHandle = clinica.instagram?.replace(/^@/, "");
  const whatsappLimpo = clinica.whatsapp?.replace(/\D/g, "");

  return (
    <div className={styles.wrapper} data-node-id="2255:158">
      <div className={styles.bannerTopoClinica}>
        {clinica.capaUrl && (
          <img
            src={clinica.capaUrl}
            alt={`Capa de ${clinica.nomeOrganizacao}`}
            className={styles.bannerImg}
          />
        )}

        <div className={styles.acoesBannerTopo}>
          <button
            type="button"
            className={styles.btnBannerCircular}
            onClick={handleAlternarFavorito}
            aria-label={
              favorita ? "Remover dos favoritos" : "Favoritar clínica"
            }
            title={favorita ? "Remover dos favoritos" : "Favoritar clínica"}
          >
            <Heart
              size={22}
              fill={favorita ? "#de4067" : "none"}
              stroke="#de4067"
            />
          </button>

          <button
            type="button"
            className={styles.btnBannerCircular}
            onClick={() => setMostrarBuscaServico((v) => !v)}
            aria-label="Pesquisar serviço nesta clínica"
            title="Pesquisar serviço"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      <div className={styles.cabecalhoClinicaGrid}>
        <div className={styles.colunaEsquerdaClinica}>
          <div
            className={styles.avatarClinicaGrande}
            style={{
              borderColor: "#0d0062",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {clinica.logoUrl ? (
              <img src={clinica.logoUrl} alt={clinica.nomeOrganizacao} />
            ) : (
              <Stethoscope size={44} color="#0d0062" />
            )}
          </div>

          <div className={styles.tituloClinicaLinha}>
            <h1>{clinica.nomeOrganizacao}</h1>
            {clinica.verificada && (
              <BadgeCheck
                size={20}
                className={styles.seloVerificado}
                fill="#0d0062"
                stroke="#ffffff"
              />
            )}
          </div>

          <p className={styles.parceiroDesde}>Estação de Cuidado Parceira</p>

          <div className={styles.localPerfilClinica}>
            <MapPin size={15} />
            <span>{clinica.endereco || localizacaoOng(clinica)}</span>
          </div>

          <div className={styles.avaliacaoPerfilLinha}>
            <Star size={17} fill="#de4067" stroke="#de4067" />
            <span className={styles.notaDestaque}>
              {(clinica.mediaAvaliacao || 0).toFixed(1).replace(".", ",")}
            </span>
            <span className={styles.totalAvaliacoes}>
              ({clinica.totalAvaliacoes || 0}{" "}
              {clinica.totalAvaliacoes === 1 ? "avaliação" : "avaliações"})
            </span>
          </div>

          <div className={styles.redesClinicaLinha}>
            <Link
              href={
                clinica.usuarioId
                  ? `${basePath}/mensagens?destinatario=${clinica.usuarioId}`
                  : `${basePath}/mensagens`
              }
              className={styles.btnRedeRosa}
              aria-label="Conversar pelo chat"
              title="Iniciar conversa no chat"
            >
              <MessageCircle size={22} />
            </Link>

            {whatsappLimpo && (
              <a
                href={`https://wa.me/55${whatsappLimpo}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnRedeRosa}
                aria-label="WhatsApp da clínica"
                title="WhatsApp"
              >
                <Phone size={20} />
              </a>
            )}

            {instagramHandle && (
              <a
                href={
                  instagramHandle.startsWith("http")
                    ? instagramHandle
                    : `https://instagram.com/${encodeURIComponent(instagramHandle)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnRedeRosa}
                aria-label="Instagram da clínica"
                title="Instagram"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div className={styles.cardApresentacaoClinica}>
          <p style={{ margin: 0 }}>
            {clinica.descricao ||
              "Esta clínica ainda não cadastrou uma descrição de apresentação."}
          </p>
        </div>
      </div>

      {cupons.length > 0 && (
        <div className={styles.cuponsClinicaLinha}>
          {cupons.map((cupom) => (
            <button
              key={cupom.codigo}
              type="button"
              className={styles.cardCupomAzul}
              onClick={() => handleAplicarCupom(cupom)}
              title="Clique para ativar este cupom no seu carrinho"
            >
              <strong>{cupom.titulo}</strong>
              <span>{cupom.subtitulo}</span>
            </button>
          ))}
        </div>
      )}

      <section className={styles.secaoServicos}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h2>Nossos Serviços</h2>

          {mostrarBuscaServico && (
            <input
              type="search"
              placeholder="Filtrar serviço..."
              value={termoServico}
              onChange={(e) => setTermoServico(e.target.value)}
              style={{
                height: 38,
                padding: "0 14px",
                borderRadius: 999,
                border: "1.5px solid #0d0062",
                fontSize: 13,
              }}
            />
          )}
        </div>

        {servicosVisiveis.length === 0 ? (
          <div className={styles.cardServicoItem}>
            <div className={styles.infoServicoTexto}>
              <p>Nenhum serviço cadastrado por esta clínica no momento.</p>
            </div>
          </div>
        ) : (
          servicosVisiveis.map((servico) => (
            <article key={servico.id} className={styles.cardServicoItem}>
              <div className={styles.infoServicoTexto}>
                <h3>{servico.titulo}</h3>
                <p>{servico.descricao}</p>
              </div>

              <Link
                href={`${basePath}/clinicas/${clinica.id}/servico/${servico.id}`}
                className={styles.btnPrecoServico}
              >
                {servico.tipoPrecificacao === "fixo"
                  ? formatarMoeda(servico.precoBase)
                  : `A partir de ${formatarMoeda(servico.precoBase)}`}
              </Link>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
