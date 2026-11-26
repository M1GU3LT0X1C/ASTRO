"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./Cadastro.module.css";
import Carregamento from "@/components/carregamento/Carregamento";
import { alerta } from "@/lib/alerta";
import { traduzirErroAuth } from "@/lib/errosAuth";
import { acordarServidor } from "@/lib/api";
import { garantirOng, garantirTutor } from "@/lib/perfil";

type Perfil = "explorador" | "guardiao" | "base-estelar" | "estacao";
class EmailJaCadastradoError extends Error {}

type DadosIniciais = { nome: string; email: string; senha: string };

const UFS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

const NOMES_PERFIL: Record<Perfil, string> = {
  explorador: "Explorador",
  guardiao: "Guardião de Órbita",
  "base-estelar": "Base Estelar",
  estacao: "Estação de Cuidado",
};

const SUBTITULOS_PERFIL: Record<Perfil, string> = {
  explorador: "Você poderá adotar pets, salvar favoritos e encontrar clínicas parceiras.",
  guardiao: "Você poderá cadastrar pets resgatados para adoção e gerenciar seus acolhimentos.",
  "base-estelar": "Você poderá cadastrar pets para adoção e gerenciar sua Base Estelar.",
  estacao: "Você poderá divulgar seus serviços veterinários, cupons e atender tutores e ONGs.",
};

// Algoritmo oficial da Receita Federal para validação de CPF (Módulo 11)
function validarCPF(valor: string): boolean {
  const cpf = valor.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(cpf[10]);
}

