"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Heart, House, MessageCircle, PawPrint } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { alerta } from "@/lib/alerta";
import { CONVIVENCIAS, STATUS_PET, TEMPERAMENTOS, buscarAnimal, type AnimalTela } from "@/lib/animais";
import { minhasSolicitacoes, solicitarAdocao, EM_ANDAMENTO } from "@/lib/adocoes";
import { useConta } from "@/lib/conta";
import { buscarQuestionario, questionarioCompleto } from "@/lib/explorador";
import { registrarVisualizacao } from "@/lib/ong";
import { adicionarFavorito, listarFavoritos, removerFavorito } from "@/lib/painel";
import styles from "../../perfil-publico.module.css";

const ESPECIE: Record<string, string> = { cachorro: "Cachorro", gato: "Gato", outro: "Outro" };
const PORTE: Record<string, string> = { pequeno: "Pequeno porte", medio: "Médio porte", grande: "Grande porte" };

export default function PetPublico() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const conta = useConta();
  const [pet, setPet] = useState<AnimalTela | null>(null);
  const [erro, setErro] = useState("");
  const [favorito, setFavorito] = useState(false);
  const [formAberto, setFormAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [jaSolicitou, setJaSolicitou] = useState(false);
  const [questionarioOk, setQuestionarioOk] = useState(true);

  useEffect(() => {
    buscarAnimal(id).then(setPet).catch(() => setErro("Pet não encontrado."));
    registrarVisualizacao("pet", id);
  }, [id]);

  const tutor = !!conta.me?.tutor;
  useEffect(() => {
    if (!tutor) return;
    listarFavoritos().then((lista) => setFavorito(lista.some((f) => f.tipo === "pet" && f.alvoId === id))).catch(() => {});
    minhasSolicitacoes().then((lista) => setJaSolicitou(lista.some((s) => s.petId === id && EM_ANDAMENTO.includes(s.status)))).catch(() => {});
    buscarQuestionario().then((q) => setQuestionarioOk(questionarioCompleto(q))).catch(() => {});
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
      if (favorito) await removerFavorito("pet", id);
      else await adicionarFavorito("pet", id);
      setFavorito(!favorito);
    } catch {
      alerta.erro("Não foi possível atualizar o favorito");
    }
  }

  async function enviarSolicitacao(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await solicitarAdocao(id, mensagem.trim() || undefined);
      setJaSolicitou(true);
      setFormAberto(false);
      const ver = await alerta.confirmar({
        title: "Solicitação enviada! 🎉",
        text: `A ONG vai analisar seu pedido para adotar ${pet?.nome}. Acompanhe o andamento em Minhas adoções.`,
        confirmText: "Ver minhas adoções", cancelText: "Continuar aqui", icon: "success",
      });
      if (ver) router.push("/dashboard-explorador/adocoes");
    } catch (err) {
      alerta.erro("Não foi possível enviar", err instanceof Error ? err.message : undefined);
    } finally {
      setEnviando(false);
    }
  }

  const disponivel = pet?.status === "disponivel";

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <button type="button" className={styles.voltar} onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>← Voltar</button>

          {erro ? <div className={styles.estado}>{erro} <Link href="/adocao-clinicas">Buscar outros pets</Link></div>
            : !pet ? <div className={styles.estado}>Carregando...</div>
              : (
                <div className={styles.topo}>
                  <div className={styles.cartao}>
                    <div className={styles.fotoGrande}>{pet.foto_url ? <img src={pet.foto_url} alt={pet.nome} /> : <PawPrint size={64} />}</div>
                    {pet.ong_id && (
                      <Link href={`/adocao-clinicas/ong/${pet.ong_id}`} className={styles.ongMini}>
                        <span>{pet.logo_ong ? <img src={pet.logo_ong} alt="" /> : <House size={22} />}</span>
                        <span><strong>{pet.nome_ong}</strong><br /><small>{[pet.cidade, pet.estado].filter(Boolean).join(" - ") || "Ver perfil"}</small></span>
                      </Link>
                    )}
                  </div>

                  <div className={styles.cartao}>
                    <h1 className={styles.nome}>
                      {pet.nome}
                      {!disponivel && <span className={`${styles.chip} ${styles.chipAmarelo}`}>{STATUS_PET[pet.status] || pet.status}</span>}
                    </h1>
                    <p className={styles.sub}>
                      {[ESPECIE[pet.especie], pet.raca, pet.sexo === "femea" ? "Fêmea" : "Macho",
                        pet.idade ? `${pet.idade} ano${pet.idade === 1 ? "" : "s"}` : null, PORTE[pet.porte]].filter(Boolean).join(" · ")}
                    </p>

                    <div className={styles.chips}>
                      {pet.castrado && <span className={`${styles.chip} ${styles.chipVerde}`}>Castrado(a)</span>}
                      {pet.vacinado && <span className={`${styles.chip} ${styles.chipVerde}`}>Vacinado(a)</span>}
                      {pet.vermifugado && <span className={`${styles.chip} ${styles.chipVerde}`}>Vermifugado(a)</span>}
                      {pet.cuidados_especiais && <span className={`${styles.chip} ${styles.chipRosa}`}>Precisa de cuidados especiais</span>}
                    </div>

                    {pet.temperamentos.length > 0 && <>
                      <h2 className={styles.secaoTitulo}>Personalidade</h2>
                      <div className={styles.chips}>{pet.temperamentos.map((t) => <span key={t} className={styles.chip}>{TEMPERAMENTOS[t] || t}</span>)}</div>
                    </>}
                    {pet.convivencia.length > 0 && <>
                      <h2 className={styles.secaoTitulo}>Convivência</h2>
                      <div className={styles.chips}>{pet.convivencia.map((c) => <span key={c} className={styles.chip}>{CONVIVENCIAS[c] || c}</span>)}</div>
                    </>}
                    {pet.historia && <>
                      <h2 className={styles.secaoTitulo}>História</h2>
                      <p className={styles.texto}>{pet.historia}</p>
                    </>}

                    <div className={styles.acoes}>
                      {disponivel && (
                        <button type="button" className={styles.botao} disabled={jaSolicitou}
                          onClick={() => { if (exigirExplorador("pedir adoção")) setFormAberto(true); }}>
                          {jaSolicitou ? "Solicitação em andamento" : "Quero adotar"}
                        </button>
                      )}
                      <button type="button" className={styles.botaoSecundario} aria-pressed={favorito} onClick={alternarFavorito}>
                        <Heart size={16} fill={favorito ? "currentColor" : "none"} /> {favorito ? "Favoritado" : "Favoritar"}
                      </button>
                      {pet.ong_usuario_id && (
                        <button type="button" className={styles.botaoSecundario}
                          onClick={() => { if (exigirExplorador("conversar com a ONG")) router.push(`/dashboard-explorador/mensagens?destinatario=${pet.ong_usuario_id}`); }}>
                          <MessageCircle size={16} /> Conversar com a ONG
                        </button>
                      )}
                    </div>

                    {formAberto && (
                      <form className={styles.formulario} onSubmit={enviarSolicitacao}>
                        <strong>Pedido de adoção de {pet.nome}</strong>
                        {!questionarioOk && (
                          <p className={styles.aviso}>
                            Dica: responda o <Link href="/perfil-explorador">questionário de adoção</Link> no seu perfil. A ONG usa essas respostas para analisar o pedido.
                          </p>
                        )}
                        <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} maxLength={1000}
                          placeholder="Conte um pouco sobre você e por que quer adotar (opcional)" />
                        <div className={styles.acoes}>
                          <button type="submit" className={styles.botao} disabled={enviando}>{enviando ? "Enviando..." : "Enviar solicitação"}</button>
                          <button type="button" className={styles.botaoSecundario} onClick={() => setFormAberto(false)}>Cancelar</button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
        </div>
      </main>
      <Footer />
    </>
  );
}
