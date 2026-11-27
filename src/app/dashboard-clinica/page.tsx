"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";
import { useClinica } from "./useClinica";
import { cupomValido } from "./dados";
import styles from "./PainelClinica.module.css";

export default function PainelClinica() {
  const { dados, pronto, atualizar } = useClinica();
  const [codigo, setCodigo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [agora, setAgora] = useState(() => Date.now());
  const ultimas24h = dados.resgates.filter(r => {
    const data = new Date(r.criadoEm).getTime();
    return Number.isFinite(data) && agora - data >= 0 && agora - data <= 86400000;
  });
  const cuponsRecentes = [...new Set(ultimas24h.map(r => r.cupomId))]
    .map(id => dados.cupons.find(c => c.id === id)).filter((c): c is typeof dados.cupons[number] => Boolean(c));

  function validar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const cupom = dados.cupons.find(c => c.codigo.toLowerCase() === codigo.trim().toLowerCase());
    if (!cupom) { setMensagem("Código não encontrado."); return; }
    if (!cupomValido(cupom, dados)) { setMensagem("Cupom pausado, vencido ou esgotado."); return; }
    const instante = Date.now();
    setAgora(instante);
    atualizar(d => ({
      ...d,
      resgates: [{ id: crypto.randomUUID(), cupomId: cupom.id, codigo: cupom.codigo, criadoEm: new Date(instante).toISOString() }, ...d.resgates],
    }));
    setCodigo("");
    setMensagem("Cupom validado! Resgate registrado com sucesso.");
  }

  return <div className={styles.painelHomeClinica}>
    <form className={styles.validacaoClinica} onSubmit={validar}>
      <div className={styles.codigoCampo}>
        <img src="/lupa.svg" alt="" />
        <input aria-label="Código do cupom" placeholder="Digitar código" value={codigo} onChange={e => {setCodigo(e.target.value);setMensagem("");}} />
      </div>
      <button type="submit" disabled={!codigo.trim()} className={styles.validarBotao}>Validar cupom</button>
    </form>
    {mensagem && <p className={styles.mensagemValidacao} role="status">{mensagem}</p>}
    <div className={styles.cardsClinica}>
      <div className={styles.cardClinica}><strong>{pronto ? dados.servicos.length : "—"} serviços</strong><span>cadastrados pela clínica</span></div>
      <div className={`${styles.cardClinica} ${styles.cardRosaClinica}`}><strong>{pronto ? dados.resgates.length : "—"} cupons</strong><span>utilizados em serviços</span></div>
      <div className={styles.cardClinica}><strong>{pronto ? dados.cupons.filter(c => cupomValido(c,dados)).length : "—"} cupons</strong><span>disponíveis para resgate</span></div>
    </div>
    <section className={styles.recentesClinica}>
      <h2>Utilizados em 24h</h2>
      {cuponsRecentes.length === 0 ? <p className={styles.semRegistros}>Nenhum cupom utilizado nas últimas 24 horas.</p> : (
        <div className={styles.listaRecentes}>
          {cuponsRecentes.map(c => <div className={styles.recenteItem} key={c.id}>
            <Ticket size={31} fill="#130568" color="#130568" aria-hidden="true"/>
            <div className={styles.recenteNome}><strong>{c.nome}</strong><small>{c.codigo}</small></div>
            <button type="button" className={`${styles.acaoRecente} ${c.status === "ativo" ? styles.acaoDesativar : ""}`}
              onClick={() => atualizar(d => ({ ...d, cupons: d.cupons.map(x => x.id === c.id ? {...x,status:x.status === "ativo" ? "pausado" : "ativo"} : x) }))}>
              {c.status === "ativo" ? "Desativar" : "Reativar"}
            </button>
          </div>)}
        </div>
      )}
    </section>
  </div>;
}
