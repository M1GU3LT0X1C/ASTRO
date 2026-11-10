"use client";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { PawPrint, Plus, Trash2, CalendarDays, Pencil, X } from "lucide-react";
import { alerta } from "@/lib/alerta";
import {
  adicionarRegistroSaude, atualizarPetTutor, cadastrarPetTutor, excluirPetTutor, listarPetsTutor, removerRegistroSaude,
  type PetExplorador, type PetExploradorForm,
} from "@/lib/explorador";
import { enviarImagemPublica, validarImagem } from "@/lib/upload";
import styles from "../painel-interno.module.css";

const vazio: PetExploradorForm = { nome: "", microchip: "", peso: "", castrado: "Não informado", alergias: "", condicao: "", fotoUrl: "" };
const CAMPOS = [
  ["nome", "Nome do pet"], ["microchip", "Microchip (opcional)"], ["peso", "Peso (opcional)"],
  ["alergias", "Alergias (opcional)"], ["condicao", "Condição crônica (opcional)"],
] as const;

export default function MeusPets() {
  const [pets, setPets] = useState<PetExplorador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atual, setAtual] = useState("");
  const [form, setForm] = useState<PetExploradorForm>(vazio);
  const [editando, setEditando] = useState<string | null>(null); // id do pet em edicao
  const [novo, setNovo] = useState(false);
  const [registro, setRegistro] = useState("");
  const [tipo, setTipo] = useState<"vacina" | "exame">("vacina");
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  useEffect(() => {
    listarPetsTutor().then(setPets).catch(() => alerta.erro("Não foi possível carregar seus pets")).finally(() => setCarregando(false));
  }, []);

  const pet = pets.find((p) => p.id === atual) || pets[0];
  const substituir = (atualizado: PetExplorador) => setPets((lista) => lista.map((p) => (p.id === atualizado.id ? atualizado : p)));

  function abrirFormulario(p?: PetExplorador) {
    setEditando(p?.id ?? null);
    setForm(p ? {
      nome: p.nome, microchip: p.microchip || "", peso: p.peso || "", castrado: p.castrado || "Não informado",
      alergias: p.alergias || "", condicao: p.condicao || "", fotoUrl: p.foto || "",
    } : vazio);
    setNovo(true);
  }

  async function enviarFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    const problema = validarImagem(arquivo, 5);
    if (problema) { alerta.aviso("Imagem inválida", problema); return; }
    setEnviandoFoto(true);
    try {
      const url = await enviarImagemPublica(arquivo, "pets-tutor");
      setForm((f) => ({ ...f, fotoUrl: url }));
    } catch (erro) {
      alerta.erro("Não foi possível enviar a foto", erro instanceof Error ? erro.message : undefined);
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setSalvando(true);
    try {
      if (editando) {
        substituir(await atualizarPetTutor(editando, form));
      } else {
        const criado = await cadastrarPetTutor(form);
        setPets((lista) => [...lista, criado]);
        setAtual(criado.id);
      }
      setForm(vazio);
      setNovo(false);
      setEditando(null);
    } catch (erro) {
      alerta.erro("Não foi possível salvar o pet", erro instanceof Error ? erro.message : undefined);
    } finally {
      setSalvando(false);
    }
  }

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

  if (carregando) return <div className={styles.pagina}><p>Carregando seus pets...</p></div>;

  return (
    <div className={styles.pagina}>
      <div className={styles.linha}>
        <div><h1 className={styles.titulo}>Meus Pets & Saúde</h1><p className={styles.subtitulo}>Prontuário, vacinas e exames dos seus pets cadastrados.</p></div>
        <button className={styles.botao} onClick={() => (novo ? setNovo(false) : abrirFormulario())}><Plus size={16} />Adicionar pet</button>
      </div>

      {novo && (
        <form className={styles.cartaoBranco} onSubmit={salvar}>
          <div className={styles.linha}>
            <h2>{editando ? "Editar pet" : "Cadastrar pet"}</h2>
            <button type="button" className={styles.botaoSecundario} onClick={() => { setNovo(false); setEditando(null); }} aria-label="Fechar formulário"><X size={15} /></button>
          </div>
          <div className={styles.form}>
            {CAMPOS.map(([chave, rotulo]) => (
              <label className={styles.campo} key={chave}>{rotulo}
                <input required={chave === "nome"} maxLength={chave === "alergias" || chave === "condicao" ? 500 : 80} value={form[chave]} onChange={(e) => setForm((f) => ({ ...f, [chave]: e.target.value }))} />
              </label>
            ))}
            <label className={styles.campo}>Castrado
              <select value={form.castrado} onChange={(e) => setForm((f) => ({ ...f, castrado: e.target.value }))}>
                <option>Não informado</option><option>Sim</option><option>Não</option>
              </select>
            </label>
            <label className={styles.campo}>Foto (opcional)
              <input type="file" accept="image/*" onChange={enviarFoto} disabled={enviandoFoto} />
              {enviandoFoto ? <small>Enviando foto...</small> : form.fotoUrl && <small>Foto selecionada ✓</small>}
            </label>
          </div>
          <p className={styles.aviso}>Estas informações não substituem um prontuário veterinário oficial.</p>
          <button className={styles.botao} type="submit" disabled={salvando || enviandoFoto}>{salvando ? "Salvando..." : "Salvar pet"}</button>
        </form>
      )}

      {pets.length === 0 && !novo ? (
        <div className={styles.vazio}><PawPrint size={36} /><strong>Nenhum pet cadastrado</strong><p>Adicione seu primeiro pet para acompanhar informações de saúde.</p><button className={styles.botao} onClick={() => abrirFormulario()}>Cadastrar primeiro pet</button></div>
      ) : pets.length > 0 && (
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
                <div className={styles.lista}>
                  <div className={styles.cartaoBranco}>
                    <p><strong>Microchip:</strong> {pet.microchip || "Não informado"}</p>
                    <p><strong>Peso:</strong> {pet.peso || "Não informado"}</p>
                    <p><strong>Castrado:</strong> {pet.castrado}</p>
                  </div>
                  <div className={styles.cartaoBranco}>
                    <strong>Alergias:</strong><p className={styles.textoMenor}>{pet.alergias || "Nenhuma informação registrada"}</p>
                    <strong>Condição crônica:</strong><p className={styles.textoMenor}>{pet.condicao || "Nenhuma informação registrada"}</p>
                  </div>
                </div>
                <div className={styles.linha} style={{ marginTop: 16 }}>
                  <Link className={styles.botao} href="/dashboard-explorador/agenda">Agendar atendimento</Link>
                  <button className={styles.botaoSecundario} onClick={() => abrirFormulario(pet)} aria-label={`Editar ${pet.nome}`}><Pencil size={15} /></button>
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
