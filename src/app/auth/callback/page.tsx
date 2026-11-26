"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buscarMe, garantirOng, garantirTutor } from "@/lib/perfil";
import { acordarServidor } from "@/lib/api";
import { alerta } from "@/lib/alerta";
import { traduzirErroAuth } from "@/lib/errosAuth";
import type { User } from "@supabase/supabase-js";

type PerfilOpcao = "explorador" | "guardiao" | "base-estelar" | "estacao";

const OPCOES_PERFIL: {
  id: PerfilOpcao;
  titulo: string;
  subtitulo: string;
  icone: string;
}[] = [
  {
    id: "explorador",
    titulo: "Explorador",
    subtitulo: "Tutor / Adotante — Adotar pets e encontrar clínicas",
    icone: "/cadastro/explorador-rosa.svg",
  },
  {
    id: "guardiao",
    titulo: "Guardião de Órbita",
    subtitulo: "Protetor Independente — Resgates e lares temporários",
    icone: "/cadastro/guardiao-rosa.svg",
  },
  {
    id: "base-estelar",
    titulo: "Base Estelar",
    subtitulo: "ONG / Abrigo — Cadastrar pets e gerenciar abrigo",
    icone: "/cadastro/base-estelar-rosa.svg",
  },
  {
    id: "estacao",
    titulo: "Estação de Cuidado",
    subtitulo: "Clínica / Vet — Serviços veterinários e cupons",
    icone: "/cadastro/estacao-rosa.svg",
  },
];

