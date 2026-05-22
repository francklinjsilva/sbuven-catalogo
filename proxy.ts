import { NextRequest, NextResponse } from "next/server";

async function computeToken(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(salt),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(password));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";

  // ── Hub subdomain → rewrite raíz a /hub ───────────────────────────────────
  if (hostname === "hub.sociedadesbiblicas.org.ve" && pathname === "/") {
    return NextResponse.rewrite(new URL("/hub", request.url));
  }

  // ── Protección /admin/* ────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("sbuven_admin")?.value;
    const expected = await computeToken(
      process.env.ADMIN_PASSWORD ?? "sbuven2025",
      "sbuven-salt-2025"
    );
    if (token !== expected) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Protección /crm/* ─────────────────────────────────────────────────────
  if (pathname.startsWith("/crm")) {
    const token = request.cookies.get("sbuven_admin")?.value;
    const expected = await computeToken(
      process.env.ADMIN_PASSWORD ?? "sbuven2025",
      "sbuven-salt-2025"
    );
    if (token !== expected) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Protección /ventas/* ──────────────────────────────────────────────────
  if (pathname.startsWith("/ventas") && !pathname.startsWith("/ventas/login")) {
    const token = request.cookies.get("sbuven_ventas")?.value;
    const expected = await computeToken(
      process.env.SALES_PASSWORD ?? "ventas2025",
      "sbuven-ventas-salt"
    );
    if (token !== expected) {
      const url = new URL("/ventas/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/ventas/:path*", "/crm/:path*"],
};
