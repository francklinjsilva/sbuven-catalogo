import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const COOKIE_NAME = "sbuven_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

// Misma lógica que proxy.ts pero con Node crypto (API routes son Node.js runtime)
function getExpectedToken(): string {
  const pass = process.env.ADMIN_PASSWORD ?? "sbuven2025";
  return createHmac("sha256", "sbuven-salt-2025").update(pass).digest("hex");
}

// POST /api/admin/auth — Login
export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "sbuven2025";

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = getExpectedToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}

// DELETE /api/admin/auth — Logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
