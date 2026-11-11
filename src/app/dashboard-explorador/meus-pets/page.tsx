"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { PawPrint, Plus, Trash2, CalendarDays, Pencil } from "lucide-react";
import { alerta } from "@/lib/alerta";
import { acordarServidor } from "@/lib/api";
import { garantirTutor } from "@/lib/perfil";
import { CONVIVENCIAS } from "@/lib/animais";
import {
  adicionarRegistroSaude, excluirPetTutor, listarPetsTutor, removerRegistroSaude, type PetExplorador,
} from "@/lib/explorador";
import styles from "../painel-interno.module.css";

const ESPECIE: Record<string, string> = { cachorro: "Cachorro", gato: "Gato", outro: "Outro" };
const PORTE: Record<string, string> = { pequeno: "Pequeno", medio: "Médio", grande: "Grande" };
const SEXO: Record<string, string> = { macho: "Macho", femea: "Fêmea" };

export default function MeusPets() {
  const [pets, setPets] = useState<PetExplorador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atual, setAtual] = useState("");
  const [registro, setRegistro] = useState("");
  const [tipo, setTipo] = useState<"vacina" | "exame">("vacina");

  useEffect(() => {
    let ativo = true;
    acordarServidor();

    async function carregar() {
      try {
        const lista = await listarPetsTutor();
        if (ativo) setPets(lista);
      } catch {
        const nome =
          (typeof window !== "undefined" && localStorage.getItem("pessoa_nome")) || "Explorador";
        await garantirTutor(nome).catch(() => null);
        const listaRetry = await listarPetsTutor().catch(() => []);
        if (ativo) setPets(listaRetry);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const pet = pets.find((p) => p.id === atual) || pets[0];
  const substituir = (atualizado: PetExplorador) => setPets((lista) => lista.map((p) => (p.id === atualizado.id ? atualizado : p)));

  async function registrar(e: FormEvent) {
    e.preventDefault();
    if (!pet || !registro.trim()) return;
    try {
      substituir(await adicionarRegistroSaude(pet.id, tipo, registro.trim()));
      setRegistro("");
    } catch {
      alerta.erro("Não foi possível adicionar o registro");
    }
  }

  async function removerRegistro(registroId: string) {
    if (!pet) return;
    try {
      substituir(await removerRegistroSaude(pet.id, registroId));
    } catch {
      alerta.erro("Não foi possível remover o registro");
    }
  }

  async function excluir() {
    if (!pet) return;
    const confirmou = await alerta.confirmar({ title: `Excluir o cadastro de ${pet.nome}?`, text: "Vacinas e exames registrados também serão apagados.", confirmText: "Excluir", icon: "warning" });
    if (!confirmou) return;
    try {
      await excluirPetTutor(pet.id);
      setPets((lista) => lista.filter((p) => p.id !== pet.id));
      setAtual("");
    } catch {
      alerta.erro("Não foi possível excluir o pet");
    }
  }

  const historico = pet ? [
    ...pet.vacinas.map((v) => ({ ...v, tipo: "Vacina" })),
    ...pet.exames.map((v) => ({ ...v, tipo: "Exame" })),
  ].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)) : [];

  const resumo = pet ? [
    pet.especie && ESPECIE[pet.especie], pet.raca, pet.sexo && SEXO[pet.sexo],
    pet.idade && `${pet.idade} ano${pet.idade === "1" ? "" : "s"}`, pet.porte && `Porte ${PORTE[pet.porte]?.toLowerCase() || pet.porte}`,
  ].filter(Boolean).join(" · ") : "";

  if (carregando) return <div className={styles.pagina}><p>Carregando seus pets...</p></div>;

  return (
    <div className={styles.pagina}>
      <div className={styles.linha}>
        <div><h1 className={styles.titulo}>Meus Pets & Saúde</h1><p className={styles.subtitulo}>Prontuário, vacinas e exames dos seus pets cadastrados.</p></div>
        <Link className={styles.botao} href="/dashboard-explorador/novo"><Plus size={16} />Adicionar pet</Link>
      </div>

      {pets.length === 0 ? (
        <div className={styles.vazio}><PawPrint size={36} /><strong>Nenhum pet cadastrado</strong><p>Adicione seu primeiro pet para acompanhar informações de saúde.</p><Link className={styles.botao} href="/dashboard-explorador/novo">Cadastrar primeiro pet</Link></div>
      ) : (
        <>
          <div className={styles.topoPets}>
            <label className={styles.rotulo} htmlFor="petSelecionado">Selecionar pet:</label>
            <select id="petSelecionado" className={styles.seletor} value={pet?.id || ""} onChange={(e) => setAtual(e.target.value)}>
              {pets.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          {pet && (
            <div className={styles.grid}>
              <section className={styles.cartao}>
                <div className={styles.foto}>{pet.foto ? <img src={pet.foto} alt={pet.nome} /> : <PawPrint size={44} />}</div>
                <h2>{pet.nome}</h2>
                {resumo && <p className={styles.textoMenor}>{resumo}</p>}
                <div className={styles.lista}>
                  <div className={styles.cartaoBranco}>
                    <p><strong>Microchip:</strong> {pet.microchip || "Não informado"}</p>
                    <p><strong>Peso:</strong> {pet.peso || "Não informado"}</p>
                    <p><strong>Castrado:</strong> {pet.castrado}</p>
                    <p><strong>Vacinado:</strong> {pet.vacinado ? "Sim" : "Não"} · <strong>Vermifugado:</strong> {pet.vermifugado ? "Sim" : "Não"}</p>
                  </div>
                  <div className={styles.cartaoBranco}>
                    <strong>Alergias:</strong><p className={styles.textoMenor}>{pet.alergias || "Nenhuma informação registrada"}</p>
                    <strong>{pet.cuidadosEspeciais ? "Cuidados especiais:" : "Condição / cuidados:"}</strong><p className={styles.textoMenor}>{pet.condicao || "Nenhuma informação registrada"}</p>
                  </div>
                  {(pet.personalidade.length > 0 || pet.reatividade.length > 0 || pet.sobre) && (
                    <div className={styles.cartaoBranco}>
                      {pet.personalidade.length > 0 && <p className={styles.textoMenor}><strong>Personalidade:</strong> {pet.personalidade.join(", ")}</p>}
                      {pet.reatividade.length > 0 && <p className={styles.textoMenor}><strong>Convivência:</strong> {pet.reatividade.map((r) => CONVIVENCIAS[r] || r).join(", ")}</p>}
                      {pet.sobre && <p className={styles.textoMenor}><strong>Sobre:</strong> {pet.sobre}</p>}
                    </div>
                  )}
                </div>
                <div className={styles.linha} style={{ marginTop: 16 }}>
                  <Link className={styles.botao} href="/dashboard-explorador/agenda">Agendar atendimento</Link>
                  <Link className={styles.botaoSecundario} href={`/dashboard-explorador/novo?id=${pet.id}`} aria-label={`Editar ${pet.nome}`}><Pencil size={15} /></Link>
                  <button className={styles.botaoSecundario} onClick={excluir} aria-label={`Excluir ${pet.nome}`}><Trash2 size={15} /></button>
                </div>
              </section>
              <section className={`${styles.cartao} ${styles.cartaoLilás}`}>
                <h2>Vacinas registradas</h2>
                <div className={styles.cartaoBranco}>
                  {pet.vacinas.length ? pet.vacinas.map((v) => <p key={v.id} className={styles.textoMenor}>{v.descricao}</p>) : <p className={styles.textoMenor}>Nenhuma vacina registrada.</p>}
                </div>
                <hr className={styles.divisao} />
                <h2>Exames registrados</h2>
                <div className={styles.cartaoBranco}>
                  {pet.exames.length ? pet.exames.map((v) => <p key={v.id} className={styles.textoMenor}>{v.descricao}</p>) : <p className={styles.textoMenor}>Nenhum exame registrado.</p>}
                </div>
                <form onSubmit={registrar} className={styles.lista} style={{ marginTop: 18 }}>
                  <label className={styles.campo}>Tipo de registro
                    <select value={tipo} onChange={(e) => setTipo(e.target.value as "vacina" | "exame")}><option value="vacina">Vacina</option><option value="exame">Exame</option></select>
                  </label>
                  <label className={styles.campo}>Descrição e data<input value={registro} maxLength={300} onChange={(e) => setRegistro(e.target.value)} placeholder="Ex.: V10 — 27/10/2026" required /></label>
                  <button className={styles.botaoAzul}>Adicionar registro</button>
                </form>
              </section>
              <section className={styles.cartao}>
                <h2>Histórico de saúde</h2>
                <div className={styles.lista}>
                  {historico.length ? historico.map((r) => (
                    <div className={styles.linhaItem} key={r.id}>
                      <span><strong>{r.tipo}</strong><br />{r.descricao}</span>
                      <button className={styles.botaoSecundario} onClick={() => removerRegistro(r.id)} aria-label={`Remover ${r.tipo.toLowerCase()} ${r.descricao}`}><Trash2 size={14} /></button>
                    </div>
                  )) : <div className={styles.vazio}><CalendarDays size={27} /><p>Nenhum registro de saúde ainda.</p></div>}
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
