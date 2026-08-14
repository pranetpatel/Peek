import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DEMO_COOKIE, isDemoEnabled } from "@/lib/demo/config";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];
const PROTECTED_PREFIXES = ["/onboarding", "/browse", "/matches"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Demo sessions live entirely in a cookie, so skip Supabase (and its env
  // vars) altogether. The demo launcher itself is always reachable.
  if (isDemoEnabled()) {
    if (pathname.startsWith("/demo")) return NextResponse.next();
    if (request.cookies.get(DEMO_COOKIE)?.value) return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/browse", request.url));
  }

  // Onboarding-completeness gating happens in app/(protected)/onboarding/layout.tsx
  // and app/(protected)/browse/page.tsx, since it needs a Postgres query and
  // this proxy only checks Supabase auth.
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
