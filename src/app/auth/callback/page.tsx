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

function lerCookiePerfil(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)astro_perfil_pendente=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function limparCookiePerfil() {
  if (typeof document === "undefined") return;
  document.cookie = "astro_perfil_pendente=; path=/; max-age=0; SameSite=Lax";
}

async function aguardarUsuarioSessao(): Promise<{ user: User | null; recuperacao: boolean }> {
  let recuperacao = false;

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (
      params.get("reset") === "true" ||
      params.get("type") === "recovery" ||
      hashParams.get("type") === "recovery"
    ) {
      recuperacao = true;
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
    return { user: inicial.data.session.user, recuperacao };
  }

  if (typeof window !== "undefined") {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      const trocado = await supabase.auth.exchangeCodeForSession(code).catch(() => null);
      if (trocado?.data?.session?.user) {
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
      if (evento === "PASSWORD_RECOVERY") {
        recuperacao = true;
      }
      if (session?.user) {
        finalizar(session.user);
      }
    });

    const intervalo = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        finalizar(data.session.user);
      }
    }, 400);

    const limite = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
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

    const nomeOngTemp = localStorage.getItem("temp_ong_nome");
    const nomePessoa =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.nome ||
      user.email?.split("@")[0] ||
      "Explorador";

    const ehExplorador = perfilEscolhido === "explorador";

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
        await garantirTutor(nomePessoa);
      } else {
        await garantirOng(nomeOngTemp || nomePessoa || "Minha ONG", perfilEscolhido);
      }
    } catch {
      // Se o back estiver dormindo ou a conta já tiver vínculo anterior, prossegue para o painel escolhido
    } finally {
      clearTimeout(aviso);
      alerta.fechar();
    }

    localStorage.removeItem("astro_perfil_pendente");
    localStorage.removeItem("temp_ong_nome");
    limparCookiePerfil();
    localStorage.setItem("ultimo_user_id", user.id);
    localStorage.setItem("pessoa_nome", nomePessoa);
    if (user.user_metadata?.avatar_url) {
      localStorage.setItem("ong_foto", user.user_metadata.avatar_url);
    }

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
          await alerta.erro("Não foi possível entrar com o Google", traduzirErroAuth(erroOAuth));
          router.replace("/login");
          return;
        }
      }

      const { user, recuperacao } = await aguardarUsuarioSessao();

      if (recuperacao) {
        clearTimeout(aviso);
        alerta.fechar();
        localStorage.removeItem("astro_reset_pendente");
        router.replace("/login?reset=true");
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
      localStorage.removeItem("astro_reset_pendente");

      const perfilPendente =
        localStorage.getItem("astro_perfil_pendente") || lerCookiePerfil();

      if (perfilPendente) {
        clearTimeout(aviso);
        await finalizarComPerfil(user, perfilPendente);
        return;
      }

      // Caso a pessoa tenha chegado ao callback sem perfil pré-selecionado, pergunta qual perfil deseja acessar
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