function lerCookie(nome: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function limparCookie(nome: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${nome}=; path=/; max-age=0; SameSite=Lax`;
}

function lerCookiePerfil(): string | null {
  return lerCookie("astro_perfil_pendente");
}

function limparCookiePerfil() {
  limparCookie("astro_perfil_pendente");
}

function limparEstadoAuxiliarGoogle() {
  localStorage.removeItem("astro_google_login");
  localStorage.removeItem("astro_origem_google");
  localStorage.removeItem("astro_perfil_pendente");
  localStorage.removeItem("temp_ong_nome");
  limparCookiePerfil();
  limparCookie("astro_origem_google");
}

function tokenTemAmrRecovery(accessToken?: string): boolean {
  if (!accessToken) return false;
  try {
    const partes = accessToken.split(".");
    if (partes.length < 2) return false;
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (Array.isArray(payload?.amr)) {
      return payload.amr.some(
        (item: { method?: string } | string) =>
          (typeof item === "string" && (item === "recovery" || item === "otp")) ||
          (typeof item === "object" &&
            item !== null &&
            (item.method === "recovery" || item.method === "otp"))
      );
    }
  } catch {
    // ignora erro de decode
  }
  return false;
}

async function aguardarUsuarioSessao(): Promise<{ user: User | null; recuperacao: boolean }> {
  let recuperacao = false;

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (
      params.get("reset") === "true" ||
      params.get("type") === "recovery" ||
      hashParams.get("type") === "recovery" ||
      lerCookie("astro_reset_pendente") === "true"
    ) {
      recuperacao = true;
    }

    const tokenHash = params.get("token_hash");
    const tipoOtp = params.get("type");
    if (tokenHash && tipoOtp === "recovery") {
      recuperacao = true;
      const verificado = await supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: "recovery" })
        .catch(() => null);
      if (verificado?.data?.session?.user) {
        return { user: verificado.data.session.user, recuperacao: true };
      }
    }

    const resetPendente = localStorage.getItem("astro_reset_pendente");
    const googleLogin = localStorage.getItem("astro_google_login");
    const perfilPendente = localStorage.getItem("astro_perfil_pendente") || lerCookiePerfil();
    if (resetPendente && !googleLogin && !perfilPendente) {
      const ts = Number(resetPendente);
      if (!Number.isNaN(ts) && Date.now() - ts < 60 * 60 * 1000) {
        recuperacao = true;
      } else {
        localStorage.removeItem("astro_reset_pendente");
      }
    }
  }

  const inicial = await supabase.auth.getSession();
  if (inicial.data.session?.user) {
    if (tokenTemAmrRecovery(inicial.data.session.access_token)) {
      recuperacao = true;
    }
    return { user: inicial.data.session.user, recuperacao };
  }

  if (typeof window !== "undefined") {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      const trocado = await supabase.auth.exchangeCodeForSession(code).catch(() => null);
      if (trocado?.data?.session?.user) {
        if (tokenTemAmrRecovery(trocado.data.session.access_token)) {
          recuperacao = true;
        }
        return { user: trocado.data.session.user, recuperacao };
      }
    }
  }

  return new Promise((resolve) => {
    let finalizado = false;
    const finalizar = (user: User | null) => {
      if (finalizado) return;
      finalizado = true;
      clearInterval(intervalo);
      clearTimeout(limite);
      subscription.unsubscribe();
      resolve({ user, recuperacao });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, session) => {
      if (evento === "PASSWORD_RECOVERY" || tokenTemAmrRecovery(session?.access_token)) {
        recuperacao = true;
      }
      if (session?.user) {
        finalizar(session.user);
      }
    });

    const intervalo = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        if (tokenTemAmrRecovery(data.session.access_token)) {
          recuperacao = true;
        }
        finalizar(data.session.user);
      }
    }, 400);

    const limite = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (tokenTemAmrRecovery(data.session?.access_token)) {
        recuperacao = true;
      }
      finalizar(data.session?.user ?? null);
    }, 5500);
  });
}

export default function CallbackPage() {
  const router = useRouter();
  const iniciou = useRef(false);
  const [usuarioAguardandoPerfil, setUsuarioAguardandoPerfil] = useState<User | null>(null);
  const [finalizandoEscolha, setFinalizandoEscolha] = useState(false);

  async function finalizarComPerfil(user: User, perfilEscolhido: string) {
    const MSG_ESPERA = "O servidor está iniciando, isso pode levar até 2 minutos.";
    alerta.carregando("Entrando...");
    const aviso = setTimeout(() => alerta.carregando("Entrando...", MSG_ESPERA), 3000);

    const origemGoogle =
      localStorage.getItem("astro_origem_google") || lerCookie("astro_origem_google");
    const nomeOngTemp = localStorage.getItem("temp_ong_nome");
    const nomePessoa =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.nome ||
      user.email?.split("@")[0] ||
      "Explorador";

    const ehExplorador = perfilEscolhido === "explorador";

    // Consulta o perfil real já cadastrado no banco para impedir múltiplas contas/perfis com o mesmo e-mail.
    const me = await buscarMe().catch(() => null);
    const jaEhExplorador = Boolean(me && (me.tutor || me.tipo === "EXPLORADOR") && !me.ong);
    const jaEhOng = Boolean(me && (me.ong || (me.tipo && me.tipo !== "EXPLORADOR")));
    const jaPossuiConta = jaEhExplorador || jaEhOng;

    if (origemGoogle === "cadastro" && jaPossuiConta) {
      clearTimeout(aviso);
      alerta.fechar();
      limparEstadoAuxiliarGoogle();
      await supabase.auth.signOut().catch(() => null);
      await alerta.erro(
        "E-mail já utilizado",
        "Este e-mail já está vinculado a uma conta no Astro. Só é permitido criar uma única conta por e-mail. Faça login com a conta existente."
      );
      router.replace("/login");
      return;
    }

    if (ehExplorador && jaEhOng) {
      clearTimeout(aviso);
      alerta.fechar();
      const perfilReal =
        me?.tipo === "ESTACAO" || me?.ong?.tipoPerfil === "estacao"
          ? "estacao"
          : me?.ong?.tipoPerfil ||
            (user.user_metadata?.perfil && user.user_metadata.perfil !== "explorador"
              ? String(user.user_metadata.perfil)
              : "ong");
      limparEstadoAuxiliarGoogle();
      localStorage.setItem("ultimo_user_id", user.id);
      localStorage.setItem("pessoa_nome", nomePessoa);
      localStorage.setItem("tipo_usuario", perfilReal);
      localStorage.setItem("ong_nome", me?.ong?.nomeOrganizacao || nomePessoa || "Minha ONG");
      await alerta.aviso(
        "E-mail já cadastrado em outro perfil",
        "Este e-mail já possui uma conta institucional/clínica. Só é permitida uma conta por e-mail; redirecionando para o seu painel."
      );
      router.replace(perfilReal === "estacao" ? "/dashboard-clinica" : "/dashboard");
      return;
    }

    if (!ehExplorador && jaEhExplorador) {
      clearTimeout(aviso);
      alerta.fechar();
      limparEstadoAuxiliarGoogle();
      localStorage.setItem("ultimo_user_id", user.id);
      localStorage.setItem("pessoa_nome", nomePessoa);
      localStorage.setItem("tipo_usuario", "explorador");
      await alerta.aviso(
        "E-mail já cadastrado em outro perfil",
        "Este e-mail já possui uma conta de Explorador. Só é permitida uma conta por e-mail; redirecionando para o seu painel."
      );
      router.replace("/dashboard-explorador");
      return;
    }

    await supabase.auth
      .updateUser({
        data: {
          perfil: perfilEscolhido,
          nome: nomePessoa,
        },
      })
      .catch(() => null);

    try {
      if (ehExplorador) {
        if (!jaEhExplorador) {
          await garantirTutor(nomePessoa);
        }
      } else if (!jaEhOng) {
        await garantirOng(nomeOngTemp || nomePessoa || "Minha ONG", perfilEscolhido);
      }
    } catch {
      // Se o back estiver dormindo, prossegue para o painel escolhido
    } finally {
      clearTimeout(aviso);
      alerta.fechar();
    }

    limparEstadoAuxiliarGoogle();
    localStorage.setItem("ultimo_user_id", user.id);
    localStorage.setItem("pessoa_nome", nomePessoa);
    if (user.user_metadata?.avatar_url) {
      localStorage.setItem("ong_foto", user.user_metadata.avatar_url);
    }

    if (ehExplorador) {
      localStorage.setItem("tipo_usuario", "explorador");
      router.replace("/dashboard-explorador");
    } else {
      const ehClinica =
        perfilEscolhido === "estacao" ||
        me?.tipo === "ESTACAO" ||
        me?.ong?.tipoPerfil === "estacao";
      localStorage.setItem("tipo_usuario", ehClinica ? "estacao" : perfilEscolhido);
      localStorage.setItem("ong_nome", me?.ong?.nomeOrganizacao || nomeOngTemp || nomePessoa || "Minha ONG");
      router.replace(ehClinica ? "/dashboard-clinica" : "/dashboard");
    }
  }

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;

    acordarServidor();

    const MSG_ESPERA = "O servidor está iniciando, isso pode levar até 2 minutos.";
    alerta.carregando("Entrando...");
    const aviso = setTimeout(() => alerta.carregando("Entrando...", MSG_ESPERA), 3000);

    async function concluir() {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const erroOAuth =
          params.get("error_description") ||
          hashParams.get("error_description") ||
          params.get("error") ||
          hashParams.get("error");

        if (erroOAuth) {
          clearTimeout(aviso);
          alerta.fechar();
          limparEstadoAuxiliarGoogle();
          await alerta.erro("Não foi possível concluir a autenticação", traduzirErroAuth(erroOAuth));
          router.replace("/login");
          return;
        }
      }

      const { user, recuperacao } = await aguardarUsuarioSessao();

      if (recuperacao) {
        clearTimeout(aviso);
        alerta.fechar();
        router.replace("/recuperar-senha?reset=true");
        return;
      }

      if (!user) {
        clearTimeout(aviso);
        alerta.fechar();
        limparEstadoAuxiliarGoogle();
        router.replace("/login");
        return;
      }

      localStorage.removeItem("astro_google_login");
      localStorage.removeItem("astro_reset_pendente");
      limparCookie("astro_reset_pendente");

      const perfilPendente =
        localStorage.getItem("astro_perfil_pendente") || lerCookiePerfil();

      if (perfilPendente) {
        clearTimeout(aviso);
        await finalizarComPerfil(user, perfilPendente);
        return;
      }

      // Verifica se a conta já possui perfil cadastrado antes de perguntar qual perfil escolher
      const me = await buscarMe().catch(() => null);
      if (me && (me.tutor || me.tipo === "EXPLORADOR") && !me.ong) {
        clearTimeout(aviso);
        alerta.fechar();
        localStorage.setItem("tipo_usuario", "explorador");
        router.replace("/dashboard-explorador");
        return;
      }
      if (me && (me.ong || (me.tipo && me.tipo !== "EXPLORADOR"))) {
        clearTimeout(aviso);
        alerta.fechar();
        const ehClinica = me.tipo === "ESTACAO" || me.ong?.tipoPerfil === "estacao";
        localStorage.setItem("tipo_usuario", ehClinica ? "estacao" : me.ong?.tipoPerfil || "ong");
        if (me.ong?.nomeOrganizacao) {
          localStorage.setItem("ong_nome", me.ong.nomeOrganizacao);
        }
        router.replace(ehClinica ? "/dashboard-clinica" : "/dashboard");
        return;
      }

      // Conta nova sem perfil pré-selecionado: pergunta qual perfil deseja criar
      clearTimeout(aviso);
      alerta.fechar();
      setUsuarioAguardandoPerfil(user);
    }

    concluir().finally(() => clearTimeout(aviso));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!usuarioAguardandoPerfil) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#160877",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>
          Com qual perfil você quer entrar?
        </h1>
        <p style={{ margin: "0 0 8px", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
          Escolha o perfil que deseja acessar com sua conta Google:
        </p>

        {OPCOES_PERFIL.map((opcao) => (
          <button
            key={opcao.id}
            type="button"
            disabled={finalizandoEscolha}
            onClick={async () => {
              setFinalizandoEscolha(true);
              await finalizarComPerfil(usuarioAguardandoPerfil, opcao.id);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "16px",
              border: "1.5px solid rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              textAlign: "left",
              cursor: finalizandoEscolha ? "wait" : "pointer",
            }}
          >
            <span
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.92)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                padding: "6px",
                boxSizing: "border-box",
              }}
            >
              <img
                src={opcao.icone}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <strong style={{ fontSize: "14px" }}>{opcao.titulo}</strong>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.78)" }}>
                {opcao.subtitulo}
              </span>
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
