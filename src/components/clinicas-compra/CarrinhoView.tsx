"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  Truck,
} from "lucide-react";
import {
  lerCarrinho,
  salvarCarrinho,
  formatarMoeda,
  type ItemCarrinho,
} from "@/lib/clinicasCarrinho";
import { alerta } from "@/lib/alerta";
import styles from "./ClinicasCompra.module.css";

interface CarrinhoViewProps {
  basePath: "/dashboard-explorador" | "/dashboard";
}

export function CarrinhoView({ basePath }: CarrinhoViewProps) {
  const router = useRouter();
  const [itens, setItens] = useState<ItemCarrinho[]>(() => lerCarrinho());

  function atualizarQuantidade(id: string, delta: number) {
    const proximo = itens.map((item) =>
      item.id === id
        ? { ...item, quantidade: Math.max(1, item.quantidade + delta) }
        : item
    );
    setItens(proximo);
    salvarCarrinho(proximo);
  }

  function removerItem(id: string) {
    const proximo = itens.filter((item) => item.id !== id);
    setItens(proximo);
    salvarCarrinho(proximo);
  }

  const totalQuantidade = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const subtotalBase = itens
    .filter((i) => i.tipo !== "adicional")
    .reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const servicosAdicionais = itens
    .filter((i) => i.tipo === "adicional")
    .reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const frete = 0;
  const total = subtotalBase + servicosAdicionais + frete;

  function irParaPagamento() {
    if (itens.length === 0) {
      alerta.aviso(
        "Carrinho vazio",
        "Adicione pelo menos um serviço antes de continuar para o pagamento."
      );
      return;
    }
    router.push(`${basePath}/pagamento`);
  }

  return (
    <div className={styles.wrapper} data-node-id="1577:24">
      <div className={styles.topoCarrinho}>
        <div className={styles.tituloCarrinhoEsquerda}>
          <div className={styles.iconeCarrinhoCirculo}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1>Seu carrinho</h1>
            <p>
              Confira os itens do seu carrinho antes de continuar para o
              pagamento.
            </p>
          </div>
        </div>

        <Link
          href={`${basePath}/clinicas`}
          className={styles.btnContinuarComprando}
        >
          <ArrowLeft size={20} />
          <span>Continuar Comprando</span>
        </Link>
      </div>

      <div className={styles.gridDuasColunas}>
        <section className={styles.painelBorda}>
          <h2>Produtos e serviços</h2>

          {itens.length === 0 ? (
            <div style={{ padding: "36px 0", textAlign: "center" }}>
              <p style={{ color: "#555", marginBottom: 16 }}>
                Seu carrinho está vazio no momento.
              </p>
              <Link
                href={`${basePath}/clinicas`}
                className={styles.btnContinuarComprando}
              >
                Explorar clínicas e serviços
              </Link>
            </div>
          ) : (
            <div className={styles.listaItensCarrinho}>
              {itens.map((item) => (
                <div key={item.id} className={styles.itemCarrinhoRow}>
                  <div className={styles.itemCarrinhoEsquerda}>
                    <div className={styles.thumbItemCarrinho}>
                      {item.imagemUrl && (
                        <img src={item.imagemUrl} alt={item.titulo} />
                      )}
                    </div>

                    <div className={styles.dadosItemCarrinho}>
                      <h3>{item.titulo}</h3>
                      <span>{item.clinicaNome}</span>
                      <strong className={styles.precoRosaItem}>
                        {formatarMoeda(item.preco)}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.acoesItemCarrinho}>
                    <div className={styles.controleQuantidade}>
                      <button
                        type="button"
                        className={styles.btnQtdCircular}
                        onClick={() => atualizarQuantidade(item.id, -1)}
                        aria-label={`Diminuir quantidade de ${item.titulo}`}
                      >
                        <Minus size={14} />
                      </button>

                      <span className={styles.numeroQtd}>
                        {item.quantidade}
                      </span>

                      <button
                        type="button"
                        className={styles.btnQtdCircular}
                        onClick={() => atualizarQuantidade(item.id, 1)}
                        aria-label={`Aumentar quantidade de ${item.titulo}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.btnLixeira}
                      onClick={() => removerItem(item.id)}
                      aria-label={`Remover ${item.titulo} do carrinho`}
                      title="Remover item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className={styles.painelBorda}>
          <h2>Resumo da compra</h2>

          <div className={styles.linhasResumo}>
            <div className={styles.linhaResumo}>
              <span>
                Subtotal (
                <small>
                  {totalQuantidade}{" "}
                  {totalQuantidade === 1 ? "item" : "itens"}
                </small>
                )
              </span>
              <span>{formatarMoeda(subtotalBase)}</span>
            </div>

            <div className={styles.linhaResumo}>
              <span>Serviços adicionais</span>
              <span>{formatarMoeda(servicosAdicionais)}</span>
            </div>

            <div className={styles.linhaResumo}>
              <span>Frete</span>
              <span>{formatarMoeda(frete)}</span>
            </div>
          </div>

          <div className={styles.caixaTotalCinza}>
            <span>Total</span>
            <strong>{formatarMoeda(total)}</strong>
          </div>

          <button
            type="button"
            className={styles.btnPrimarioAzulGrande}
            onClick={irParaPagamento}
          >
            <CreditCard size={24} />
            <span>Continuar para o pagamento</span>
          </button>

          <div className={styles.cardAvisoFrete}>
            <Truck size={28} />
            <div>
              <strong>Taxa de deslocamento para atendimento em casa</strong>
              <span>(calculada na etapa de pagamento conforme o local escolhido)</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
