"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Heart, House, MapPin, MessageCircle, PawPrint, Stethoscope } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { alerta } from "@/lib/alerta";
import { listarDisponiveis, type AnimalTela } from "@/lib/animais";
import { useConta } from "@/lib/conta";
import {
  ROTULO_TIPO_PERFIL, avaliarOng, buscarOng, listarAvaliacoes, localizacaoOng, registrarVisualizacao,
  type Avaliacao, type Ong,
} from "@/lib/ong";
import { adicionarFavorito, listarFavoritos, removerFavorito } from "@/lib/painel";
import styles from "../../perfil-publico.module.css";

const VAGAS: Record<string, { texto: string; classe: string }> = {
  com: { texto: "Com vagas", classe: "chipVerde" },
  lotado: { texto: "Lotado", classe: "chipAmarelo" },
  superlotado: { texto: "Superlotado", classe: "chipRosa" },
};
const MORADIA: Record<string, string> = { qualquer: "Casa ou apartamento", casa: "Somente casa", apartamento: "Somente apartamento" };

function Estrelas({ nota, onEscolher }: { nota: number; onEscolher?: (n: number) => void }) {
  return (
    <span className={styles.estrelas} aria-label={`${nota} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => onEscolher ? (
        <button key={n} type="button" className={`${styles.estrela} ${n <= nota ? styles.estrelaAtiva : ""}`} onClick={() => onEscolher(n)} aria-label={`${n} estrela${n > 1 ? "s" : ""}`}>★</button>
      ) : (
        <span key={n} className={`${styles.estrela} ${n <= Math.round(nota) ? styles.estrelaAtiva : ""}`} style={{ fontSize: 16, cursor: "default" }} aria-hidden="true">★</span>
      ))}
    </span>
  );
}

export default function OngPublica() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const conta = useConta();
  const [ong, setOng] = useState<Ong | null>(null);
  const [erro, setErro] = useState("");
  const [pets, setPets] = useState<AnimalTela[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [favorito, setFavorito] = useState(false);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    buscarOng(id).then(setOng).catch(() => setErro("Perfil não encontrado."));
    listarAvaliacoes(id).then(setAvaliacoes).catch(() => {});
    listarDisponiveis().then((lista) => setPets(lista.filter((p) => p.ong_id === id))).catch(() => {});
    registrarVisualizacao("ong", id);
  }, [id]);

  const tutor = !!conta.me?.tutor;
  useEffect(() => {
    if (!tutor) return;
    listarFavoritos().then((lista) => setFavorito(lista.some((f) => f.tipo === "ong" && f.alvoId === id))).catch(() => {});
  }, [tutor, id]);

  function exigirExplorador(acao: string) {
    if (!conta.logado) {
      alerta.confirmar({ title: "Entre na sua conta", text: `Para ${acao}, faça login ou crie sua conta de Explorador.`, confirmText: "Fazer login" })
        .then((ok) => { if (ok) router.push("/login"); });
      return false;
    }
    if (!tutor) {
      alerta.info("Disponível para Exploradores", `Somente contas de Explorador podem ${acao}.`);
      return false;
    }
    return true;
  }

  async function alternarFavorito() {
    if (!exigirExplorador("salvar favoritos")) return;
    try {
      if (favorito) await removerFavorito("ong", id);
      else await adicionarFavorito("ong", id);
      setFavorito(!favorito);
    } catch {
      alerta.erro("Não foi possível atualizar o favorito");
    }
  }

  async function avaliar(e: FormEvent) {
    e.preventDefault();
    if (!exigirExplorador("avaliar")) return;
    if (nota < 1) { alerta.aviso("Escolha uma nota", "Clique nas estrelas para dar sua nota."); return; }
    setEnviando(true);
    try {
      await avaliarOng(id, nota, comentario.trim() || undefined);
      const [atualizada, lista] = await Promise.all([buscarOng(id), listarAvaliacoes(id)]);
      setOng(atualizada);
      setAvaliacoes(lista);
      setComentario("");
      alerta.sucesso("Obrigado pela avaliação!");
    } catch (err) {
      alerta.erro("Não foi possível avaliar", err instanceof Error ? err.message : undefined);
    } finally {
      setEnviando(false);
    }
  }

  const estacao = ong?.tipoPerfil === "estacao";
  const vagas = ong ? VAGAS[ong.statusVagas] : null;
  const instagram = ong?.instagram?.replace(/^@/, "");

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <button type="button" className={styles.voltar} onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>← Voltar</button>

          {erro ? <div className={styles.estado}>{erro} <Link href="/adocao-clinicas">Voltar para a busca</Link></div>
            : !ong ? <div className={styles.estado}>Carregando...</div>
              : <>
                <div className={styles.capa} style={ong.capaUrl ? { backgroundImage: `url(${ong.capaUrl})` } : undefined} />
                <div className={styles.cartao}>
                  <div className={styles.logo}>{ong.logoUrl ? <img src={ong.logoUrl} alt={ong.nomeOrganizacao} /> : estacao ? <Stethoscope size={40} /> : <House size={40} />}</div>
                  <h1 className={styles.nome}>
                    {ong.nomeOrganizacao}
                    {ong.verificada && <span className={styles.selo}>✓ Verificada</span>}
                  </h1>
                  <p className={styles.sub}>
                    {ROTULO_TIPO_PERFIL[ong.tipoPerfil || ""] || "Base Estelar"} · <MapPin size={14} aria-hidden="true" /> {ong.endereco || localizacaoOng(ong)}
                    {ong.ocultarEndereco && <small>(endereço exato oculto)</small>}
                  </p>
                  <div className={styles.chips}>
                    {!estacao && vagas && <span className={`${styles.chip} ${styles[vagas.classe]}`}>{vagas.texto}</span>}
                    {ong.raioAtuacao && <span className={styles.chip}>Atua num raio de {ong.raioAtuacao} km</span>}
                    {ong.totalAvaliacoes > 0 && <span className={styles.chip}>★ {ong.mediaAvaliacao.toFixed(1)} ({ong.totalAvaliacoes} avaliação{ong.totalAvaliacoes > 1 ? "ões" : ""})</span>}
                  </div>
                  {ong.descricao && <p className={styles.texto}>{ong.descricao}</p>}
                  <div className={styles.acoes}>
                    <button type="button" className={styles.botaoSecundario} aria-pressed={favorito} onClick={alternarFavorito}>
                      <Heart size={16} fill={favorito ? "currentColor" : "none"} /> {favorito ? "Favoritado" : "Favoritar"}
                    </button>
                    {ong.usuarioId && (
                      <button type="button" className={styles.botao}
                        onClick={() => { if (exigirExplorador("enviar mensagens")) router.push(`/dashboard-explorador/mensagens?destinatario=${ong.usuarioId}`); }}>
                        <MessageCircle size={16} /> Enviar mensagem
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.topo}>
                  <div className={styles.cartao}>
                    <h2 className={styles.secaoTitulo}>Contatos</h2>
                    <div className={styles.contatos}>
                      {ong.whatsapp && <a href={`https://wa.me/55${ong.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp: {ong.whatsapp}</a>}
                      {ong.emailPublico && <a href={`mailto:${ong.emailPublico}`}>{ong.emailPublico}</a>}
                      {instagram && <a href={`https://instagram.com/${encodeURIComponent(instagram)}`} target="_blank" rel="noopener noreferrer">Instagram: @{instagram}</a>}
                      {ong.facebook && <span>Facebook: {ong.facebook}</span>}
                      {ong.site && /^https?:\/\//.test(ong.site) && <a href={ong.site} target="_blank" rel="noopener noreferrer">{ong.site}</a>}
                      {!ong.whatsapp && !ong.emailPublico && !instagram && !ong.facebook && !ong.site && <span>Nenhum contato público informado.</span>}
                    </div>
                    {!estacao && <>
                      <h2 className={styles.secaoTitulo}>Critérios para adoção</h2>
                      <div className={styles.contatos}>
                        <span>Idade mínima: {ong.idadeMinima ?? 18} anos</span>
                        <span>Moradia: {MORADIA[ong.moradiaAceita] || "Casa ou apartamento"}</span>
                        {ong.exigeEntrevista && <span>✓ Entrevista com o adotante</span>}
                        {ong.exigeVisita && <span>✓ Visita ao lar</span>}
                        {ong.exigeTermo && <span>✓ Termo de responsabilidade</span>}
                      </div>
                    </>}
                  </div>

                  <div className={styles.cartao}>
                    <h2 className={styles.secaoTitulo}>Avaliações</h2>
                    <form className={styles.formulario} onSubmit={avaliar}>
                      <span>Sua nota: <Estrelas nota={nota} onEscolher={setNota} /></span>
                      <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={1000} placeholder="Conte como foi sua experiência (opcional)" />
                      <div className={styles.acoes}><button type="submit" className={styles.botao} disabled={enviando}>{enviando ? "Enviando..." : "Avaliar"}</button></div>
                    </form>
                    {avaliacoes.length === 0 ? <p className={styles.aviso}>Nenhuma avaliação ainda.</p> : avaliacoes.map((a) => (
                      <div key={a.id} className={styles.avaliacao}>
                        <strong>{a.autor}</strong> <Estrelas nota={a.nota} /> <small>{new Date(a.criadoEm).toLocaleDateString("pt-BR")}</small>
                        {a.comentario && <p>{a.comentario}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {!estacao && (
                  <div className={styles.cartao}>
                    <h2 className={styles.secaoTitulo}>Astros para adoção</h2>
                    {pets.length === 0 ? <p className={styles.aviso}>Nenhum pet disponível para adoção no momento.</p> : (
                      <div className={styles.lista}>
                        {pets.map((p) => (
                          <Link key={p.id} href={`/adocao-clinicas/pet/${p.id}`} className={styles.petCard}>
                            <span>{p.foto_url ? <img src={p.foto_url} alt="" /> : <PawPrint size={30} />}</span>
                            <strong>{p.nome}</strong>
                            <small>{p.sexo === "femea" ? "Fêmea" : "Macho"}{p.idade ? ` · ${p.idade} ano${p.idade === 1 ? "" : "s"}` : ""}</small>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>}
        </div>
      </main>
      <Footer />
    </>
  );
}
