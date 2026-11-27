"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useClinica } from "../../useClinica";
import type { Servico } from "../../dados";
import styles from "./NovoServico.module.css";

type Adicional = { nome: string; valor: string };
const CATEGORIAS = ["Consulta veterinária", "Vacinação", "Exames", "Cirurgia", "Banho e tosa", "Odontologia", "Internação", "Emergência", "Outros"];
const inicial: Adicional = { nome: "", valor: "" };

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const { dados, pronto, atualizar } = useClinica();
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<Servico["tipo"]>("fixo");
  const [preco, setPreco] = useState("");
  const [adicionais, setAdicionais] = useState<Adicional[]>([{ ...inicial }]);
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    if (!pronto || carregado) return;
    queueMicrotask(() => {
      if (id) {
        const atual = dados.servicos.find(s => s.id === id);
        if (atual) {
          setNome(atual.nome); setCategoria(atual.categoria); setDescricao(atual.descricao);
          setTipo(atual.tipo); setPreco(String(atual.preco));
          try {
            const parsed: unknown = JSON.parse(atual.adicionais);
            if (parsed && typeof parsed === "object" && "itens" in parsed && Array.isArray(parsed.itens)) {
              setAdicionais(parsed.itens.map((a: Adicional) => ({ nome: String(a.nome ?? ""), valor: String(a.valor ?? "") })));
              setObservacoes("observacoes" in parsed ? String(parsed.observacoes ?? "") : "");
            } else { setObservacoes(atual.adicionais || ""); }
          } catch { setObservacoes(atual.adicionais || ""); }
        }
      }
      setCarregado(true);
    });
  }, [pronto, carregado, id, dados.servicos]);

  function publicar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); setErro("");
    const valor = Number(preco);
    if (!nome.trim() || !categoria.trim() || !descricao.trim() || preco.trim() === "" || !Number.isFinite(valor) || valor < 0) {
      setErro("Preencha os campos obrigatórios e informe um preço válido."); return;
    }
    if (tipo === "adicionais" && adicionais.some(a => (a.nome.trim() && (a.valor.trim() === "" || Number(a.valor) < 0)) || (!a.nome.trim() && a.valor.trim()))) {
      setErro("Preencha corretamente o nome e o valor de cada adicional."); return;
    }
    const anterior = id ? dados.servicos.find(s => s.id === id) : undefined;
    if (id && !anterior) { setErro("Serviço não encontrado. Volte à listagem e tente novamente."); return; }
    const servico: Servico = {
      id: anterior?.id ?? crypto.randomUUID(), nome: nome.trim(), categoria: categoria.trim(), descricao: descricao.trim(),
      tipo, preco: valor, adicionais: JSON.stringify({ itens: tipo === "adicionais" ? adicionais.filter(a => a.nome.trim()) : [], observacoes: observacoes.trim() }),
      ativo: anterior?.ativo ?? true, criadoEm: anterior?.criadoEm ?? new Date().toISOString(),
    };
    atualizar(d => ({ ...d, servicos: anterior ? d.servicos.map(s => s.id === anterior.id ? servico : s) : [servico, ...d.servicos] }));
    router.push("/dashboard-clinica/servicos");
  }

  return <form className={styles.formulario} onSubmit={publicar}>
    <input className={styles.campo} required maxLength={120} aria-label="Nome do serviço" placeholder="Nome do serviço" value={nome} onChange={e => setNome(e.target.value)}/>
    <select className={`${styles.campo} ${styles.seletorCategoria}`} required aria-label="Categoria" value={categoria} onChange={e => setCategoria(e.target.value)}>
      <option value="" disabled>Categoria</option>
      {CATEGORIAS.map(opcao => <option key={opcao} value={opcao}>{opcao}</option>)}
      {categoria && !CATEGORIAS.includes(categoria) && <option value={categoria}>{categoria}</option>}
    </select>
    <div className={styles.areaTexto}><textarea className={styles.descricao} required maxLength={1500} aria-label="Descrição do serviço" placeholder="Descrição do serviço" value={descricao} onChange={e => setDescricao(e.target.value)}/><img className={styles.iconeEditar} src="/icons-clinica/editar.svg" alt="" aria-hidden="true"/></div>
    <fieldset className={styles.precificacao}><legend>Tipo de precificação:</legend><label><input type="radio" name="tipo" checked={tipo === "fixo"} onChange={() => setTipo("fixo")}/> Preço Fixo</label><label><input type="radio" name="tipo" checked={tipo === "adicionais"} onChange={() => setTipo("adicionais")}/> Preço “A partir de” + adicionais</label></fieldset>
    <div className={styles.precoLinha}><label className={styles.precoLabel}>{tipo === "fixo" ? "Preço fixo (R$)" : "Preço inicial (R$)"}<input type="number" min="0" step="0.01" required value={preco} onChange={e => setPreco(e.target.value)} placeholder="0,00"/></label></div>
    {tipo === "adicionais" && <div className={styles.adicionais}>{adicionais.map((a, index) => <div key={index} className={styles.adicionalLinha}><input aria-label={`Nome do adicional ${index+1}`} placeholder="Nome do adicional" value={a.nome} onChange={e => setAdicionais(lista => lista.map((x,i) => i===index ? {...x,nome:e.target.value} : x))}/><input aria-label={`Valor extra ${index+1}`} type="number" min="0" step="0.01" placeholder="Valor extra (+R$)" value={a.valor} onChange={e => setAdicionais(lista => lista.map((x,i) => i===index ? {...x,valor:e.target.value} : x))}/>{adicionais.length > 1 && <button type="button" onClick={() => setAdicionais(lista => lista.filter((_,i) => i!==index))} aria-label={`Remover adicional ${index+1}`}>×</button>}</div>)}<button className={styles.addAdicional} type="button" onClick={() => setAdicionais(lista => [...lista,{...inicial}])}>+ Adicionar outro</button></div>}
    <div className={styles.areaTexto}><textarea className={styles.observacoes} aria-label="Informações complementares" placeholder="Informações complementares do serviço (opcional)" value={observacoes} onChange={e => setObservacoes(e.target.value)}/><img className={styles.iconeEditar} src="/icons-clinica/editar.svg" alt="" aria-hidden="true"/></div>
    {erro && <p className={styles.erro} role="alert">{erro}</p>}
    <div className={styles.botoes}><button className={styles.publicar} type="submit">{id ? "Salvar alterações" : "Publicar"}</button><button className={styles.cancelar} type="button" onClick={() => router.push("/dashboard-clinica/servicos")}>Cancelar</button></div>
  </form>;
}

export default function NovoServico() { return <Suspense fallback={<p>Carregando formulário...</p>}><Formulario/></Suspense>; }