// Algoritmo oficial da Receita Federal para validação de CNPJ (Módulo 11)
function validarCNPJ(valor: string): boolean {
  const cnpj = valor.replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcularDigito = (base: string, pesos: number[]) => {
    const soma = pesos.reduce((acc, peso, i) => acc + Number(base[i]) * peso, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const digito1 = calcularDigito(cnpj.slice(0, 12), pesos1);
  if (digito1 !== Number(cnpj[12])) return false;

  const digito2 = calcularDigito(cnpj.slice(0, 13), pesos2);
  return digito2 === Number(cnpj[13]);
}

function validarNumeroCRMV(valor: string): boolean {
  const limpo = valor.trim().toUpperCase();
  return /^\d{3,7}(-?PJ)?$/.test(limpo) && !/^0+$/.test(limpo.replace(/\D/g, ""));
}

function IconeOlhoAberto() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a0b5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconeOlhoFechado() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a0b5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.53 9.53a3 3 0 1 0 4.24 4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function gravarCookiePerfil(perfil: string) {
  if (typeof document === "undefined") return;
  document.cookie = `astro_perfil_pendente=${encodeURIComponent(perfil)}; path=/; max-age=900; SameSite=Lax`;
}

const RESUMO_TERMOS_MODAL: { numero: string; titulo: string; texto: string }[] = [
  {
    numero: "01",
    titulo: "Escopo da plataforma Astro",
    texto: "O Astro conecta adotantes, ONGs, protetores independentes e clínicas veterinárias parceiras. A plataforma é um hub de intermediação e não realiza resgate físico, transporte ou atendimento veterinário direto.",
  },
  {
    numero: "02",
    titulo: "Restrição etária (+18 anos)",
    texto: "O cadastro e as solicitações de adoção são exclusivos para maiores de 18 anos completos ou representantes autorizados de instituições. Contas de menores de 18 anos serão bloqueadas.",
  },
  {
    numero: "03",
    titulo: "Conta única por e-mail e segurança",
    texto: "Cada endereço de e-mail pode estar vinculado a apenas um perfil (Explorador, Guardião, Base Estelar ou Estação de Cuidado). As credenciais são pessoais e intransferíveis.",
  },
  {
    numero: "04",
    titulo: "Adoção 100% gratuita e responsável",
    texto: "É estritamente proibida a venda ou comercialização de animais. A triagem, entrevista, visita ao lar e entrega do pet são conduzidas pela ONG ou protetor responsável.",
  },
  {
    numero: "05",
    titulo: "Estações de Cuidado, cupons e conduta",
    texto: "Cupons e serviços veterinários são de responsabilidade das clínicas parceiras. É vedado publicar informações falsas, trotes ou conteúdo ilegal, sob pena de exclusão da conta (Lei nº 9.605/1998 e Lei nº 14.064/2020).",
  },
];

const RESUMO_PRIVACIDADE_MODAL: { numero: string; titulo: string; texto: string }[] = [
  {
    numero: "01",
    titulo: "Compromisso com a LGPD",
    texto: "Tratamos seus dados conforme a LGPD (Lei nº 13.709/2018) e o Marco Civil da Internet. Nunca vendemos nem alugamos suas informações pessoais.",
  },
  {
    numero: "02",
    titulo: "Dados coletados no cadastro",
    texto: "Coletamos apenas o essencial para o seu perfil: nome/razão social, e-mail, telefone, CEP, CPF/CNPJ (e CRMV para clínicas), além das fotos e informações que você optar por cadastrar.",
  },
  {
    numero: "03",
    titulo: "Uso do CEP e geolocalização",
    texto: "Seu CEP ou localização aproximada serve exclusivamente para exibir pets disponíveis, ONGs e clínicas próximas a você.",
  },
  {
    numero: "04",
    titulo: "Segurança e infraestrutura",
    texto: "Utilizamos autenticação segura via Supabase, comunicação criptografada HTTPS e controle de acesso por perfil (Row Level Security).",
  },
  {
    numero: "05",
    titulo: "Seus direitos (Art. 18 da LGPD)",
    texto: "Você pode consultar, corrigir ou solicitar a exclusão dos seus dados diretamente nas configurações da conta ou pelo e-mail contato@astropets.com.br.",
  },
];

export function Cadastro() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [perfilSelecionado, setPerfilSelecionado] = useState<Perfil | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [cep, setCep] = useState("");
  const [telefone, setTelefone] = useState("");
  const [documento, setDocumento] = useState("");
  const [crmvUf, setCrmvUf] = useState("SP");
  const [crmvNumero, setCrmvNumero] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [instagram, setInstagram] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [modalLegal, setModalLegal] = useState<"termos" | "privacidade" | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Estados de consulta na Receita Federal (CNPJ) e CEP (BrasilAPI)
  const [statusCnpjApi, setStatusCnpjApi] = useState<{
    estado: "idle" | "loading" | "ok" | "erro";
    mensagem: string;
  }>({ estado: "idle", mensagem: "" });

  const [statusCepApi, setStatusCepApi] = useState<{
    estado: "idle" | "loading" | "ok" | "erro";
    mensagem: string;
  }>({ estado: "idle", mensagem: "" });

  // trava síncrona: o estado "carregando" só chega ao botão no próximo render, um clique duplo rápido passaria
  const enviando = useRef(false);

  function maskCPF(v: string) {
    return v.replace(/\D/g, "").slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  function maskCNPJ(v: string) {
    return v.replace(/\D/g, "").slice(0, 14)
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  function maskPhone(v: string) {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 10) return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  }
  function maskCEP(v: string) {
    return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
  }
  function maskCRMV(v: string) {
    const limpo = v.toUpperCase().replace(/[^0-9PJ-]/g, "");
    const numeros = limpo.replace(/\D/g, "").slice(0, 7);
    const temPJ = limpo.includes("P") || limpo.includes("J");
    return numeros ? `${numeros}${temPJ ? "-PJ" : ""}` : "";
  }

  function handleDocumento(v: string) {
    const clean = v.replace(/\D/g, "");
    if (perfilSelecionado === "base-estelar") {
      setDocumento(maskCNPJ(clean));
    } else if (perfilSelecionado === "estacao") {
      setDocumento(clean.length <= 11 ? maskCPF(clean) : maskCNPJ(clean));
    } else {
      setDocumento(maskCPF(clean));
    }
    const aceitaCnpj = perfilSelecionado === "base-estelar" || perfilSelecionado === "estacao";
    if (!aceitaCnpj || clean.length !== 14 || !validarCNPJ(clean)) {
      setStatusCnpjApi({ estado: "idle", mensagem: "" });
    } else {
      setStatusCnpjApi({
        estado: "loading",
        mensagem: "Consultando CNPJ na Receita Federal...",
      });
    }
  }

  function handleCepInput(v: string) {
    const mascarado = maskCEP(v);
    setCep(mascarado);
    const digitos = mascarado.replace(/\D/g, "");
    if (digitos.length !== 8) {
      setStatusCepApi({ estado: "idle", mensagem: "" });
    } else {
      setStatusCepApi({ estado: "loading", mensagem: "Verificando CEP..." });
    }
  }

  // Consulta automática do CNPJ na Receita Federal via BrasilAPI quando tem 14 dígitos matematicamente válidos
  useEffect(() => {
    const digitos = documento.replace(/\D/g, "");
    const aceitaCnpj = perfilSelecionado === "base-estelar" || perfilSelecionado === "estacao";
    if (!aceitaCnpj || digitos.length !== 14 || !validarCNPJ(digitos)) {
      return;
    }

    let ativo = true;

    fetch(`https://brasilapi.com.br/api/cnpj/v1/${digitos}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("CNPJ não localizado na base da Receita Federal.");
        return res.json();
      })
      .then((dados) => {
        if (!ativo) return;
        const razao = dados.nome_fantasia || dados.razao_social || "Empresa localizada";
        const situacao = String(dados.descricao_situacao_cadastral || "").toUpperCase();
        const ativa = dados.situacao_cadastral === 2 || situacao === "ATIVA";

        if (!ativa && situacao) {
          setStatusCnpjApi({
            estado: "erro",
            mensagem: `✕ CNPJ consta como ${situacao} na Receita Federal (${razao}).`,
          });
          return;
        }

        setStatusCnpjApi({
          estado: "ok",
          mensagem: `✓ CNPJ ativo na Receita Federal: ${razao}`,
        });

        if (dados.cep) {
          setCep((atual) => (atual.replace(/\D/g, "").length === 8 ? atual : maskCEP(String(dados.cep))));
        }
        if (dados.uf && UFS_BRASIL.includes(dados.uf)) {
          setCrmvUf(dados.uf);
        }
      })
      .catch(() => {
        if (!ativo) return;
        setStatusCnpjApi({
          estado: "erro",
          mensagem: "✕ CNPJ não encontrado na Receita Federal. Verifique os números digitados.",
        });
      });

    return () => {
      ativo = false;
    };
  }, [documento, perfilSelecionado]);

  // Consulta automática de CEP via BrasilAPI
  useEffect(() => {
    const digitos = cep.replace(/\D/g, "");
    if (digitos.length !== 8) {
      return;
    }

    let ativo = true;

    fetch(`https://brasilapi.com.br/api/cep/v1/${digitos}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("CEP não encontrado");
        return res.json();
      })
      .then((dados) => {
        if (!ativo) return;
        const local = [dados.neighborhood, dados.city && `${dados.city} - ${dados.state}`]
          .filter(Boolean)
          .join(", ");
        setStatusCepApi({
          estado: "ok",
          mensagem: `✓ CEP válido: ${local}`,
        });
      })
      .catch(() => {
        if (!ativo) return;
        setStatusCepApi({
          estado: "erro",
          mensagem: "✕ CEP não encontrado. Confira os 8 dígitos.",
        });
      });

    return () => {
      ativo = false;
    };
  }, [cep]);

  const checks = {
    length: senha.length >= 8 && senha.length <= 18,
    upper: /[A-Z]/.test(senha),
    lower: /[a-z]/.test(senha),
    number: /[0-9]/.test(senha),
    special: /[@$!%*?&._-]/.test(senha),
  };
  const senhaForca = Object.values(checks).filter(Boolean).length;
  const senhaOk = senhaForca === 5;
  const confirmOk = confirmarSenha !== "" && senha === confirmarSenha && senha.length <= 18;

  const isOng = perfilSelecionado === "base-estelar";
  const isGuardiao = perfilSelecionado === "guardiao";
  const isEstacao = perfilSelecionado === "estacao";
  const isExplorador = perfilSelecionado === "explorador";
  const isPessoaFisica = isExplorador || isGuardiao;

  // Validação do documento (CPF ou CNPJ) conforme o perfil escolhido
  const docDigitos = documento.replace(/\D/g, "");
  const docValidoMatematicamente = isPessoaFisica
    ? validarCPF(docDigitos)
    : isOng
    ? validarCNPJ(docDigitos)
    : isEstacao
    ? docDigitos.length <= 11
      ? validarCPF(docDigitos)
      : validarCNPJ(docDigitos)
    : false;

  const docOk =
    docValidoMatematicamente &&
    statusCnpjApi.estado !== "erro" &&
    statusCnpjApi.estado !== "loading";

  const crmvOk = !isEstacao || (Boolean(crmvUf) && validarNumeroCRMV(crmvNumero));
  const cepOk = cep.replace(/\D/g, "").length === 8 && statusCepApi.estado !== "erro";
  const telefoneOk = telefone.replace(/\D/g, "").length >= 10;

  useEffect(() => {
    acordarServidor(); // o back no Render pode estar dormindo; vai subindo enquanto a pessoa preenche
    const dadosSalvos = sessionStorage.getItem("astroCadastroInicial");
    if (!dadosSalvos) return;
    queueMicrotask(() => {
      try {
        const dados: DadosIniciais = JSON.parse(dadosSalvos);
        setNome(dados.nome ?? "");
        setEmail(dados.email ?? "");
        setSenha(dados.senha ?? "");
      } catch {
        sessionStorage.removeItem("astroCadastroInicial");
      }
    });
  }, []);

  useEffect(() => {
    if (!modalLegal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalLegal(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalLegal]);

  function selecionarPerfil(perfil: Perfil) {
    setPerfilSelecionado(perfil);
    setDocumento("");
    setStatusCnpjApi({ estado: "idle", mensagem: "" });
    setEtapa(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finalizarCadastro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!perfilSelecionado) return;

    if (!docValidoMatematicamente) {
      alerta.aviso(
        isPessoaFisica ? "CPF inválido" : "Documento inválido",
        isPessoaFisica
          ? "Informe um CPF válido com 11 dígitos."
          : isOng
          ? "Informe um CNPJ válido com 14 dígitos."
          : "Informe um CNPJ ou CPF válido."
      );
      return;
    }

    if (statusCnpjApi.estado === "erro") {
      alerta.aviso("CNPJ inválido na Receita Federal", statusCnpjApi.mensagem);
      return;
    }

    if (isEstacao && !crmvOk) {
      alerta.aviso(
        "CRMV inválido",
        "Informe a UF e o número de registro ativo no CRMV (ex.: 12345 ou 12345-PJ)."
      );
      return;
    }

    if (!telefoneOk) {
      alerta.aviso("Telefone incompleto", "Informe um telefone com DDD.");
      return;
    }

    if (!cepOk) {
      alerta.aviso("CEP inválido", "Informe um CEP válido de 8 dígitos.");
      return;
    }

    if (!senhaOk) { setErroSenha("Sua senha precisa cumprir todos os requisitos"); return; }
    if (senha !== confirmarSenha) { setErroSenha("As senhas não coincidem!"); return; }
    const ehPessoaFisica = perfilSelecionado === "explorador" || perfilSelecionado === "guardiao";
    if (!aceitouTermos) {
      alerta.aviso(
        "Aceite os termos para continuar",
        ehPessoaFisica
          ? "Confirme que você tem 18 anos ou mais e que aceita os Termos de Uso e a Política de Privacidade."
          : "Confirme que você leu e aceita os Termos de Uso e a Política de Privacidade para cadastrar a instituição."
      );
      return;
    }
    if (enviando.current) return;
    enviando.current = true;
    setCarregando(true);
    try {
      const ehOng = perfilSelecionado !== "explorador";
      const crmvFormatado = isEstacao ? `CRMV-${crmvUf} ${crmvNumero.trim()}` : undefined;
      const partesDescricao = [
        perfilSelecionado,
        crmvFormatado ? `| ${crmvFormatado}` : "",
        responsavel ? `| Resp:${responsavel}` : "",
        instagram ? `| IG:${instagram}` : "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      // os registros em "usuarios" e "ongs" são criados pelo trigger do banco a partir destes dados
      // (Astro-Back-end/sql/002_trigger_perfil_no_cadastro.sql), junto com o usuário de login
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            nome: nome.trim(),
            perfil: perfilSelecionado,
            telefone,
            cep,
            documento,
            ...(crmvFormatado && { crmv: crmvFormatado }),
            ...(ehOng && {
              descricao: partesDescricao,
            }),
          },
        },
      });
      // com "Confirm email" desligado, o Supabase devolve erro para e-mail repetido
      if (authError?.code === "user_already_exists") throw new EmailJaCadastradoError();
      // a conta (e o perfil) já foram criados; só o e-mail de confirmação não saiu
      if (authError?.code === "over_email_send_rate_limit") {
        sessionStorage.removeItem("astroCadastroInicial");
        await alerta.aviso("Conta criada, mas o e-mail não foi enviado", "Atingimos o limite de envio de e-mails. Aguarde alguns minutos e use \"Esqueci minha senha\" no login para receber um novo link.");
        router.push("/login");
        return;
      }
      if (authError) throw authError;
      // com "Confirm email" ligado, ele NÃO dá erro (para não revelar quais e-mails existem):
      // devolve um usuário falso, sem identidades, e a senha não é criada
      if (authData.user && authData.user.identities?.length === 0) throw new EmailJaCadastradoError();
      if (!authData.user) throw new Error("Erro ao criar usuário");

      localStorage.setItem("tipo_usuario", perfilSelecionado);
      localStorage.setItem("pessoa_nome", nome.trim());
      if (ehOng) localStorage.setItem("ong_nome", nome.trim());
      sessionStorage.removeItem("astroCadastroInicial");

      // sem sessão = o projeto exige confirmar o e-mail antes do primeiro login
      if (!authData.session) {
        await alerta.sucesso("Conta criada!", `Enviamos um link de confirmação para ${email}. Confirme e depois faça login.`);
        router.push("/login");
        return;
      }

      if (ehOng) {
        await garantirOng(nome.trim() || "Minha ONG", perfilSelecionado).catch(() => null);
      } else {
        await garantirTutor(nome.trim() || "Explorador").catch(() => null);
      }

      router.push(
        perfilSelecionado === "estacao"
          ? "/dashboard-clinica"
          : ehOng
          ? "/dashboard"
          : "/dashboard-explorador"
      );
    } catch (err: unknown) {
      // só libera o botão em caso de erro; no sucesso ele fica travado até a página trocar
      enviando.current = false;
      setCarregando(false);
      if (err instanceof EmailJaCadastradoError) {
        const irParaLogin = await alerta.confirmar({
          icon: "info",
          title: "Este e-mail já foi utilizado",
          text: "Só é permitido criar uma única conta por e-mail. Entre na sua conta existente na página de login ou use \"Esqueci minha senha\".",
          cancelText: "Continuar aqui", confirmText: "Ir para o login",
        });
        if (irParaLogin) router.push("/login");
      } else {
        const msg = err instanceof Error ? err.message : "Erro ao cadastrar";
        alerta.erro("Não foi possível cadastrar", traduzirErroAuth(msg));
      }
    }
  }

  async function handleGoogleCadastro() {
    if (!perfilSelecionado) { alerta.aviso("Escolha um perfil primeiro", "Selecione como você vai orbitar com a gente."); return; }
    const ehPessoaFisica = perfilSelecionado === "explorador" || perfilSelecionado === "guardiao";
    if (!aceitouTermos) {
      alerta.aviso(
        "Aceite os termos para continuar",
        ehPessoaFisica
          ? "Confirme que você tem 18 anos ou mais e que aceita os Termos de Uso e a Política de Privacidade antes de continuar com o Google."
          : "Confirme que você leu e aceita os Termos de Uso e a Política de Privacidade antes de continuar com o Google."
      );
      return;
    }
    localStorage.removeItem("astro_reset_pendente");
    document.cookie = "astro_reset_pendente=; path=/; max-age=0; SameSite=Lax";
    localStorage.setItem("astro_google_login", "true");
    localStorage.setItem("astro_origem_google", "cadastro");
    document.cookie = "astro_origem_google=cadastro; path=/; max-age=900; SameSite=Lax";
    localStorage.setItem("astro_perfil_pendente", perfilSelecionado);
    localStorage.setItem("tipo_usuario", perfilSelecionado);
    if (nome.trim() && perfilSelecionado !== "explorador") {
      localStorage.setItem("temp_ong_nome", nome.trim());
    }
    gravarCookiePerfil(perfilSelecionado);

    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: "google", 
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      } 
    });
    if (error) alerta.erro("Não foi possível continuar com o Google", traduzirErroAuth(error.message));
  }

  const nomePerfilExibicao = perfilSelecionado ? NOMES_PERFIL[perfilSelecionado] : "";
  const subtituloPerfilExibicao = perfilSelecionado ? SUBTITULOS_PERFIL[perfilSelecionado] : "";
  const placeholderDoc = isOng
    ? "CNPJ - 00.000.000/0000-00"
    : isEstacao
    ? "CNPJ (00.000.000/0000-00) ou CPF"
    : "CPF - 000.000.000-00";

  return (
    <main className={styles.cadastro}>
      <section className={styles.conteudo}>
        {etapa === 1 && (
          <>
            <div className={styles.introducao}>
              <h1>Que bom ter você por aqui! Agradecemos imensamente por escolher o Astro para fazer parte da sua jornada e iluminar ainda mais a causa animal.</h1>
              <p>Para começarmos, como você pretende orbitar com a gente?</p>
              <span className={styles.dicaScroll}>Arraste para o lado →</span>
            </div>
            <div className={styles.perfis}>
              <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "explorador" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("explorador")}><img src={perfilSelecionado === "explorador" ? "/cadastro/explorador-rosa.svg" : "/cadastro/explorador-azul.svg"} alt="" className={styles.perfilIcone} /><h2>Explorador</h2><p>Quero <strong>adotar</strong> um pet ou encontrar clínicas parceiras.</p><span className={styles.tag}>Tutor / Adotante</span></button>
              <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "guardiao" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("guardiao")}><img src={perfilSelecionado === "guardiao" ? "/cadastro/guardiao-rosa.svg" : "/cadastro/guardiao-azul.svg"} alt="" className={styles.perfilIcone} /><h2>Guardião de Órbita</h2><p>Sou protetor(a) independente e realizo resgates e lares temporários.</p><span className={styles.tag}>Protetor Independente</span></button>
              <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "base-estelar" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("base-estelar")}><img src={perfilSelecionado === "base-estelar" ? "/cadastro/base-estelar-rosa.svg" : "/cadastro/base-estelar-azul.svg"} alt="" className={styles.perfilIcone} /><h2>Base Estelar</h2><p>Sou uma <strong>ONG ou abrigo</strong> estruturado de proteção animal.</p><span className={styles.tag}>ONG / Abrigo</span></button>
              <button type="button" className={`${styles.perfilCard} ${perfilSelecionado === "estacao" ? styles.perfilSelecionado : ""}`} onClick={() => selecionarPerfil("estacao")}><img src={perfilSelecionado === "estacao" ? "/cadastro/estacao-rosa.svg" : "/cadastro/estacao-azul.svg"} alt="" className={styles.perfilIcone} /><h2>Estação de Cuidado</h2><p>Sou uma <strong>clínica, hospital</strong> ou profissional de saúde animal.</p><span className={styles.tag}>Clínica / Vet</span></button>
            </div>
            <div className={styles.dots}><span></span><span></span><span></span><span></span></div>
          </>
        )}

        {etapa === 2 && perfilSelecionado && (
          <>
            <button className={styles.voltar} onClick={() => setEtapa(1)}>← Voltar</button>
            <div className={styles.introducao}>
              <h1>Criando sua conta de <span style={{color:'#e63d68'}}>{nomePerfilExibicao}</span></h1>
              <p>{subtituloPerfilExibicao}</p>
            </div>

            <form className={styles.formulario} onSubmit={finalizarCadastro}>
              <input type="text" placeholder={isOng ? "Nome da ONG / Abrigo" : isEstacao ? "Nome da Clínica / Consultório" : "Seu nome completo"} className={styles.inputGrande} value={nome} onChange={(e) => setNome(e.target.value)} required />
              <input type="email" placeholder="E-mail principal" className={styles.inputGrande} value={email} onChange={(e) => setEmail(e.target.value)} required />

              <div className={styles.linhaInputs}>
                <input
                  type="text"
                  placeholder={placeholderDoc}
                  className={`${styles.inputMetade} ${
                    docDigitos.length > 0
                      ? docOk
                        ? styles.inputOk
                        : styles.inputErro
                      : ""
                  }`}
                  value={documento}
                  onChange={(e) => handleDocumento(e.target.value)}
                  required
                />
                <input type="text" placeholder="Telefone (11) 99999-9999" className={styles.inputMetade} value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} required />
              </div>

              {docDigitos.length > 0 && !docValidoMatematicamente && (
                <div className={`${styles.statusValidacao} ${styles.statusErro}`}>
                  {isPessoaFisica
                    ? "✕ CPF inválido. Confira os 11 números digitados."
                    : isOng
                    ? "✕ CNPJ inválido. Confira os 14 números digitados."
                    : docDigitos.length <= 11
                    ? "✕ CPF inválido. Confira os 11 números ou digite os 14 dígitos do CNPJ."
                    : "✕ CNPJ inválido. Confira os 14 números digitados."}
                </div>
              )}

              {docValidoMatematicamente && docDigitos.length === 11 && (
                <div className={`${styles.statusValidacao} ${styles.statusOk}`}>
                  ✓ CPF válido
                </div>
              )}

              {statusCnpjApi.estado !== "idle" && (
                <div
                  className={`${styles.statusValidacao} ${
                    statusCnpjApi.estado === "ok"
                      ? styles.statusOk
                      : statusCnpjApi.estado === "erro"
                      ? styles.statusErro
                      : styles.statusCarregando
                  }`}
                >
                  {statusCnpjApi.mensagem}
                </div>
              )}

              {isEstacao && (
                <>
                  <div className={styles.linhaCrmv}>
                    <div className={styles.selectUfWrapper}>
                      <select
                        className={styles.selectBonito}
                        value={crmvUf}
                        onChange={(e) => setCrmvUf(e.target.value)}
                        aria-label="Estado (UF) do CRMV"
                      >
                        {UFS_BRASIL.map((uf) => (
                          <option key={uf} value={uf}>
                            CRMV-{uf}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Nº do CRMV (ex.: 12345 ou 12345-PJ)"
                      className={`${styles.inputMetade} ${
                        crmvNumero.length > 0
                          ? crmvOk
                            ? styles.inputOk
                            : styles.inputErro
                          : ""
                      }`}
                      value={crmvNumero}
                      onChange={(e) => setCrmvNumero(maskCRMV(e.target.value))}
                      required
                    />
                  </div>

                  {crmvNumero.length > 0 && (
                    <div
                      className={`${styles.statusValidacao} ${
                        crmvOk ? styles.statusOk : styles.statusErro
                      }`}
                    >
                      {crmvOk
                        ? `✓ Registro formatado: CRMV-${crmvUf} ${crmvNumero}`
                        : "✕ Informe de 3 a 7 dígitos numéricos para o CRMV (opcional -PJ no final)."}
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Nome do(a) Médico(a) Veterinário(a) Responsável Técnico(a)"
                    className={styles.inputGrande}
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    required
                  />
                </>
              )}

              {isOng && (
                <>
                  <input type="text" placeholder="Nome do responsável" className={styles.inputGrande} value={responsavel} onChange={(e) => setResponsavel(e.target.value)} required />
                  <input type="text" placeholder="Instagram da ONG @" className={styles.inputGrande} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                </>
              )}

              <div className={styles.linhaInputs}>
                <div className={styles.inputComOlho}>
                  <input type={mostrarSenha ? "text" : "password"} placeholder="Senha" maxLength={18} className={`${styles.inputSenha} ${senha.length > 0 ? (senhaOk ? styles.inputOk : styles.inputErro) : ''}`} value={senha} onChange={(e) => { setSenha(e.target.value); setErroSenha(""); }} required />
                  <button type="button" className={styles.botaoOlho} onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? <IconeOlhoAberto /> : <IconeOlhoFechado />}</button>
                </div>
                <div className={styles.inputComOlho}>
                  <input type={mostrarConfirmar ? "text" : "password"} placeholder="Confirmar senha" maxLength={18} className={`${styles.inputSenha} ${confirmarSenha.length > 0 ? (confirmOk ? styles.inputOk : styles.inputErro) : ''}`} value={confirmarSenha} onChange={(e) => { setConfirmarSenha(e.target.value); setErroSenha(""); }} required />
                  <button type="button" className={styles.botaoOlho} onClick={() => setMostrarConfirmar(!mostrarConfirmar)}>{mostrarConfirmar ? <IconeOlhoAberto /> : <IconeOlhoFechado />}</button>
                </div>
              </div>

              {(senha.length > 0 || confirmarSenha.length > 0) && (
                <div className={styles.senhaChecklist}>
                  <div className={styles.forcaBarra}><div className={styles.forcaPreenchimento} style={{ width: `${senhaForca * 20}%`, background: senhaForca < 3 ? '#e63d68' : senhaForca < 5 ? '#f0a500' : '#1ab86e' }}></div></div>
                  <p className={checks.length ? styles.checkOk : styles.checkErro}>• 8 a 18 caracteres</p>
                  <p className={checks.upper ? styles.checkOk : styles.checkErro}>• Letra maiúscula (A-Z)</p>
                  <p className={checks.lower ? styles.checkOk : styles.checkErro}>• Letra minúscula (a-z)</p>
                  <p className={checks.number ? styles.checkOk : styles.checkErro}>• Número (0-9)</p>
                  <p className={checks.special ? styles.checkOk : styles.checkErro}>• Caractere especial (@ $ ! % * ? &)</p>
                  {confirmarSenha.length > 0 && <p className={confirmOk ? styles.checkOk : styles.checkErro}>• {confirmOk ? "Senhas iguais ✓" : "Senhas não coincidem"}</p>}
                </div>
              )}

              {erroSenha && <span className={styles.erroSenha}>{erroSenha}</span>}
              <input
                type="text"
                placeholder="CEP - 00000-000"
                className={`${styles.inputGrande} ${
                  cep.replace(/\D/g, "").length > 0
                    ? cepOk
                      ? styles.inputOk
                      : styles.inputErro
                    : ""
                }`}
                value={cep}
                onChange={(e) => handleCepInput(e.target.value)}
                required
              />

              {statusCepApi.estado !== "idle" && (
                <div
                  className={`${styles.statusValidacao} ${
                    statusCepApi.estado === "ok"
                      ? styles.statusOk
                      : statusCepApi.estado === "erro"
                      ? styles.statusErro
                      : styles.statusCarregando
                  }`}
                >
                  {statusCepApi.mensagem}
                </div>
              )}

              <label className={styles.termoLabel}>
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  className={styles.termoCheckbox}
                  required
                />
                <span className={styles.termoTexto}>
                  {isPessoaFisica ? (
                    <>
                      Declaro ter <strong>18 anos ou mais</strong> e que li e aceito os{" "}
                    </>
                  ) : (
                    <>
                      Declaro ser responsável autorizado(a) pela instituição e que li e aceito os{" "}
                    </>
                  )}
                  <button
                    type="button"
                    className={styles.termoLinkBotao}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setModalLegal("termos");
                    }}
                  >
                    Termos de Uso
                  </button>{" "}
                  e a{" "}
                  <button
                    type="button"
                    className={styles.termoLinkBotao}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setModalLegal("privacidade");
                    }}
                  >
                    Política de Privacidade
                  </button>{" "}
                  do Astro.
                </span>
              </label>

              {carregando && <Carregamento titulo="Preparando sua conta..." descricao="Estamos processando seu cadastro. A inicialização do servidor pode levar alguns instantes. Aguarde sem reenviar." />}
              <button
                type="submit"
                className={styles.botaoContinuar}
                disabled={carregando || !senhaOk || !confirmOk || !aceitouTermos || !docOk || !crmvOk || !cepOk}
              >
                {carregando ? "Criando conta..." : `Criar conta de ${nomePerfilExibicao}`}
              </button>

              <div className={styles.divisor}>ou</div>
              <button type="button" className={styles.botaoGoogle} onClick={handleGoogleCadastro} disabled={carregando}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="20" alt="" /> Continuar com Google
              </button>
            </form>
          </>
        )}
      </section>

      {modalLegal && (
        <div
          className={styles.modalLegalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-legal-titulo"
          onClick={() => setModalLegal(null)}
        >
          <div
            className={styles.modalLegalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalLegalTopo}>
              <div>
                <span className={styles.modalLegalBadge}>Leitura rápida • AstroPets</span>
                <h2 id="modal-legal-titulo">
                  {modalLegal === "termos" ? "Termos de Uso" : "Política de Privacidade"}
                </h2>
              </div>
              <button
                type="button"
                className={styles.modalLegalFechar}
                onClick={() => setModalLegal(null)}
                aria-label="Fechar leitura dos termos"
              >
                ×
              </button>
            </div>

            <div className={styles.modalLegalAbas} role="tablist" aria-label="Documentos legais">
              <button
                type="button"
                role="tab"
                aria-selected={modalLegal === "termos"}
                className={`${styles.modalLegalAba} ${modalLegal === "termos" ? styles.modalLegalAbaAtiva : ""}`}
                onClick={() => setModalLegal("termos")}
              >
                Termos de Uso
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modalLegal === "privacidade"}
                className={`${styles.modalLegalAba} ${modalLegal === "privacidade" ? styles.modalLegalAbaAtiva : ""}`}
                onClick={() => setModalLegal("privacidade")}
              >
                Política de Privacidade
              </button>
            </div>

            <div className={styles.modalLegalCorpo}>
              {(modalLegal === "termos" ? RESUMO_TERMOS_MODAL : RESUMO_PRIVACIDADE_MODAL).map((item) => (
                <article key={item.numero} className={styles.modalLegalSecao}>
                  <div className={styles.modalLegalSecaoTitulo}>
                    <span className={styles.modalLegalNum}>{item.numero}</span>
                    <h3>{item.titulo}</h3>
                  </div>
                  <p>{item.texto}</p>
                </article>
              ))}
              <p className={styles.modalLegalNotaCompleta}>
                Quer consultar o texto jurídico completo?{" "}
                <Link
                  href={modalLegal === "termos" ? "/termos-de-uso" : "/politica-de-privacidade"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.termoLink}
                >
                  Abrir página completa
                </Link>
              </p>
            </div>

            <div className={styles.modalLegalRodape}>
              <button
                type="button"
                className={styles.modalLegalBtnSecundario}
                onClick={() => setModalLegal(null)}
              >
                Fechar
              </button>
              <button
                type="button"
                className={styles.modalLegalBtnPrimario}
                onClick={() => {
                  setAceitouTermos(true);
                  setModalLegal(null);
                }}
              >
                Li e aceito
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
