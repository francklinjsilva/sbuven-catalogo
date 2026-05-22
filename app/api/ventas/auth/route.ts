import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const COOKIE_NAME = "sbuven_ventas";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function getExpectedToken(): string {
  const pass = process.env.SALES_PASSWORD ?? "ventas2025";
  return createHmac("sha256", "sbuven-ventas-salt").update(pass).digest("hex");
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const salesPassword = process.env.SALES_PASSWORD ?? "ventas2025";

  if (password !== salesPassword) {
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

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
