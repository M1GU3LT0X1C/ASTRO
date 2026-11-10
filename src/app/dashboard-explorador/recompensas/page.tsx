"use client";
import { useEffect, useState } from "react";
import { Gift, Ticket } from "lucide-react";
import { alerta } from "@/lib/alerta";
import { buscarRecompensas, fazerCheckin, resgatarCupom, type Cupom, type EstadoRecompensas } from "@/lib/painel";
import styles from "../painel-interno.module.css";

export default function Recompensas() {
  const [estado, setEstado] = useState<EstadoRecompensas | null>(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    buscarRecompensas().then(setEstado).catch(() => alerta.erro("Não foi possível carregar seus pontos"));
  }, []);

  async function checkin() {
    if (!estado || estado.checkinHoje) return;
    setProcessando(true);
    try {
      setEstado(await fazerCheckin());
      alerta.sucesso("+10 pontos! 🎉", "Check-in de hoje feito!");
    } catch {
      alerta.erro("Não foi possível fazer o check-in");
    } finally {
      setProcessando(false);
    }
  }

  async function usar(cupom: Cupom) {
    const confirmou = await alerta.confirmar({ title: "Usar cupom?", text: `${cupom.titulo} ${cupom.descricao || ""} por ${cupom.custo} pontos.`, confirmText: "Usar agora" });
    if (!confirmou) return;
    try {
      const resgate = await resgatarCupom(cupom.id);
      setEstado(await buscarRecompensas());
      alerta.sucesso("Cupom liberado! 🎉", `Código: ${resgate.codigo}`);
    } catch (erro) {
      alerta.erro("Não foi possível usar o cupom", erro instanceof Error ? erro.message : undefined);
    }
  }

  const pontos = estado?.pontos ?? 0;

  return (
    <div className={styles.pagina}>
      <div><h1 className={styles.titulo}>Recompensas & Pontos</h1><p className={styles.subtitulo}>Acompanhe seus pontos de participação.</p></div>
      <section className={styles.cartao}>
        <Gift size={32} />
        <h2>{estado ? `${pontos} pontos` : "Carregando..."}</h2>
        <p className={styles.textoMenor}>Faça seu check-in diário para receber 10 pontos.</p>
        <button className={styles.botao} onClick={checkin} disabled={!estado || estado.checkinHoje || processando}>
          {estado?.checkinHoje ? "Check-in realizado hoje" : "Fazer check-in"}
        </button>
      </section>
      {estado && estado.cupons.length > 0 ? (
        <div className={styles.grid}>
          {estado.cupons.map((cupom) => (
            <article key={cupom.id} className={styles.cartaoBranco}>
              <Ticket size={28} />
              <h2 className={styles.itemNome}>{cupom.titulo}</h2>
              <p className={styles.textoMenor}>{cupom.descricao} · custa {cupom.custo} pts</p>
              <button className={styles.botao} onClick={() => usar(cupom)} disabled={pontos < cupom.custo}>
                {pontos < cupom.custo ? `Faltam ${cupom.custo - pontos} pts` : "Usar cupom"}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.vazio}><strong>Nenhum cupom disponível</strong><p>Você ainda não possui cupons disponíveis.</p></div>
      )}
      {estado && estado.resgates.length > 0 && (
        <section className={styles.cartaoBranco}>
          <h2>Meus cupons resgatados</h2>
          {estado.resgates.map((r) => (
            <p key={r.codigo + r.data} className={styles.textoMenor}><strong>{r.titulo}</strong> · código {r.codigo} · {new Date(r.data).toLocaleDateString("pt-BR")}</p>
          ))}
        </section>
      )}
    </div>
  );
}
