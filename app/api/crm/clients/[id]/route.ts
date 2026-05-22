import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { updateClient, getClientOrders } from "@/lib/crm-sheet";
import type { ClientType } from "@/lib/crm-types";

async function isAuth(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("sbuven_admin")?.value;
  const expected = createHmac("sha256", "sbuven-salt-2025")
    .update(process.env.ADMIN_PASSWORD ?? "sbuven2025")
    .digest("hex");
  return token === expected;
}

// PATCH — actualizar cliente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuth())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const updates: Parameters<typeof updateClient>[1] = {};
  if (body.nombre    !== undefined) updates.nombre    = body.nombre;
  if (body.cedula    !== undefined) updates.cedula    = body.cedula;
  if (body.email     !== undefined) updates.email     = body.email;
  if (body.telefono  !== undefined) updates.telefono  = body.telefono;
  if (body.estadoGeo !== undefined) updates.estadoGeo = body.estadoGeo;
  if (body.municipio !== undefined) updates.municipio = body.municipio;
  if (body.direccion !== undefined) updates.direccion = body.direccion;
  if (body.tipo      !== undefined) updates.tipo      = body.tipo as ClientType;
  if (body.etiquetas !== undefined) updates.etiquetas = body.etiquetas;
  if (body.notas     !== undefined) updates.notas     = body.notas;

  const result = await updateClient(id, updates);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// GET — pedidos del cliente (por cédula como query param)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuth())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;  // en este caso el "id" es la cédula para pedidos
  const cedula = new URL(request.url).searchParams.get("cedula") ?? id;
  const orders = await getClientOrders(cedula);
  return NextResponse.json(orders);
}
