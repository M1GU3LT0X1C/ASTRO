
"use client";

import { useState } from "react";
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
  petsResidencia: string;
};

const dadosIniciais: DadosPerfil = {
  nome: "Nome do Explorador",
  email: "emaildoexplorador@astro.com",
  telefone: "(81) 12345-6789",
  nascimento: "00 / 00 / 0000",
  endereco: "Rua, Cidade, Bairro, Estado",
  biografia: "",
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
  petsResidencia: "",
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

  function alternarPergunta(campo: Secao) {
    setPerguntaAberta((atual) => (atual === campo ? null : campo));
  }

  // INICIAR EDIÇÃO DE UM CAMPO

  function iniciarEdicao(campo: CampoEditavel) {
    setEditando(campo);
    setRascunho(dados[campo]);
  }

  // SALVAR EDIÇÃO LOCALMENTE

  function salvarEdicao() {
    if (!editando) return;

    setDados((anterior) => ({
      ...anterior,
      [editando]: rascunho,
    }));

    setEditando(null);
    setRascunho("");
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
    }));
  }

  // ALTERAR FOTO DE PERFIL

  function alterarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      alerta.aviso("Arquivo inválido", "Selecione um arquivo de imagem.");
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      alerta.aviso("Imagem muito grande", "Escolha uma imagem de até 5 MB.");
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      if (typeof leitor.result === "string") {
        setFoto(leitor.result);
      }
    };

    leitor.readAsDataURL(arquivo);
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
            <span>{dados[campo] || placeholder}</span>

            <button
              type="button"
              className={styles.botaoIcone}
              onClick={() => iniciarEdicao(campo)}
              aria-label={`Editar ${placeholder}`}
              title={`Editar ${placeholder}`}
            >
              <Pencil size={14} />
            </button>
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
                    className={styles.inputFoto}
                    aria-label="Alterar foto de perfil"
                  />
                </label>
              </div>

              <h1>{dados.nome}</h1>

              <p className={styles.localizacao}>
                <MapPin
                  size={14}
                  aria-hidden="true"
                />
                {dados.endereco}
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
                    {renderizarOpcoes("modeloTrabalho", ["Presencial", "Híbrido", "Home-office", "Desempregado(a)"])}
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
                  {renderizarOpcoes("pessoasCasa", ["1 pessoa", "2 pessoas", "3 pessoas", "4 pessoas", "5 ou mais pessoas"])}
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
                  {renderizarOpcoes("petsResidencia", ["Nenhum", "1 pet", "2 pets", "3 pets", "4 ou mais pets"])}
                </div>
              )}
            </div>

            <div className={styles.rodapeQuestionario}>
              <button type="button" className={styles.botaoSalvarQuestionario}
                onClick={() => { setPerguntaAberta(null); setAvisoSalvo(true); }}>
                Salvar
              </button>
              {avisoSalvo && <p className={styles.feedbackQuestionario} role="status">Respostas mantidas nesta pré-visualização.</p>}
            </div>
          </section>
        </div>

        {/* AVISO DE PRÉ-VISUALIZAÇÃO */}

        <p className={styles.aviso}>
          Pré-visualização: alterações mantidas apenas
          nesta página, sem salvamento no banco de dados.
        </p>
      </main>
    </>
  );
}
