import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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

  const rotasProtegidas = [
    "/dashboard",
    "/dashboard-explorador",
    "/perfil-explorador", // Ajuste se o caminho real do perfil for diferente.
  ];

  const rotaProtegida = rotasProtegidas.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );

  if (rotaProtegida && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const rotaAutenticacao = ["/login", "/cadastro"].some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );

  if (rotaAutenticacao && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
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
