"use client";
import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Trash2 } from "lucide-react";
import { alerta } from "@/lib/alerta";
import { listarPetsTutor, type PetExplorador } from "@/lib/explorador";
import { criarCompromisso, excluirCompromisso, horaCurta, listarAgenda, type Compromisso } from "@/lib/painel";
import styles from "../painel-interno.module.css";

const inicial = { pet: "", descricao: "", local: "", data: "", hora: "09:00" };

export default function Agenda() {
  const [itens, setItens] = useState<Compromisso[]>([]);
  const [pets, setPets] = useState<PetExplorador[]>([]);
  const [form, setForm] = useState(inicial);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listarAgenda().then(setItens).catch(() => alerta.erro("Não foi possível carregar a agenda"));
    listarPetsTutor().then(setPets).catch(() => setPets([]));
  }, []);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form.data || !form.descricao.trim()) return;
    setSalvando(true);
    try {
      const novo = await criarCompromisso({
        pet: form.pet || undefined, descricao: form.descricao.trim(), local: form.local || undefined,
        data: form.data, hora: form.hora || undefined,
      });
      setItens((lista) => [...lista, novo].sort((a, b) => (a.data + horaCurta(a.hora)).localeCompare(b.data + horaCurta(b.hora))));
      setForm(inicial);
    } catch (erro) {
      alerta.erro("Não foi possível salvar o compromisso", erro instanceof Error ? erro.message : undefined);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string) {
    try {
      await excluirCompromisso(id);
      setItens((lista) => lista.filter((i) => i.id !== id));
    } catch {
      alerta.erro("Não foi possível excluir o compromisso");
    }
  }

  return (
    <div className={styles.pagina}>
      <div><h1 className={styles.titulo}>Agenda</h1><p className={styles.subtitulo}>Organize consultas, exames e lembretes dos seus pets.</p></div>
      <div className={styles.gridDois}>
        <form className={styles.cartaoBranco} onSubmit={salvar}>
          <h2>Novo compromisso</h2>
          <div className={styles.form}>
            <label className={styles.campo}>Pet
              <select value={form.pet} onChange={(e) => setForm((f) => ({ ...f, pet: e.target.value }))}>
                <option value="">Selecionar pet (opcional)</option>
                {pets.map((p) => <option key={p.id} value={p.nome}>{p.nome}</option>)}
              </select>
            </label>
            <label className={styles.campo}>Descrição<input required maxLength={500} value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} placeholder="Consulta, vacina, exame..." /></label>
            <label className={styles.campo}>Data<input type="date" required value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} /></label>
            <label className={styles.campo}>Hora<input type="time" required value={form.hora} onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))} /></label>
            <label className={`${styles.campo} ${styles.amplo}`}>Local<input maxLength={200} value={form.local} onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))} placeholder="Clínica ou endereço (opcional)" /></label>
          </div>
          <p className={styles.aviso}>Os compromissos são lembretes seus; este formulário não realiza reservas em clínicas.</p>
          <button className={styles.botao} type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Adicionar compromisso"}</button>
        </form>
        <section className={styles.cartao}>
          <h2>Meus compromissos</h2>
          {itens.length ? (
            <div className={styles.lista}>
              {itens.map((i) => (
                <div className={styles.linhaItem} key={i.id}>
                  <div>
                    <strong>{i.descricao}</strong>
                    <p className={styles.textoMenor}>{new Date(i.data + "T12:00:00").toLocaleDateString("pt-BR")}{i.hora ? ` às ${horaCurta(i.hora)}` : ""}{i.pet ? ` · ${i.pet}` : ""}</p>
                    {i.local && <p className={styles.textoMenor}>{i.local}</p>}
                  </div>
                  <button className={styles.botaoSecundario} onClick={() => remover(i.id)} aria-label="Excluir compromisso"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          ) : <div className={styles.vazio}><CalendarDays size={32} /><strong>Agenda vazia</strong><p>Seus compromissos aparecerão aqui.</p></div>}
        </section>
      </div>
    </div>
  );
}
