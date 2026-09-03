import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const isDemo = request.cookies.get("finance_demo_session")?.value === "true";
  let user = null;

  // Intentar autenticación con Supabase si las variables están configuradas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project");

  if (isSupabaseConfigured) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              supabaseResponse = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch {
      user = null;
    }
  }

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiRoute = pathname.startsWith("/api");
  const isPublicAsset = pathname.startsWith("/_next") || pathname.startsWith("/icons") || pathname === "/manifest.json" || pathname.includes(".");

  // No interceptar rutas de API ni assets
  if (isApiRoute || isPublicAsset) {
    return supabaseResponse;
  }

  const isAuthenticated = !!user || isDemo;

  // Redirigir a login si no hay sesión y no es página de auth
  if (!isAuthenticated && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirigir al dashboard si ya hay sesión y está en auth page
  if (isAuthenticated && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
