"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { garantirOng, garantirTutor } from "@/lib/perfil";
import { acordarServidor } from "@/lib/api";
import { alerta } from "@/lib/alerta";
import { traduzirErroAuth } from "@/lib/errosAuth";
import type { Session, User } from "@supabase/supabase-js";

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

function lerCookiePerfil(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)astro_perfil_pendente=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function limparCookiePerfil() {
  if (typeof document === "undefined") return;
  document.cookie = "astro_perfil_pendente=; path=/; max-age=0; SameSite=Lax";
}

function lerCookieResetPendente(): boolean {
  if (typeof document === "undefined") return false;
  return /(?:^|;\s*)astro_reset_pendente=true(?:;|$)/.test(document.cookie);
}

function limparCookieResetPendente() {
  if (typeof document === "undefined") return;
  document.cookie = "astro_reset_pendente=; path=/; max-age=0; SameSite=Lax";
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
    // ignora erro de decodificação do JWT
  }
  return false;
}

function usuarioTemRecuperacaoRecente(user: User | null, googleLoginAtivo: boolean): boolean {
  if (!user || googleLoginAtivo) return false;
  const enviadoEm = (user as User & { recovery_sent_at?: string }).recovery_sent_at;
  if (!enviadoEm) return false;
  const ts = Date.parse(enviadoEm);
  return !Number.isNaN(ts) && Date.now() - ts < 60 * 60 * 1000;
}

function detectarSessaoRecuperacao(
  session: Session | null,
  user: User | null,
  flagInicial: boolean,
  googleLoginAtivo: boolean
): boolean {
  if (flagInicial) return true;
  if (tokenTemAmrRecovery(session?.access_token)) return true;
  if (usuarioTemRecuperacaoRecente(user, googleLoginAtivo)) return true;
  return false;
}

async function aguardarUsuarioSessao(): Promise<{ user: User | null; recuperacao: boolean }> {
  let recuperacao = false;
  let googleLoginAtivo = false;

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (
      params.get("reset") === "true" ||
      params.get("type") === "recovery" ||
      hashParams.get("type") === "recovery" ||
      lerCookieResetPendente()
    ) {
      recuperacao = true;
    }

    googleLoginAtivo = localStorage.getItem("astro_google_login") === "true";

    const resetPendente = localStorage.getItem("astro_reset_pendente");
    if (resetPendente && !googleLoginAtivo) {
      const ts = Number(resetPendente);
      if (!Number.isNaN(ts) && Date.now() - ts < 60 * 60 * 1000) {
        recuperacao = true;
      } else {
        localStorage.removeItem("astro_reset_pendente");
      }
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
  }

  // Registra o listener ANTES de getSession/exchangeCodeForSession para não perder o evento PASSWORD_RECOVERY
  let eventoRecoveryDetectado = false;
  const {
    data: { subscription: subInicial },
  } = supabase.auth.onAuthStateChange((evento, session) => {
    if (evento === "PASSWORD_RECOVERY" || tokenTemAmrRecovery(session?.access_token)) {
      eventoRecoveryDetectado = true;
      recuperacao = true;
    }
  });

  try {
    const inicial = await supabase.auth.getSession();
    if (inicial.data.session?.user) {
      const ehRec = detectarSessaoRecuperacao(
        inicial.data.session,
        inicial.data.session.user,
        recuperacao || eventoRecoveryDetectado,
        googleLoginAtivo
      );
      subInicial.unsubscribe();
      return { user: inicial.data.session.user, recuperacao: ehRec };
    }

    if (typeof window !== "undefined") {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const trocado = await supabase.auth.exchangeCodeForSession(code).catch(() => null);
        if (trocado?.data?.session?.user) {
          const ehRec = detectarSessaoRecuperacao(
            trocado.data.session,
            trocado.data.session.user,
            recuperacao || eventoRecoveryDetectado,
            googleLoginAtivo
          );
          subInicial.unsubscribe();
          return { user: trocado.data.session.user, recuperacao: ehRec };
        }
      }
    }
  } finally {
    subInicial.unsubscribe();
  }

  return new Promise((resolve) => {
    let finalizado = false;
    const finalizar = (session: Session | null, user: User | null) => {
      if (finalizado) return;
      finalizado = true;
      clearInterval(intervalo);
      clearTimeout(limite);
      subscription.unsubscribe();
      const ehRec = detectarSessaoRecuperacao(
        session,
        user,
        recuperacao || eventoRecoveryDetectado,
        googleLoginAtivo
      );
      resolve({ user, recuperacao: ehRec });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, session) => {
      if (evento === "PASSWORD_RECOVERY" || tokenTemAmrRecovery(session?.access_token)) {
        recuperacao = true;
      }
      if (session?.user) {
        finalizar(session, session.user);
      }
    });

    const intervalo = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        finalizar(data.session, data.session.user);
      }
    }, 150);

    const limite = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      finalizar(data.session ?? null, data.session?.user ?? null);
    }, 4500);
  });
}

