import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { getAllClients, createClient } from "@/lib/crm-sheet";
import type { ClientType } from "@/lib/crm-types";

async function isAuth(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("sbuven_admin")?.value;
  const expected = createHmac("sha256", "sbuven-salt-2025")
    .update(process.env.ADMIN_PASSWORD ?? "sbuven2025")
    .digest("hex");
  return token === expected;
}

// GET — listar todos los clientes
export async function GET() {
  if (!(await isAuth())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const clients = await getAllClients();
  return NextResponse.json(clients);
}

// POST — crear cliente manual
export async function POST(request: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const today = new Date().toLocaleDateString("es-VE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const result = await createClient({
    nombre:        body.nombre ?? "",
    cedula:        body.cedula ?? "",
    email:         body.email ?? "",
    telefono:      body.telefono ?? "",
    estadoGeo:     body.estadoGeo ?? "",
    municipio:     body.municipio ?? "",
    direccion:     body.direccion ?? "",
    tipo:          (body.tipo as ClientType) ?? "natural",
    etiquetas:     Array.isArray(body.etiquetas) ? body.etiquetas : [],
    notas:         body.notas ?? "",
    fechaRegistro: today,
    origen:        "manual",
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.client, { status: 201 });
}
