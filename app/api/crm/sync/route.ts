import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { syncClientsFromOrders } from "@/lib/crm-sheet";

async function isAuth(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("sbuven_admin")?.value;
  const expected = createHmac("sha256", "sbuven-salt-2025")
    .update(process.env.ADMIN_PASSWORD ?? "sbuven2025")
    .digest("hex");
  return token === expected;
}

// POST — sincronizar clientes nuevos desde pedidos
export async function POST() {
  if (!(await isAuth())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const result = await syncClientsFromOrders();
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true, added: result.added });
}
