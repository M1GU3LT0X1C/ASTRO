"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import {
  UserRound,
  Camera,
  MapPin,
  Pencil,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import styles from "./PerfilExplorador.module.css";
import { alerta } from "@/lib/alerta";
import { buscarPerfil, buscarQuestionario, salvarPerfil, salvarQuestionario } from "@/lib/explorador";
import { enviarImagemPublica, validarImagem } from "@/lib/upload";

type DadosPerfil = {
  nome: string;
  email: string;
  telefone: string;
  nascimento: string;
  endereco: string;
  biografia: string;
};

type CampoEditavel = keyof DadosPerfil;

type Perguntas = {
  moradia: string;
  condicao: string;
  redes: string;
  quintal: string;
  acessoRua: string;
  modeloTrabalho: string;
  tempoSozinho: string;
  pessoasCasa: string;
  moradoresConcordam: string;
  petsResidencia: string;
  tiposPets: string[];
};

const dadosIniciais: DadosPerfil = {
  nome: "",
  email: "",
  telefone: "",
  nascimento: "", // yyyy-mm-dd
  endereco: "",
  biografia: "",
};

// o e-mail de login so muda pelas Configuracoes (Supabase Auth)
const SOMENTE_LEITURA: CampoEditavel[] = ["email"];

const formatarNascimento = (iso: string) => {
  const [ano, mes, dia] = iso.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
};

const perguntasIniciais: Perguntas = {
  moradia: "",
  condicao: "",
  redes: "",
  quintal: "",
  acessoRua: "",
  modeloTrabalho: "",
  tempoSozinho: "",
  pessoasCasa: "",
  moradoresConcordam: "",
  petsResidencia: "",
  tiposPets: [],
};

