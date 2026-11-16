"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Rocket,
  PawPrint,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  Dog,
  Cat,
} from "lucide-react";
import {
  lerUltimoPedido,
  formatarMoeda,
  type PedidoConfirmado,
} from "@/lib/clinicasCarrinho";
import styles from "./ClinicasCompra.module.css";

interface PedidoConfirmadoViewProps {
  basePath: "/dashboard-explorador" | "/dashboard";
}

function formatarDataPtBr(iso: string): string {
  const partes = iso.split("-");
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return iso;
}

export function PedidoConfirmadoView({ basePath }: PedidoConfirmadoViewProps) {
  const [pedido] = useState<PedidoConfirmado | null>(() => lerUltimoPedido());

  if (!pedido) {
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
          <PawPrint size={38} color="#0d0062" />
          <strong style={{ fontSize: 17, color: "#0d0062" }}>
            Nenhum pedido recente encontrado
          </strong>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
            Finalize um agendamento de serviço em uma clínica parceira para
            visualizar o comprovante aqui.
          </p>
          <Link
            href={`${basePath}/clinicas`}
            className={styles.btnContinuarComprando}
          >
            Explorar clínicas
          </Link>
        </div>
      </div>
    );
  }

  const itemPrincipal = pedido.itens[0] || null;
  const totalItens =
    pedido.itens.reduce((acc, i) => acc + i.quantidade, 0) || 1;

  return (
    <div className={styles.wrapper} data-node-id="1585:382">
      {/* STEPPER */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepBloco}>
          <div className={`${styles.stepCirculo} ${styles.stepConcluido}`}>
            <Check size={28} strokeWidth={2.5} />
          </div>
          <span className={styles.stepLabel}>Carrinho</span>
        </div>

        <div className={styles.stepLinhaWrap}>
          <div className={styles.stepLinha} />
        </div>

        <div className={styles.stepBloco}>
          <div className={`${styles.stepCirculo} ${styles.stepConcluido}`}>
            <Check size={28} strokeWidth={2.5} />
          </div>
          <span className={styles.stepLabel}>Pagamento</span>
        </div>

        <div className={styles.stepLinhaWrap}>
          <div className={styles.stepLinha} />
          <Rocket size={26} className={styles.iconeFoguete} />
        </div>

        <div className={styles.stepBloco}>
          <div className={`${styles.stepCirculo} ${styles.stepAtivo}`}>3</div>
          <span className={styles.stepLabel}>Confirmação</span>
        </div>
      </div>

      {/* HERO PEDIDO CONFIRMADO */}
      <div className={styles.heroConfirmacao}>
        <div className={styles.circuloCheckCelebracao}>
          <div className={styles.circuloCheckInterno}>
            <Check size={38} strokeWidth={2.5} />
          </div>
        </div>
        <h1>Pedido confirmado!</h1>
        <p>Seu agendamento foi confirmado com sucesso.</p>
      </div>

      {/* GRID PRINCIPAL */}
      <div className={styles.gridDuasColunas}>
        <div>
          <section className={styles.painelBorda}>
            <div className={styles.bannerNumeroPedido}>
              <span>Número do pedido</span>
              <strong>{pedido.numeroPedido}</strong>
            </div>

            <div className={styles.gridDetalhesConfirmado}>
              <div className={styles.itemDetalheConfirmado}>
                <div className={styles.quadradoIconeLilás}>
                  <PawPrint size={24} />
                </div>
                <div>
                  <strong>Clínica</strong>
                  <span>{pedido.clinicaNome}</span>
                </div>
              </div>

              <div className={styles.itemDetalheConfirmado}>
                <div className={styles.quadradoIconeLilás}>
                  <Dog size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong>Pet</strong>
                  <span>{pedido.petNome}</span>
                </div>
                <Cat size={26} color="#0d0062" />
              </div>

              <div className={styles.itemDetalheConfirmado}>
                <div className={styles.quadradoIconeLilás}>
                  <Calendar size={24} />
                </div>
                <div>
                  <strong>Data e Horário</strong>
                  <span>
                    {formatarDataPtBr(pedido.dataAtendimento)} às{" "}
                    {pedido.horarioAtendimento}
                  </span>
                </div>
              </div>

              <div className={styles.itemDetalheConfirmado}>
                <div className={styles.quadradoIconeLilás}>
                  <MapPin size={24} />
                </div>
                <div>
                  <strong>Local de atendimento</strong>
                  <span>{pedido.localAtendimento}</span>
                </div>
              </div>
            </div>

            <div
              className={styles.itemDetalheConfirmado}
              style={{ marginTop: 18 }}
            >
              <div className={styles.quadradoIconeLilás}>
                <CreditCard size={24} />
              </div>
              <div>
                <strong>Forma de pagamento</strong>
                <span>{pedido.formaPagamento}</span>
              </div>
            </div>
          </section>

          <div className={styles.rodapeAgradecimento}>
            <div className={styles.circuloPatinhaRosa}>
              <PawPrint size={34} />
            </div>
            <div>
              <p>
                Obrigado por confiar em{" "}
                <strong>{pedido.clinicaNome}!</strong>
              </p>
              <p style={{ opacity: 0.82 }}>
                Estamos cuidando do seu pet com todo carinho que ele merece.
              </p>
            </div>
          </div>
        </div>

        {/* RESUMO DO PEDIDO */}
        <aside className={styles.painelBorda}>
          <h2>Resumo do pedido</h2>

          {itemPrincipal && (
            <div className={styles.resumoItemTopo}>
              <div className={styles.thumbItemCarrinho}>
                {itemPrincipal.imagemUrl && (
                  <img
                    src={itemPrincipal.imagemUrl}
                    alt={itemPrincipal.titulo}
                  />
                )}
              </div>
              <div className={styles.resumoItemInfo}>
                <h4>{itemPrincipal.titulo}</h4>
                <p>{pedido.clinicaNome}</p>
                <div className={styles.resumoQtdPreco}>
                  <strong>{totalItens}x</strong>
                  <span>{formatarMoeda(pedido.subtotal)}</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.linhasResumo}>
            <div className={styles.linhaResumo}>
              <span>
                Subtotal (
                <small>
                  {totalItens} {totalItens === 1 ? "item" : "itens"}
                </small>
                )
              </span>
              <span>{formatarMoeda(pedido.subtotal)}</span>
            </div>

            <div className={styles.linhaResumo}>
              <span>Desconto</span>
              <span className={styles.valorDescontoRosa}>
                - {formatarMoeda(pedido.desconto)}
              </span>
            </div>

            <div className={styles.linhaResumo}>
              <span>Frete</span>
              <span>{formatarMoeda(pedido.frete)}</span>
            </div>
          </div>

          <div className={styles.caixaTotalCinza}>
            <span>Total</span>
            <strong>{formatarMoeda(pedido.total)}</strong>
          </div>

          <Link
            href={`${basePath}/agenda`}
            className={styles.btnPrimarioAzulGrande}
          >
            <Truck size={24} />
            <span>Acompanhar pedido</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
