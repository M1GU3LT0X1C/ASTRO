"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { alerta } from "@/lib/alerta";
import { traduzirErroAuth } from "@/lib/errosAuth";
import { buscarMe, garantirOng, garantirTutor } from "@/lib/perfil";
import { acordarServidor } from "@/lib/api";
import type { User } from "@supabase/supabase-js";
import styles from "./Login.module.css";

type PerfilGoogle = "explorador" | "guardiao" | "base-estelar" | "estacao";

const OPCOES_PERFIL_GOOGLE: {
  id: PerfilGoogle;
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

export function Login() {
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enviandoReset, setEnviandoReset] = useState(false);

  // Modo de seleção de perfil ao clicar em "Continuar com Google"
  const [modoPerfilGoogle, setModoPerfilGoogle] = useState(false);
  const [perfilGoogleLoading, setPerfilGoogleLoading] = useState<PerfilGoogle | null>(null);

  // Estados para o modo de redefinição de senha ("Esqueci minha senha")
  const [modoRedefinir, setModoRedefinir] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarNova, setMostrarConfirmarNova] = useState(false);
  const [salvandoNovaSenha, setSalvandoNovaSenha] = useState(false);

  useEffect(() => {
    acordarServidor(); // o back no Render pode estar dormindo; vai subindo enquanto a pessoa digita
    const saved = localStorage.getItem("astro_remember_email");
    if (saved) {
      setEmail(saved);
      setLembrar(true);
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const ehReset =
        params.get("reset") === "true" ||
        params.get("type") === "recovery" ||
        hashParams.get("type") === "recovery";

      if (ehReset) {
        setModoRedefinir(true);
      }

      const code = params.get("code");
      if (code) {
        supabase.auth
          .exchangeCodeForSession(code)
          .then(({ data }) => {
            if (ehReset || data?.session) {
              setModoRedefinir(true);
            }
          })
          .catch(() => null);
      }

      const tokenHash = params.get("token_hash");
      const tipoOtp = params.get("type");
      if (tokenHash && tipoOtp === "recovery") {
        supabase.auth
          .verifyOtp({ token_hash: tokenHash, type: "recovery" })
          .then(() => setModoRedefinir(true))
          .catch(() => null);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY") {
        setModoRedefinir(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function checkRateLimit(e: string) {
    const key = `rl_${e}`;
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    const data = JSON.parse(raw);
    if (data.count >= 5 && Date.now() - data.time < 15 * 60 * 1000) {
      alerta.aviso("Muitas tentativas", "Aguarde alguns minutos e tente novamente.");
      return false;
    }
    if (Date.now() - data.time > 15 * 60 * 1000) {
      localStorage.removeItem(key);
    }
    return true;
  }

  function addTentativa(e: string, ok: boolean) {
    const key = `rl_${e}`;
    if (ok) {
      localStorage.removeItem(key);
      return;
    }
    const raw = localStorage.getItem(key);
    const d = raw ? JSON.parse(raw) : { count: 0, time: Date.now() };
    localStorage.setItem(key, JSON.stringify({ count: d.count + 1, time: Date.now() }));
  }

  async function handleLogin() {
    const emailLimpo = email.trim();
    if (!emailLimpo || !senha) {
      alerta.aviso("Preencha e-mail e senha");
      return;
    }
    if (!checkRateLimit(emailLimpo)) return;
    setLoading(true);
    if (lembrar) localStorage.setItem("astro_remember_email", emailLimpo);
    else localStorage.removeItem("astro_remember_email");

    const result = await supabase.auth.signInWithPassword({
      email: emailLimpo,
      password: senha,
    });

    if (result.error) {
      addTentativa(emailLimpo, false);
      alerta.erro("Não foi possível entrar", traduzirErroAuth(result.error.message));
      setLoading(false);
      return;
    }

    addTentativa(emailLimpo, true);
    await checkAndRedirect(result.data.user);
  }

  function abrirSelecaoPerfilGoogle() {
    setModoPerfilGoogle(true);
  }

  async function iniciarGoogleComPerfil(perfilEscolhido: PerfilGoogle) {
    setLoading(true);
    setPerfilGoogleLoading(perfilEscolhido);
    localStorage.removeItem("astro_reset_pendente");
    localStorage.setItem("astro_google_login", "true");
    localStorage.setItem("astro_perfil_pendente", perfilEscolhido);
    localStorage.setItem("tipo_usuario", perfilEscolhido);
    document.cookie = `astro_perfil_pendente=${encodeURIComponent(perfilEscolhido)}; path=/; max-age=900; SameSite=Lax`;

    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (result.error) {
      localStorage.removeItem("astro_google_login");
      localStorage.removeItem("astro_perfil_pendente");
      setPerfilGoogleLoading(null);
      setLoading(false);
      alerta.erro("Não foi possível entrar com o Google", traduzirErroAuth(result.error.message));
    }
  }

  async function checkAndRedirect(user: User | null) {
    if (!user) {
      setLoading(false);
      return;
    }

    const nome =
      user.user_metadata?.nome ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Explorador";
    const perfilMeta =
      (user.user_metadata?.perfil as string | undefined) ||
      localStorage.getItem("tipo_usuario");

    localStorage.setItem("ultimo_user_id", user.id);
    localStorage.setItem("pessoa_nome", nome);

    for (let tentativa = 0; tentativa < 2; tentativa++) {
      try {
        const me = await buscarMe();

        if (me.tutor || me.tipo === "EXPLORADOR") {
          if (!me.tutor) {
            await garantirTutor(nome).catch(() => null);
          }
          localStorage.setItem("tipo_usuario", "explorador");
          router.push("/dashboard-explorador");
          return;
        }

        if (me.ong || me.tipo) {
          const ong =
            me.ong || (await garantirOng(nome || "Minha ONG").then((r) => r.ong));
          localStorage.setItem("tipo_usuario", perfilMeta && perfilMeta !== "explorador" ? perfilMeta : "ong");
          localStorage.setItem("ong_nome", ong?.nomeOrganizacao || nome || "Minha ONG");
          router.push("/dashboard");
          return;
        }

        if (perfilMeta === "explorador" || !perfilMeta) {
          await garantirTutor(nome);
          localStorage.setItem("tipo_usuario", "explorador");
          router.push("/dashboard-explorador");
          return;
        }

        const { ong } = await garantirOng(nome || "Minha ONG", perfilMeta);
        localStorage.setItem("tipo_usuario", perfilMeta);
        localStorage.setItem("ong_nome", ong?.nomeOrganizacao || nome || "Minha ONG");
        router.push("/dashboard");
        return;
      } catch {
        if (tentativa === 0) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }

        if (perfilMeta === "guardiao" || perfilMeta === "base-estelar" || perfilMeta === "estacao" || perfilMeta === "ong") {
          localStorage.setItem("tipo_usuario", perfilMeta);
          localStorage.setItem("ong_nome", nome || "Minha ONG");
          router.push("/dashboard");
          return;
        }

        localStorage.setItem("tipo_usuario", "explorador");
        router.push("/dashboard-explorador");
        return;
      }
    }
  }

  async function handleEsqueciSenha() {
    const emailLimpo = email.trim();
    if (!emailLimpo) {
      emailInputRef.current?.focus();
      alerta.aviso(
        "Digite seu e-mail primeiro",
        "Informe seu e-mail no campo acima e clique novamente em \"Esqueci minha senha\" para enviarmos o link de recuperação."
      );
      return;
    }

    setEnviandoReset(true);
    try {
      localStorage.setItem("astro_reset_pendente", String(Date.now()));
      const result = await supabase.auth.resetPasswordForEmail(emailLimpo, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });

      if (result.error) {
        localStorage.removeItem("astro_reset_pendente");
        alerta.erro("Não foi possível enviar o link", traduzirErroAuth(result.error.message));
      } else {
        alerta.sucesso(
          "Link enviado!",
          `Enviamos um link de recuperação para ${emailLimpo}. Verifique sua caixa de entrada e a pasta de spam.`
        );
      }
    } finally {
      setEnviandoReset(false);
    }
  }

  async function handleSalvarNovaSenha() {
    if (!novaSenha || !confirmarNovaSenha) {
      alerta.aviso("Preencha os campos", "Digite e confirme a sua nova senha.");
      return;
    }
    if (novaSenha.length < 8) {
      alerta.aviso("Senha muito curta", "A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      alerta.aviso("Senhas diferentes", "A confirmação de senha não coincide com a nova senha.");
      return;
    }

    setSalvandoNovaSenha(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        await alerta.erro(
          "Link expirado ou inválido",
          "Solicite um novo link clicando em \"Esqueci minha senha\" na tela de login."
        );
        setModoRedefinir(false);
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) {
        alerta.erro("Não foi possível redefinir a senha", traduzirErroAuth(error.message));
        return;
      }

      localStorage.removeItem("astro_reset_pendente");
      await alerta.sucesso("Senha atualizada!", "Sua nova senha foi salva com sucesso.");
      setModoRedefinir(false);
      await checkAndRedirect(data.user);
    } finally {
      setSalvandoNovaSenha(false);
    }
  }

  function cancelarRedefinicao() {
    localStorage.removeItem("astro_reset_pendente");
    setModoRedefinir(false);
    setNovaSenha("");
    setConfirmarNovaSenha("");
    router.replace("/login");
  }

  const renderIconeOlho = (visivel: boolean) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {visivel ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.53 9.53a3 3 0 1 0 4.24 4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );

  return (
    <main className={styles.login}>
      <section className={styles.ladoEsquerdo}>
        <Link
          href="/"
          className={styles.planetaLink}
          aria-label="Voltar para a página inicial da Astro"
        >
          <img
            src="/gatoplaneta.png"
            alt=""
            className={styles.planetaImg}
          />
        </Link>
      </section>
      <section className={styles.ladoDireito}>
        <div className={styles.formulario}>
          {modoRedefinir ? (
            <>
              <h1>Redefinir sua senha</h1>
              <p className={styles.subtituloReset}>
                Digite sua nova senha abaixo (mínimo de 8 caracteres) para recuperar o acesso à sua conta.
              </p>

              <div className={styles.inputWrap}>
                <input
                  type={mostrarNovaSenha ? "text" : "password"}
                  placeholder="Nova senha"
                  className={styles.input}
                  value={novaSenha}
                  maxLength={18}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className={styles.olhinho}
                  onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                  aria-label={mostrarNovaSenha ? "Ocultar nova senha" : "Mostrar nova senha"}
                  aria-pressed={mostrarNovaSenha}
                >
                  {renderIconeOlho(mostrarNovaSenha)}
                </button>
              </div>

              <div className={styles.inputWrap}>
                <input
                  type={mostrarConfirmarNova ? "text" : "password"}
                  placeholder="Confirmar nova senha"
                  className={styles.input}
                  value={confirmarNovaSenha}
                  maxLength={18}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSalvarNovaSenha();
                  }}
                />
                <button
                  type="button"
                  className={styles.olhinho}
                  onClick={() => setMostrarConfirmarNova(!mostrarConfirmarNova)}
                  aria-label={mostrarConfirmarNova ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                  aria-pressed={mostrarConfirmarNova}
                >
                  {renderIconeOlho(mostrarConfirmarNova)}
                </button>
              </div>

              <div className={styles.botoesLinha} style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className={styles.botaoPrimario}
                  onClick={handleSalvarNovaSenha}
                  disabled={salvandoNovaSenha}
                >
                  {salvandoNovaSenha ? "Salvando..." : "Salvar senha"}
                </button>

                <button
                  type="button"
                  className={styles.botaoSecundario}
                  onClick={cancelarRedefinicao}
                  disabled={salvandoNovaSenha}
                >
                  Voltar ao login
                </button>
              </div>
            </>
          ) : modoPerfilGoogle ? (
            <>
              <h1>Com qual perfil você quer entrar?</h1>
              <p className={styles.subtituloReset}>
                Escolha como deseja acessar sua conta com o Google:
              </p>

              <div className={styles.listaPerfisGoogle}>
                {OPCOES_PERFIL_GOOGLE.map((opcao) => (
                  <button
                    key={opcao.id}
                    type="button"
                    className={styles.cardPerfilGoogle}
                    onClick={() => iniciarGoogleComPerfil(opcao.id)}
                    disabled={loading}
                  >
                    <span className={styles.iconePerfilGoogle}>
                      <img src={opcao.icone} alt="" />
                    </span>
                    <span className={styles.textoPerfilGoogle}>
                      <strong>
                        {perfilGoogleLoading === opcao.id
                          ? `Conectando como ${opcao.titulo}...`
                          : opcao.titulo}
                      </strong>
                      <span>{opcao.subtitulo}</span>
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={styles.voltarGoogle}
                onClick={() => setModoPerfilGoogle(false)}
                disabled={loading}
              >
                ← Voltar ao login
              </button>
            </>
          ) : (
            <>
              <h1>
                Bem-vindo(a) de volta! Sentimos sua falta no nosso radar.
              </h1>

              <input
                ref={emailInputRef}
                type="email"
                placeholder="E-mail"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className={styles.inputWrap}>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Senha"
                  className={styles.input}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                />

                <button
                  type="button"
                  className={styles.olhinho}
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={mostrarSenha}
                >
                  {renderIconeOlho(mostrarSenha)}
                </button>
              </div>

              <div className={styles.opcoes}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                  />
                  <span>Lembrar meu login</span>
                </label>

                <button
                  type="button"
                  className={styles.esqueci}
                  onClick={handleEsqueciSenha}
                  disabled={enviandoReset}
                >
                  {enviandoReset ? "Enviando link..." : "Esqueci minha senha"}
                </button>
              </div>

              <div className={styles.botoesLinha}>
                <button
                  type="button"
                  className={styles.botaoPrimario}
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Acessar Base"}
                </button>

                <button
                  type="button"
                  className={styles.botaoSecundario}
                  onClick={() => router.push("/cadastro")}
                >
                  Cadastre
                </button>
              </div>

              <div className={styles.divisor}>ou</div>

              <button
                type="button"
                className={styles.botaoGoogle}
                onClick={abrirSelecaoPerfilGoogle}
                disabled={loading}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  width={20}
                  alt=""
                />
                Continuar com Google
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
