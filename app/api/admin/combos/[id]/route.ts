import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { saveCombo, toggleComboActivo } from "@/lib/combos-catalog";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbuven_admin")?.value;
  const pass = process.env.ADMIN_PASSWORD ?? "sbuven2025";
  const expected = createHmac("sha256", "sbuven-salt-2025").update(pass).digest("hex");
  return token === expected;
}

// PUT /api/admin/combos/[id] — save or create
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const comboId = await saveCombo({ ...body, id: id === "nuevo" ? undefined : id });
  return NextResponse.json({ ok: true, id: comboId });
}

// PATCH /api/admin/combos/[id] — toggle activo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { activo } = await request.json();
  await toggleComboActivo(id, activo);
  return NextResponse.json({ ok: true });
}
