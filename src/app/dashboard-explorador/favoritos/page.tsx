"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, House, PawPrint, Stethoscope, Trash2 } from "lucide-react";
import { alerta } from "@/lib/alerta";
import { acordarServidor } from "@/lib/api";
import { garantirTutor } from "@/lib/perfil";
import { listarFavoritos, removerFavorito, type Favorito } from "@/lib/painel";
import styles from "../painel-interno.module.css";

export default function Favoritos() {
  const [itens, setItens] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<"pet" | "ong">("pet");

  useEffect(() => {
    let ativo = true;
    acordarServidor();

    async function carregar() {
      try {
        const lista = await listarFavoritos();
        if (ativo) setItens(lista);
      } catch {
        const nome =
          (typeof window !== "undefined" && localStorage.getItem("pessoa_nome")) || "Explorador";
        await garantirTutor(nome).catch(() => null);
        const listaRetry = await listarFavoritos().catch(() => []);
        if (ativo) setItens(listaRetry);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  async function remover(item: Favorito) {
    try {
      await removerFavorito(item.tipo, item.alvoId);
      setItens((lista) => lista.filter((i) => !(i.tipo === item.tipo && i.alvoId === item.alvoId)));
    } catch {
      alerta.erro("Não foi possível remover o favorito");
    }
  }

  const filtrados = itens.filter((i) => i.tipo === aba);
  const link = (i: Favorito) => (i.tipo === "pet" ? `/adocao-clinicas/pet/${i.alvoId}` : `/adocao-clinicas/ong/${i.alvoId}`);

  return (
    <div className={styles.pagina}>
      <div><h1 className={styles.titulo}>Meus Favoritos</h1><p className={styles.subtitulo}>Pets, ONGs e clínicas que você salvou para consultar depois.</p></div>
      <div className={styles.topoPets}>
        <button className={aba === "pet" ? styles.botao : styles.botaoSecundario} onClick={() => setAba("pet")}>Pets favoritos</button>
        <button className={aba === "ong" ? styles.botao : styles.botaoSecundario} onClick={() => setAba("ong")}>ONGs e clínicas favoritas</button>
      </div>
      {carregando ? <p>Carregando favoritos...</p> : filtrados.length ? (
        <div className={styles.grid}>
          {filtrados.map((i) => (
            <article className={styles.cartaoBranco} key={`${i.tipo}-${i.alvoId}`}>
              <Link href={link(i)} className={styles.foto}>
                {i.foto ? <img src={i.foto} alt={i.nome} /> : i.categoria === "pet" ? <PawPrint size={36} /> : i.categoria === "clinica" ? <Stethoscope size={36} /> : <House size={36} />}
              </Link>
              <h2 className={styles.itemNome}><Link href={link(i)}>{i.nome}</Link></h2>
              <p className={styles.textoMenor}>{i.categoria === "clinica" ? "Estação de Cuidado · " : i.categoria === "base" ? "Base Estelar · " : ""}{i.descricao || "Sem descrição"}</p>
              <button className={styles.botaoSecundario} onClick={() => remover(i)}><Trash2 size={15} /> Remover favorito</button>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.vazio}>
          <Heart size={36} />
          <strong>{aba === "pet" ? "Nenhum pet favorito" : "Nenhuma ONG ou clínica favorita"}</strong>
          <p>Explore os pets e clínicas disponíveis para adicionar aos seus favoritos.</p>
          <Link className={styles.botao} href="/adocao-clinicas">Explorar pets e clínicas</Link>
        </div>
      )}
    </div>
  );
}
