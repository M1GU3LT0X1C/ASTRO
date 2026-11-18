"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  buscarServicoClinica,
  adicionarOuIncrementarCarrinho,
  lerCarrinho,
  formatarMoeda,
  type ServicoClinica,
  type AdicionalServico,
} from "@/lib/clinicasCarrinho";
import { buscarOng, type Ong } from "@/lib/ong";
import { alerta } from "@/lib/alerta";
import styles from "./ClinicasCompra.module.css";

interface ServicoCompraViewProps {
  clinicaId: string;
  servicoId: string;
  basePath: "/dashboard-explorador" | "/dashboard";
}

export function ServicoCompraView({
  clinicaId,
  servicoId,
  basePath,
}: ServicoCompraViewProps) {
  const router = useRouter();
  const [clinica, setClinica] = useState<Ong | null>(null);
  const [servico, setServico] = useState<ServicoClinica | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [qtdCarrinho, setQtdCarrinho] = useState(() =>
    lerCarrinho().reduce((acc, item) => acc + item.quantidade, 0)
  );
  const [adicionadosIds, setAdicionadosIds] = useState<string[]>(() =>
    lerCarrinho().map((i) => i.id)
  );

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const [dadosOng, dadosServico] = await Promise.all([
        buscarOng(clinicaId).catch(() => null),
        buscarServicoClinica(clinicaId, servicoId).catch(() => null),
      ]);
      if (!ativo) return;
      setClinica(dadosOng);
      setServico(dadosServico);
      setCarregando(false);
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [clinicaId, servicoId]);

  useEffect(() => {
    function sincronizar() {
      const itens = lerCarrinho();
      const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);
      setQtdCarrinho(totalItens);
      setAdicionadosIds(itens.map((i) => i.id));
    }
    window.addEventListener("astro-carrinho-atualizado", sincronizar);
    return () =>
      window.removeEventListener("astro-carrinho-atualizado", sincronizar);
  }, []);

  if (carregando) {
    return (
      <div className={styles.wrapper}>
        <div
          className={styles.painelBorda}
          style={{ textAlign: "center", padding: "48px 24px" }}
        >
          <p style={{ margin: 0, color: "#555" }}>Carregando serviço...</p>
        </div>
      </div>
    );
  }

  if (!servico) {
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
          <strong style={{ fontSize: 17, color: "#0d0062" }}>
            Serviço não encontrado
          </strong>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
            Este serviço não está mais disponível ou ainda não foi cadastrado.
          </p>
          <Link
            href={`${basePath}/clinicas/${clinicaId}`}
            className={styles.btnContinuarComprando}
          >
            Voltar ao perfil da clínica
          </Link>
        </div>
      </div>
    );
  }

  const nomeDaClinica = clinica?.nomeOrganizacao || servico.clinicaNome;

  function handleContratarServicoBase() {
    if (!servico) return;
    adicionarOuIncrementarCarrinho({
      id: servico.id,
      clinicaId,
      clinicaNome: nomeDaClinica,
      titulo: servico.titulo,
      preco: servico.precoBase,
      tipo: "servico",
      imagemUrl: servico.bannerUrl || clinica?.capaUrl || null,
    });
    router.push(`${basePath}/carrinho`);
  }

  function handleAdicionarExtra(adicional: AdicionalServico) {
    if (!servico) return;
    adicionarOuIncrementarCarrinho({
      id: adicional.id,
      clinicaId,
      clinicaNome: nomeDaClinica,
      titulo: adicional.titulo,
      preco: adicional.preco,
      tipo: "adicional",
      imagemUrl: servico.bannerUrl || clinica?.capaUrl || null,
    });
    alerta.sucesso(
      "Adicionado ao carrinho!",
      `${adicional.titulo} (+ ${formatarMoeda(adicional.preco)}) foi incluído no seu carrinho.`
    );
  }

  return (
    <div className={styles.wrapper} data-node-id="1487:96">
      <div className={styles.containerCompraServico}>
        <div className={styles.bannerServicoCompra}>
          {(servico.bannerUrl || clinica?.capaUrl) && (
            <img
              src={(servico.bannerUrl || clinica?.capaUrl)!}
              alt={servico.titulo}
            />
          )}

          <div className={styles.pilulaVerCarrinhoWrap}>
            <Link
              href={`${basePath}/carrinho`}
              className={styles.btnVerCarrinhoRosa}
            >
              <span>Ver carrinho</span>
              <span className={styles.badgeQtdCarrinho}>{qtdCarrinho}</span>
            </Link>
          </div>
        </div>

        <div className={styles.cardCorpoCompra}>
          <div className={styles.cabecalhoServicoPrincipal}>
            <div className={styles.infoServicoTexto}>
              <h3>{servico.titulo}</h3>
              <p>{servico.descricao}</p>
            </div>

            <button
              type="button"
              className={styles.btnPrecoServico}
              onClick={handleContratarServicoBase}
            >
              {servico.tipoPrecificacao === "fixo"
                ? formatarMoeda(servico.precoBase)
                : `A partir de ${formatarMoeda(servico.precoBase)}`}
            </button>
          </div>

          {servico.adicionais && servico.adicionais.length > 0 && (
            <>
              <h4 className={styles.tituloAdicioneServicos}>
                Adicione os serviços
              </h4>

              <div className={styles.listaAdicionais}>
                {servico.adicionais.map((adicional) => {
                  const jaNoCarrinho = adicionadosIds.includes(adicional.id);
                  return (
                    <div key={adicional.id} className={styles.cardAdicional}>
                      <div className={styles.cardAdicionalTexto}>
                        <h4>{adicional.titulo}</h4>
                        <p>{adicional.descricao}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdicionarExtra(adicional)}
                        className={`${styles.btnAdicionarExtra} ${
                          jaNoCarrinho ? styles.btnAdicionarExtraAtivo : ""
                        }`}
                      >
                        + {formatarMoeda(adicional.preco)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
