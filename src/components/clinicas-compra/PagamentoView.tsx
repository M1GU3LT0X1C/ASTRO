"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Rocket,
  CreditCard,
  Building2,
  PawPrint,
  Calendar,
  Clock,
  Home,
  QrCode,
  Banknote,
  TicketPercent,
  ChevronRight,
  Lock,
  User,
} from "lucide-react";
import {
  lerCarrinho,
  lerCupomCarrinho,
  salvarCupomCarrinho,
  calcularDescontoCupom,
  salvarUltimoPedido,
  limparCarrinho,
  formatarMoeda,
  type ItemCarrinho,
} from "@/lib/clinicasCarrinho";
import { listarPetsTutor } from "@/lib/explorador";
import { criarCompromisso } from "@/lib/painel";
import { alerta } from "@/lib/alerta";
import styles from "./ClinicasCompra.module.css";

interface PagamentoViewProps {
  basePath: "/dashboard-explorador" | "/dashboard";
}

export function PagamentoView({ basePath }: PagamentoViewProps) {
  const router = useRouter();
  const [itens] = useState<ItemCarrinho[]>(() => lerCarrinho());
  const [clinicaNome, setClinicaNome] = useState(
    () => lerCarrinho()[0]?.clinicaNome || ""
  );
  const [petNome, setPetNome] = useState("");
  const [petsSugeridos, setPetsSugeridos] = useState<string[]>([]);
  const [dataAtendimento, setDataAtendimento] = useState("");
  const [horarioAtendimento, setHorarioAtendimento] = useState("");
  const [localAtendimento, setLocalAtendimento] = useState<
    "Na clínica" | "Em casa"
  >("Na clínica");
  const [formaPagamento, setFormaPagamento] = useState<
    "Pix" | "Cartão de Débito" | "Crédito" | "Dinheiro"
  >("Pix");

  // Dados do cartão (1585:344)
  const [numeroCartao, setNumeroCartao] = useState("");
  const [nomeCartao, setNomeCartao] = useState("");
  const [validadeCartao, setValidadeCartao] = useState("");
  const [cvvCartao, setCvvCartao] = useState("");
  const [parcelasCartao, setParcelasCartao] = useState("1x sem juros");

  // Cupom
  const [mostrarInputCupom, setMostrarInputCupom] = useState(false);
  const [codigoCupom, setCodigoCupom] = useState(
    () => lerCupomCarrinho()?.codigo || ""
  );
  const [cupomAtivo, setCupomAtivo] = useState<{
    codigo: string;
    descontoValor?: number;
    percentual?: number;
  } | null>(() => lerCupomCarrinho());
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    listarPetsTutor()
      .then((lista) => {
        if (lista.length > 0) {
          setPetsSugeridos(lista.map((p) => p.nome));
          setPetNome(lista[0].nome || "");
        }
      })
      .catch(() => null);
  }, []);

  const itemPrincipal = itens[0] || null;
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const subtotal = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const servicosAdicionais = itens
    .filter((i) => i.tipo === "adicional")
    .reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const desconto = calcularDescontoCupom(subtotal, cupomAtivo);
  const frete = 0;
  const total = Math.max(0, subtotal - desconto + frete);

  function aplicarCupomManual() {
    const limpo = codigoCupom.trim().toUpperCase();
    if (!limpo) {
      setCupomAtivo(null);
      salvarCupomCarrinho(null);
      setMostrarInputCupom(false);
      return;
    }
    const matchPercentual = limpo.match(/(\d{1,2})/);
    const percentualExtraido = matchPercentual ? Number(matchPercentual[1]) : 10;
    const novoCupom = { codigo: limpo, percentual: percentualExtraido };
    setCupomAtivo(novoCupom);
    salvarCupomCarrinho(novoCupom);
    setMostrarInputCupom(false);
    alerta.sucesso(
      "Cupom aplicado!",
      `O cupom ${limpo} foi vinculado ao seu pedido.`
    );
  }

  function formatarNumeroCartao(v: string) {
    const digitos = v.replace(/\D/g, "").slice(0, 16);
    return digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatarValidade(v: string) {
    const digitos = v.replace(/\D/g, "").slice(0, 4);
    if (digitos.length <= 2) return digitos;
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  }

  const exigeCartao =
    formaPagamento === "Crédito" || formaPagamento === "Cartão de Débito";

  async function handleFinalizarPagamento() {
    if (itens.length === 0) {
      alerta.aviso(
        "Carrinho vazio",
        "Adicione um serviço ao carrinho antes de finalizar o pedido."
      );
      return;
    }

    if (
      !clinicaNome.trim() ||
      !petNome.trim() ||
      !dataAtendimento ||
      !horarioAtendimento
    ) {
      alerta.aviso(
        "Preencha os dados do atendimento",
        "Informe a clínica, o nome do pet, a data e o horário do atendimento."
      );
      return;
    }

    if (exigeCartao) {
      const numLimpo = numeroCartao.replace(/\D/g, "");
      if (
        numLimpo.length < 13 ||
        !nomeCartao.trim() ||
        validadeCartao.length < 5 ||
        cvvCartao.length < 3
      ) {
        alerta.aviso(
          "Dados do cartão incompletos",
          "Preencha o número do cartão, nome impresso, validade (MM/AA) e CVV."
        );
        return;
      }
    }

    setFinalizando(true);
    try {
      const numeroGerado = `#${Date.now().toString().slice(-6)}`;
      salvarUltimoPedido({
        numeroPedido: numeroGerado,
        clinicaId: itemPrincipal?.clinicaId || "",
        clinicaNome: clinicaNome.trim(),
        petNome: petNome.trim(),
        dataAtendimento,
        horarioAtendimento,
        localAtendimento,
        formaPagamento,
        itens,
        subtotal,
        servicosAdicionais,
        desconto,
        frete,
        total,
      });

      await criarCompromisso({
        pet: petNome.trim(),
        descricao: `${itemPrincipal?.titulo || "Atendimento veterinário"} (${numeroGerado})`,
        local: `${clinicaNome.trim()} — ${localAtendimento}`,
        data: dataAtendimento,
        hora: horarioAtendimento,
      }).catch(() => null);

      limparCarrinho();
      router.push(`${basePath}/pedido-confirmado`);
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <div className={styles.wrapper} data-node-id="1581:24">
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
          <Rocket size={26} className={styles.iconeFoguete} />
        </div>

        <div className={styles.stepBloco}>
          <div className={`${styles.stepCirculo} ${styles.stepAtivo}`}>2</div>
          <span className={styles.stepLabel}>Pagamento</span>
        </div>

        <div className={styles.stepLinhaWrap}>
          <div className={styles.stepLinha} />
        </div>

        <div className={styles.stepBloco}>
          <div className={`${styles.stepCirculo} ${styles.stepPendente}`}>3</div>
          <span className={styles.stepLabel}>Confirmação</span>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className={styles.gridDuasColunas}>
        <section className={styles.painelBorda}>
          <div className={styles.cabecalhoCardPagamento}>
            <div className={styles.iconeCarrinhoCirculo}>
              <CreditCard size={24} />
            </div>
            <div>
              <h1>Pagamento</h1>
              <p>Escolha a forma de pagamento e finalize seu pedido.</p>
            </div>
          </div>

          {/* 1. DADOS DO ATENDIMENTO */}
          <div className={styles.secaoNumeradaTitulo}>
            <span className={styles.numeroBolinhaAzul}>1</span>
            <h3>Dados do Atendimento</h3>
          </div>

          <div className={styles.gridCamposAtendimento}>
            <div className={styles.campoAtendimento}>
              <label htmlFor="pag-clinica">Clinica</label>
              <div className={styles.inputIconeBox}>
                <Building2 size={20} />
                <input
                  id="pag-clinica"
                  type="text"
                  placeholder="Informe a clínica"
                  value={clinicaNome}
                  onChange={(e) => setClinicaNome(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.campoAtendimento}>
              <label htmlFor="pag-pet">Pet</label>
              <div className={styles.inputIconeBox}>
                <PawPrint size={20} />
                <input
                  id="pag-pet"
                  type="text"
                  list="lista-pets-sugeridos"
                  value={petNome}
                  onChange={(e) => setPetNome(e.target.value)}
                  placeholder="Nome do seu pet"
                />
                {petsSugeridos.length > 0 && (
                  <datalist id="lista-pets-sugeridos">
                    {petsSugeridos.map((nome) => (
                      <option key={nome} value={nome} />
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            <div className={styles.campoAtendimento}>
              <label htmlFor="pag-data">Data</label>
              <div className={styles.inputIconeBox}>
                <Calendar size={20} />
                <input
                  id="pag-data"
                  type="date"
                  value={dataAtendimento}
                  onChange={(e) => setDataAtendimento(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.campoAtendimento}>
              <label htmlFor="pag-hora">Horário</label>
              <div className={styles.inputIconeBox}>
                <Clock size={20} />
                <input
                  id="pag-hora"
                  type="time"
                  value={horarioAtendimento}
                  onChange={(e) => setHorarioAtendimento(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 2. ONDE SERÁ REALIZADO O ATENDIMENTO? */}
          <div className={styles.secaoNumeradaTitulo}>
            <span className={styles.numeroBolinhaAzul}>2</span>
            <h3>Onde será realizado o atendimento?</h3>
          </div>

          <div className={styles.gridOpcoesSelecao}>
            <button
              type="button"
              onClick={() => setLocalAtendimento("Na clínica")}
              className={`${styles.cardOpcaoSelecao} ${
                localAtendimento === "Na clínica" ? styles.cardOpcaoAtiva : ""
              }`}
            >
              <div className={styles.opcaoEsquerda}>
                <Building2 size={38} />
                <div>
                  <strong>Na Clínica</strong>
                  <span>Atendimento no local da clínica</span>
                </div>
              </div>
              <span className={styles.checkCirculo}>
                <Check size={16} strokeWidth={2.5} />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLocalAtendimento("Em casa")}
              className={`${styles.cardOpcaoSelecao} ${
                localAtendimento === "Em casa" ? styles.cardOpcaoAtiva : ""
              }`}
            >
              <div className={styles.opcaoEsquerda}>
                <Home size={38} />
                <div>
                  <strong>Em Casa</strong>
                  <span>Atendimento no seu endereço</span>
                </div>
              </div>
              <span className={styles.checkCirculo}>
                <Check size={16} strokeWidth={2.5} />
              </span>
            </button>
          </div>

          {/* 3. FORMA DE PAGAMENTO */}
          <div className={styles.secaoNumeradaTitulo}>
            <span className={styles.numeroBolinhaAzul}>3</span>
            <h3>Forma de pagamento</h3>
          </div>

          <div className={styles.gridOpcoesSelecao}>
            <button
              type="button"
              onClick={() => setFormaPagamento("Pix")}
              className={`${styles.cardOpcaoSelecao} ${
                formaPagamento === "Pix" ? styles.cardOpcaoAtiva : ""
              }`}
            >
              <div className={styles.opcaoEsquerda}>
                <QrCode size={32} />
                <div>
                  <strong>Pix</strong>
                  <span>Pagamento rápido</span>
                </div>
              </div>
              <span className={styles.checkCirculo}>
                <Check size={16} strokeWidth={2.5} />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormaPagamento("Cartão de Débito")}
              className={`${styles.cardOpcaoSelecao} ${
                formaPagamento === "Cartão de Débito"
                  ? styles.cardOpcaoAtiva
                  : ""
              }`}
            >
              <div className={styles.opcaoEsquerda}>
                <CreditCard size={32} />
                <div>
                  <strong>Cartão de Débito</strong>
                  <span>Débito à vista</span>
                </div>
              </div>
              <span className={styles.checkCirculo}>
                <Check size={16} strokeWidth={2.5} />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormaPagamento("Crédito")}
              className={`${styles.cardOpcaoSelecao} ${
                formaPagamento === "Crédito" ? styles.cardOpcaoAtiva : ""
              }`}
            >
              <div className={styles.opcaoEsquerda}>
                <CreditCard size={32} />
                <div>
                  <strong>Crédito</strong>
                  <span>Parcelamento disponível</span>
                </div>
              </div>
              <span className={styles.checkCirculo}>
                <Check size={16} strokeWidth={2.5} />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormaPagamento("Dinheiro")}
              className={`${styles.cardOpcaoSelecao} ${
                formaPagamento === "Dinheiro" ? styles.cardOpcaoAtiva : ""
              }`}
            >
              <div className={styles.opcaoEsquerda}>
                <Banknote size={32} />
                <div>
                  <strong>Dinheiro</strong>
                  <span>Apenas na retirada</span>
                </div>
              </div>
              <span className={styles.checkCirculo}>
                <Check size={16} strokeWidth={2.5} />
              </span>
            </button>
          </div>

          {/* SEÇÃO DADOS DO CARTÃO (1585:344) */}
          {exigeCartao && (
            <div className={styles.cardDadosCartao} data-node-id="1585:344">
              <div className={styles.topoDadosCartao}>
                <CreditCard size={22} />
                <span>Dados do cartão</span>
              </div>

              <div className={styles.gridCamposAtendimento}>
                <div className={styles.campoAtendimento}>
                  <label htmlFor="cartao-num">Número do cartão</label>
                  <div className={styles.inputIconeBox}>
                    <CreditCard size={18} />
                    <input
                      id="cartao-num"
                      type="text"
                      inputMode="numeric"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={numeroCartao}
                      onChange={(e) =>
                        setNumeroCartao(formatarNumeroCartao(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className={styles.campoAtendimento}>
                  <label htmlFor="cartao-nome">Nome no cartão</label>
                  <div className={styles.inputIconeBox}>
                    <User size={18} />
                    <input
                      id="cartao-nome"
                      type="text"
                      placeholder="Nome impresso no cartão"
                      value={nomeCartao}
                      onChange={(e) => setNomeCartao(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.gridCartaoInferior}>
                <div className={styles.campoAtendimento}>
                  <label htmlFor="cartao-val">Validade</label>
                  <div className={styles.inputIconeBox}>
                    <Calendar size={18} />
                    <input
                      id="cartao-val"
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/AA"
                      value={validadeCartao}
                      onChange={(e) =>
                        setValidadeCartao(formatarValidade(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className={styles.campoAtendimento}>
                  <label htmlFor="cartao-cvv">CVV</label>
                  <div className={styles.inputIconeBox}>
                    <Lock size={18} />
                    <input
                      id="cartao-cvv"
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="3 dígitos"
                      value={cvvCartao}
                      onChange={(e) =>
                        setCvvCartao(e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>
                </div>

                <div className={styles.campoAtendimento}>
                  <label htmlFor="cartao-parcelas">Parcelas</label>
                  <div className={styles.inputIconeBox}>
                    <select
                      id="cartao-parcelas"
                      value={parcelasCartao}
                      onChange={(e) => setParcelasCartao(e.target.value)}
                    >
                      <option value="1x sem juros">1x sem juros</option>
                      <option value="2x sem juros">2x sem juros</option>
                      <option value="3x sem juros">3x sem juros</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RESUMO DO PEDIDO */}
        <aside className={styles.painelBorda}>
          <h2>Resumo do pedido</h2>

          {itemPrincipal ? (
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
                <p>{clinicaNome || itemPrincipal.clinicaNome}</p>
                <div className={styles.resumoQtdPreco}>
                  <strong>{totalItens}x</strong>
                  <span>{formatarMoeda(subtotal)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>
              Nenhum item selecionado no carrinho.
            </p>
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
              <span>{formatarMoeda(subtotal)}</span>
            </div>

            <div className={styles.linhaResumo}>
              <span>Desconto</span>
              <span className={styles.valorDescontoRosa}>
                - {formatarMoeda(desconto)}
              </span>
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

          <div className={styles.boxCupomDesconto}>
            <button
              type="button"
              className={styles.linhaCupomToggle}
              onClick={() => setMostrarInputCupom((v) => !v)}
            >
              <div className={styles.linhaCupomEsquerda}>
                <TicketPercent size={24} />
                <div>
                  <strong>Cupom de desconto</strong>
                  <span>
                    {cupomAtivo
                      ? `Cupom ativo: ${cupomAtivo.codigo}`
                      : "Tem um cupom? Adicione aqui"}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} color="#0d0062" />
            </button>

            {mostrarInputCupom && (
              <div className={styles.inputCupomInline}>
                <input
                  type="text"
                  placeholder="Digite o código do cupom"
                  value={codigoCupom}
                  onChange={(e) => setCodigoCupom(e.target.value)}
                />
                <button type="button" onClick={aplicarCupomManual}>
                  Aplicar
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.btnPrimarioAzulGrande}
            onClick={handleFinalizarPagamento}
            disabled={finalizando}
          >
            <CreditCard size={24} />
            <span>
              {finalizando ? "Processando..." : "Finalizar pagamento"}
            </span>
          </button>
        </aside>
      </div>
    </div>
  );
}