export default function PerfilExplorador() {
  const [dados, setDados] = useState<DadosPerfil>(dadosIniciais);

  const [perguntas, setPerguntas] =
    useState<Perguntas>(perguntasIniciais);

  const [editando, setEditando] =
    useState<CampoEditavel | null>(null);

  const [rascunho, setRascunho] = useState("");

  const [foto, setFoto] = useState<string | null>(null);

  type Secao = "moradia" | "condicao" | "protecao" | "tempo" | "pessoas" | "pets";
  const [perguntaAberta, setPerguntaAberta] = useState<Secao | null>(null);
  const [avisoSalvo, setAvisoSalvo] = useState(false);
  const [salvandoQuestionario, setSalvandoQuestionario] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [perfilCarregado, setPerfilCarregado] = useState(false);

  useEffect(() => {
    buscarPerfil()
      .then((perfil) => {
        setDados({
          nome: perfil.nome || "",
          email: perfil.email || "",
          telefone: perfil.telefone || "",
          nascimento: perfil.nascimento || "",
          endereco: perfil.endereco || "",
          biografia: perfil.biografia || "",
        });
        setFoto(perfil.fotoUrl);
        setPerfilCarregado(true);
      })
      .catch(() => alerta.erro("Não foi possível carregar seu perfil", "Tente novamente em instantes."));
    buscarQuestionario()
      .then((q) => setPerguntas({ ...perguntasIniciais, ...Object.fromEntries(Object.entries(q).filter(([, v]) => v !== null)) } as Perguntas))
      .catch(() => { /* questionario fica em branco */ });
  }, []);

  async function persistirPerfil(novos: DadosPerfil, novaFoto: string | null) {
    // sem o perfil atual, salvar apagaria os outros campos
    if (!perfilCarregado) throw new Error("Seu perfil ainda não foi carregado. Recarregue a página.");
    await salvarPerfil({
      nome: novos.nome.trim(),
      telefone: novos.telefone || null,
      nascimento: novos.nascimento || null,
      endereco: novos.endereco || null,
      biografia: novos.biografia || null,
      fotoUrl: novaFoto,
    });
  }

  async function salvarRespostas() {
    setSalvandoQuestionario(true);
    try {
      await salvarQuestionario(perguntas);
      setPerguntaAberta(null);
      setAvisoSalvo(true);
    } catch (erro) {
      alerta.erro("Não foi possível salvar o questionário", erro instanceof Error ? erro.message : undefined);
    } finally {
      setSalvandoQuestionario(false);
    }
  }

  function alternarPergunta(campo: Secao) {
    setPerguntaAberta((atual) => (atual === campo ? null : campo));
  }

  // INICIAR EDIÇÃO DE UM CAMPO

  function iniciarEdicao(campo: CampoEditavel) {
    setEditando(campo);
    setRascunho(dados[campo]);
  }

  // SALVAR EDIÇÃO LOCALMENTE

  async function salvarEdicao() {
    if (!editando) return;
    if (editando === "nome" && !rascunho.trim()) {
      alerta.aviso("Nome obrigatório", "Informe seu nome.");
      return;
    }

    const anteriores = dados;
    const novos = { ...dados, [editando]: rascunho };
    setDados(novos);
    setEditando(null);
    setRascunho("");
    try {
      await persistirPerfil(novos, foto);
    } catch (erro) {
      setDados(anteriores);
      alerta.erro("Não foi possível salvar", erro instanceof Error ? erro.message : undefined);
    }
  }

  // CANCELAR EDIÇÃO

  function cancelarEdicao() {
    setEditando(null);
    setRascunho("");
  }

  // ATUALIZAR QUESTIONÁRIO

  function atualizarPergunta(
    campo: keyof Perguntas,
    valor: string
  ) {
    setAvisoSalvo(false);
    setPerguntas((anterior) => ({
      ...anterior,
      [campo]: valor,
      ...(campo === "petsResidencia" && valor === "Não" ? { tiposPets: [] } : {}),
    }));
  }

  // SELEÇÃO MÚLTIPLA DE PETS

  function alternarTipoPet(tipo: string) {
    setAvisoSalvo(false);
    setPerguntas((anterior) => ({
      ...anterior,
      tiposPets: anterior.tiposPets.includes(tipo)
        ? anterior.tiposPets.filter((item) => item !== tipo)
        : [...anterior.tiposPets, tipo],
    }));
  }

  // ALTERAR FOTO DE PERFIL

  async function alterarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";

    if (!arquivo) return;

    const problema = validarImagem(arquivo, 5);
    if (problema) {
      alerta.aviso("Imagem inválida", problema);
      return;
    }

    setEnviandoFoto(true);
    try {
      const url = await enviarImagemPublica(arquivo, "explorador");
      await persistirPerfil(dados, url);
      setFoto(url);
    } catch (erro) {
      alerta.erro("Não foi possível alterar a foto", erro instanceof Error ? erro.message : undefined);
    } finally {
      setEnviandoFoto(false);
    }
  }

  // RENDERIZAR CAMPOS EDITÁVEIS

  function renderizarCampo(
    campo: CampoEditavel,
    placeholder: string
  ) {
    const estaEditando = editando === campo;

    return (
      <div className={styles.linhaInformacao} key={campo}>
        {estaEditando ? (
          <>
            <input
              className={styles.inputEdicao}
              type={campo === "nascimento" ? "date" : campo === "telefone" ? "tel" : "text"}
              maxLength={campo === "endereco" ? 300 : 120}
              value={rascunho}
              placeholder={placeholder}
              onChange={(e) => setRascunho(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  salvarEdicao();
                }

                if (e.key === "Escape") {
                  cancelarEdicao();
                }
              }}
              autoFocus
            />

            <button
              type="button"
              className={styles.botaoIcone}
              onClick={salvarEdicao}
              aria-label="Confirmar alteração"
              title="Salvar"
            >
              <Check size={15} />
            </button>

            <button
              type="button"
              className={styles.botaoIcone}
              onClick={cancelarEdicao}
              aria-label="Cancelar alteração"
              title="Cancelar"
            >
              <X size={15} />
            </button>
          </>
        ) : (
          <>
            <span>{(campo === "nascimento" ? formatarNascimento(dados[campo]) : dados[campo]) || placeholder}</span>

            {!SOMENTE_LEITURA.includes(campo) && (
              <button
                type="button"
                className={styles.botaoIcone}
                onClick={() => iniciarEdicao(campo)}
                aria-label={`Editar ${placeholder}`}
                title={`Editar ${placeholder}`}
              >
                <Pencil size={14} />
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  // RENDERIZAR OPÇÕES DO QUESTIONÁRIO

  function renderizarOpcoes(
    campo: keyof Perguntas,
    opcoes: string[]
  ) {
    return (
      <div className={styles.opcoes}>
        {opcoes.map((opcao) => (
          <label key={opcao} className={styles.opcao}>
            <input
              type="radio"
              name={campo}
              value={opcao}
              checked={perguntas[campo] === opcao}
              onChange={() =>
                atualizarPergunta(campo, opcao)
              }
            />

            <span className={styles.radioVisual} />
            <span>{opcao}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* HEADER ORIGINAL DA ASTRO */}

      <Header />

      {/* CONTEÚDO DO PERFIL */}

      <main className={styles.pagina}>
        <div className={styles.container}>

          {/* LADO ESQUERDO - PERFIL PESSOAL */}

          <section className={styles.cartaoPerfil}>

            {/* FOTO E INFORMAÇÕES PRINCIPAIS */}

            <div className={styles.areaAvatar}>
              <div className={styles.avatarContainer}>

                <div className={styles.avatar}>
                  {foto ? (
                    <img
                      src={foto}
                      alt="Foto do Explorador"
                    />
                  ) : (
                    <UserRound
                      size={46}
                      strokeWidth={1.2}
                    />
                  )}
                </div>

                <label
                  className={styles.botaoFoto}
                  title="Alterar foto de perfil"
                >
                  <Camera size={17} />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={alterarFoto}
                    disabled={enviandoFoto}
                    className={styles.inputFoto}
                    aria-label="Alterar foto de perfil"
                  />
                </label>
              </div>

              <h1>{dados.nome || "Explorador"}</h1>

              <p className={styles.localizacao}>
                <MapPin
                  size={14}
                  aria-hidden="true"
                />
                {dados.endereco || "Endereço não informado"}
              </p>

              <p className={styles.membroDesde}>
                Explorador(a) desde 2026
              </p>

              <Link
                href="/dashboard-explorador"
                className={styles.botaoPainel}
              >
                Acessar Painel de Controle
              </Link>
            </div>

            {/* BIOGRAFIA */}

            <div className={styles.biografia}>
              {editando === "biografia" ? (
                <div className={styles.edicaoBiografia}>
                  <textarea
                    value={rascunho}
                    onChange={(e) =>
                      setRascunho(e.target.value)
                    }
                    placeholder="Sobre mim e minha motivação..."
                    maxLength={1000}
                    rows={4}
                    autoFocus
                  />

                  <div className={styles.acoesEdicao}>
                    <button
                      type="button"
                      onClick={salvarEdicao}
                    >
                      Salvar
                    </button>

                    <button
                      type="button"
                      onClick={cancelarEdicao}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.biografiaBotao}
                  onClick={() =>
                    iniciarEdicao("biografia")
                  }
                >
                  <span>
                    {dados.biografia ||
                      "Sobre mim e minha motivação..."}
                  </span>

                  <Pencil size={14} />
                </button>
              )}
            </div>

            {/* INFORMAÇÕES PESSOAIS */}

            <div className={styles.informacoes}>
              {renderizarCampo(
                "nome",
                "Nome completo"
              )}

              {renderizarCampo(
                "email",
                "E-mail"
              )}

              {renderizarCampo(
                "telefone",
                "Telefone"
              )}

              {renderizarCampo(
                "nascimento",
                "Nascimento"
              )}

              {renderizarCampo(
                "endereco",
                "Endereço"
              )}
            </div>
          </section>

          {/* LADO DIREITO - QUESTIONÁRIO */}

          <section className={styles.cartaoQuestionario}>
            <div className={styles.blocoPergunta}>
              <button
                type="button"
                className={styles.cabecalhoPergunta}
                onClick={() => alternarPergunta("moradia")}
                aria-expanded={perguntaAberta === "moradia"}
                aria-controls="opcoes-moradia"
              >
                <span>Tipo de moradia:</span>
                <ChevronDown size={19} className={perguntaAberta === "moradia" ? styles.setaAberta : styles.setaPergunta} />
              </button>
              {perguntaAberta === "moradia" && (
                <div id="opcoes-moradia" className={styles.conteudoPergunta}>
                  {renderizarOpcoes("moradia", ["Casa", "Apartamento", "Chácara / Sítio"])}
                </div>
              )}
            </div>

            <div className={styles.blocoPergunta}>
              <button
                type="button"
                className={styles.cabecalhoPergunta}
                onClick={() => alternarPergunta("condicao")}
                aria-expanded={perguntaAberta === "condicao"}
                aria-controls="opcoes-condicao"
              >
                <span>Condição de MSE (Posse do imóvel):</span>
                <ChevronDown size={19} className={perguntaAberta === "condicao" ? styles.setaAberta : styles.setaPergunta} />
              </button>
              {perguntaAberta === "condicao" && (
                <div id="opcoes-condicao" className={styles.conteudoPergunta}>
                  {renderizarOpcoes("condicao", [
                    "Imóvel próprio",
                    "Imóvel alugado (com permissão para pets)",
                  ])}
                </div>
              )}
            </div>

            <div className={styles.blocoPergunta}>
              <button
                type="button"
                className={styles.cabecalhoPergunta}
                onClick={() => alternarPergunta("protecao")}
                aria-expanded={perguntaAberta === "protecao"}
                aria-controls="opcoes-protecao"
              >
                <span>Proteção &amp; Telamento:</span>
                <ChevronDown size={19} className={perguntaAberta === "protecao" ? styles.setaAberta : styles.setaPergunta} />
              </button>
              {perguntaAberta === "protecao" && (
                <div id="opcoes-protecao" className={styles.conteudoPergunta}>
                  <div className={styles.grupoPergunta}>
                    <p>Possui Redes de Proteção em TODAS as janelas?</p>
                    {renderizarOpcoes("redes", ["Sim", "Em Instalação", "Não", "Sem janelas"])}
                  </div>
                  <div className={styles.grupoPergunta}>
                    <p>O quintal é totalmente murado/fechado?</p>
                    {renderizarOpcoes("quintal", ["Sim", "Não", "Sem Quintal"])}
                  </div>
                  <div className={styles.grupoPergunta}>
                    <p>O pet terá acesso livre à rua sem supervisão?</p>
                    {renderizarOpcoes("acessoRua", ["Sim", "Não"])}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.blocoPergunta}>
              <button type="button" className={styles.cabecalhoPergunta}
                onClick={() => alternarPergunta("tempo")}
                aria-expanded={perguntaAberta === "tempo"} aria-controls="opcoes-tempo">
                <span>Quanto tempo o pet passará sozinho:</span>
                <ChevronDown size={19} className={perguntaAberta === "tempo" ? styles.setaAberta : styles.setaPergunta} />
              </button>
              {perguntaAberta === "tempo" && (
                <div id="opcoes-tempo" className={styles.conteudoPergunta}>
                  <div className={styles.grupoPergunta}>
                    <p>Selecione o seu modelo de Trabalho:</p>
                    {renderizarOpcoes("modeloTrabalho", ["Presencial", "Híbrido", "Home-Office", "Desempregado(a)"])}
                  </div>
                  <div className={styles.grupoPergunta}>
                    <p>Quantas horas ele ficará sozinho?</p>
                    {renderizarOpcoes("tempoSozinho", ["Nunca", "De 2 a 4 horas", "De 4 a 8 horas", "Mais de 8 horas"])}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.blocoPergunta}>
              <button type="button" className={styles.cabecalhoPergunta}
                onClick={() => alternarPergunta("pessoas")}
                aria-expanded={perguntaAberta === "pessoas"} aria-controls="opcoes-pessoas">
                <span>Quantidade de pessoas na casa:</span>
                <ChevronDown size={19} className={perguntaAberta === "pessoas" ? styles.setaAberta : styles.setaPergunta} />
              </button>
              {perguntaAberta === "pessoas" && (
                <div id="opcoes-pessoas" className={styles.conteudoPergunta}>
                  <div className={styles.grupoPergunta}>
                    <p>Quantas pessoas moram na sua casa:</p>
                    {renderizarOpcoes("pessoasCasa", ["Moro sozinho(a)", "2 pessoas", "3 pessoas", "4 pessoas (ou mais)"])}
                  </div>
                  <div className={styles.grupoPergunta}>
                    <p>Todos os moradores estão de acordo com a adoção?</p>
                    {renderizarOpcoes("moradoresConcordam", ["Sim", "Não"])}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.blocoPergunta}>
              <button type="button" className={styles.cabecalhoPergunta}
                onClick={() => alternarPergunta("pets")}
                aria-expanded={perguntaAberta === "pets"} aria-controls="opcoes-pets">
                <span>Pets na residência:</span>
                <ChevronDown size={19} className={perguntaAberta === "pets" ? styles.setaAberta : styles.setaPergunta} />
              </button>
              {perguntaAberta === "pets" && (
                <div id="opcoes-pets" className={styles.conteudoPergunta}>
                  <div className={styles.grupoPergunta}>
                    <p>Existem outros Pets na residência?</p>
                    {renderizarOpcoes("petsResidencia", ["Sim", "Não"])}
                  </div>
                  {perguntas.petsResidencia === "Sim" && (
                    <div className={styles.grupoPergunta}>
                      <p>Selecione o(s) outro(s) Pets na residência:</p>
                      <div className={styles.opcoes}>
                        {["Cachorro", "Gato", "Pássaro", "Outro"].map((tipo) => (
                          <label key={tipo} className={styles.opcao}>
                            <input
                              type="checkbox"
                              name="tiposPets"
                              value={tipo}
                              checked={perguntas.tiposPets.includes(tipo)}
                              onChange={() => alternarTipoPet(tipo)}
                            />
                            <span className={styles.radioVisual} />
                            <span>{tipo}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.rodapeQuestionario}>
              <button type="button" className={styles.botaoSalvarQuestionario}
                onClick={salvarRespostas} disabled={salvandoQuestionario}>
                {salvandoQuestionario ? "Salvando..." : "Salvar"}
              </button>
              {avisoSalvo && <p className={styles.feedbackQuestionario} role="status">Respostas salvas! As ONGs verão este questionário nas suas solicitações de adoção.</p>}
            </div>
          </section>
        </div>

      </main>
    </>
  );
}