export default function CallbackPage() {
  const router = useRouter();
  const iniciou = useRef(false);
  const [usuarioAguardandoPerfil, setUsuarioAguardandoPerfil] = useState<User | null>(null);
  const [finalizandoEscolha, setFinalizandoEscolha] = useState(false);

  async function finalizarComPerfil(user: User, perfilEscolhido: string) {
    alerta.carregando("Entrando...");

    const nomeOngTemp = localStorage.getItem("temp_ong_nome");
    const nomePessoa =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.nome ||
      user.email?.split("@")[0] ||
      "Explorador";

    const ehExplorador = perfilEscolhido === "explorador";

    localStorage.removeItem("astro_perfil_pendente");
    localStorage.removeItem("temp_ong_nome");
    limparCookiePerfil();
    localStorage.setItem("ultimo_user_id", user.id);
    localStorage.setItem("pessoa_nome", nomePessoa);
    if (user.user_metadata?.avatar_url) {
      localStorage.setItem(ehExplorador ? "explorador_foto" : "ong_foto", user.user_metadata.avatar_url);
    }

    // Dispara a garantia de vínculo no back-end em segundo plano sem bloquear o redirecionamento
    if (ehExplorador) {
      void garantirTutor(nomePessoa).catch(() => null);
    } else {
      void garantirOng(nomeOngTemp || nomePessoa || "Minha ONG", perfilEscolhido)
        .then((r) => {
          if (r.ong?.nomeOrganizacao) {
            localStorage.setItem("ong_nome", r.ong.nomeOrganizacao);
          }
        })
        .catch(() => null);
    }

    // Atualiza os metadados no Supabase com limite curto para não atrasar a entrada no painel
    if (user.user_metadata?.perfil !== perfilEscolhido) {
      await Promise.race([
        supabase.auth
          .updateUser({
            data: {
              perfil: perfilEscolhido,
              nome: nomePessoa,
            },
          })
          .catch(() => null),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
    }

    alerta.fechar();

    if (ehExplorador) {
      localStorage.setItem("tipo_usuario", "explorador");
      router.replace("/dashboard-explorador");
    } else {
      localStorage.setItem("tipo_usuario", perfilEscolhido);
      localStorage.setItem("ong_nome", nomeOngTemp || nomePessoa || "Minha ONG");
      router.replace("/dashboard");
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
          localStorage.removeItem("astro_google_login");
          limparCookiePerfil();
          await alerta.erro("Não foi possível concluir a autenticação", traduzirErroAuth(erroOAuth));
          router.replace("/login");
          return;
        }
      }

      const eraGoogleLogin =
        typeof window !== "undefined" && localStorage.getItem("astro_google_login") === "true";
      const perfilPendente =
        (typeof window !== "undefined" ? localStorage.getItem("astro_perfil_pendente") : null) ||
        lerCookiePerfil();

      const { user, recuperacao } = await aguardarUsuarioSessao();

      if (recuperacao) {
        clearTimeout(aviso);
        alerta.fechar();
        localStorage.removeItem("astro_reset_pendente");
        limparCookieResetPendente();
        router.replace("/recuperar-senha?reset=true");
        return;
      }

      if (!user) {
        clearTimeout(aviso);
        alerta.fechar();
        localStorage.removeItem("astro_google_login");
        router.replace("/login");
        return;
      }

      localStorage.removeItem("astro_google_login");

      // Se a pessoa selecionou um perfil antes de autenticar com Google, entra direto nesse perfil
      if (perfilPendente) {
        clearTimeout(aviso);
        localStorage.removeItem("astro_reset_pendente");
        limparCookieResetPendente();
        await finalizarComPerfil(user, perfilPendente);
        return;
      }

      // Se NÃO veio de um clique em "Continuar com Google", então chegou aqui por um link de e-mail do Supabase
      if (!eraGoogleLogin) {
        const temRecoverySent = Boolean(
          (user as User & { recovery_sent_at?: string }).recovery_sent_at
        );
        const criadoEmMs = user.created_at ? Date.parse(user.created_at) : 0;
        const contaExistente = !criadoEmMs || Date.now() - criadoEmMs > 2 * 60 * 1000;

        if (temRecoverySent || contaExistente) {
          clearTimeout(aviso);
          alerta.fechar();
          localStorage.removeItem("astro_reset_pendente");
          limparCookieResetPendente();
          router.replace("/recuperar-senha?reset=true");
          return;
        }

        // Caso seja confirmação de e-mail de cadastro recém-criado que já possui perfil nos metadados
        const perfilMeta = user.user_metadata?.perfil as string | undefined;
        if (perfilMeta) {
          clearTimeout(aviso);
          await finalizarComPerfil(user, perfilMeta);
          return;
        }
      }

      // Caso a pessoa tenha vindo do Google sem perfil pré-selecionado, pergunta qual perfil deseja acessar
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
