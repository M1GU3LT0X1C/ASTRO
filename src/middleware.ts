import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Se o Supabase redirecionar um código OAuth/recuperação para a raiz (Site URL),
  // encaminha para /auth/callback preservando os parâmetros.
  if (
    pathname === "/" &&
    (request.nextUrl.searchParams.has("code") ||
      request.nextUrl.searchParams.has("token_hash"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (request.cookies.get("astro_reset_pendente")?.value === "true") {
      url.searchParams.set("reset", "true");
      url.searchParams.set("type", "recovery");
    }
    return NextResponse.redirect(url);
  }

  const modoTesteExplorador =
    process.env.NODE_ENV === "development" &&
    process.env.MODO_TESTE_EXPLORADOR === "true";

  const rotaExplorador =
    pathname === "/dashboard-explorador" ||
    pathname.startsWith("/dashboard-explorador/") ||
    pathname === "/perfil-explorador" ||
    pathname.startsWith("/perfil-explorador/");

  const modoTesteONG =
    process.env.NODE_ENV === "development" &&
    process.env.MODO_TESTE_ONG === "true";

  const rotaONG =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  if (modoTesteONG && rotaONG) {
    return NextResponse.next({ request });
  }

  if (modoTesteExplorador && rotaExplorador) {
    return NextResponse.next({ request });
  }

  const rotasProtegidas = [
    "/dashboard",
    "/dashboard-explorador",
    "/perfil-explorador",
  ];

  const rotaProtegida = rotasProtegidas.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );

  const resetCookieAtivo = request.cookies.get("astro_reset_pendente")?.value === "true";

  const emRecuperacaoSenha =
    resetCookieAtivo ||
    pathname === "/recuperar-senha" ||
    pathname.startsWith("/recuperar-senha/") ||
    (pathname === "/login" &&
      (request.nextUrl.searchParams.get("reset") === "true" ||
        request.nextUrl.searchParams.get("type") === "recovery" ||
        request.nextUrl.searchParams.has("code") ||
        request.nextUrl.searchParams.has("token_hash")));

  const rotaAutenticacao = ["/login", "/cadastro"].some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );

  // Rotas públicas não precisam aguardar roundtrip de autenticação no Edge Middleware
  if (!rotaProtegida && (!rotaAutenticacao || emRecuperacaoSenha)) {
    return NextResponse.next({ request });
  }

  const temCookieSupabase = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  // Sem cookie de sessão do Supabase, evita chamada de rede desnecessária ao Supabase Auth
  if (!temCookieSupabase) {
    if (rotaProtegida) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (rotaProtegida && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (rotaAutenticacao && user && !emRecuperacaoSenha) {
    const url = request.nextUrl.clone();
    const perfil = user.user_metadata?.perfil;
    url.pathname = perfil === "explorador" ? "/dashboard-explorador" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
