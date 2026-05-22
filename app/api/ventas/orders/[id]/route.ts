import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { updateOrderStatus } from "@/lib/orders-sheet";
import type { OrderStatus } from "@/lib/orders-types";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  // Allow both ventas and admin tokens
  const ventasToken = cookieStore.get("sbuven_ventas")?.value;
  const adminToken = cookieStore.get("sbuven_admin")?.value;

  const salesPass = process.env.SALES_PASSWORD ?? "ventas2025";
  const adminPass = process.env.ADMIN_PASSWORD ?? "sbuven2025";

  const expectedVentas = createHmac("sha256", "sbuven-ventas-salt").update(salesPass).digest("hex");
  const expectedAdmin = createHmac("sha256", "sbuven-salt-2025").update(adminPass).digest("hex");

  return ventasToken === expectedVentas || adminToken === expectedAdmin;
}

// PATCH /api/ventas/orders/[id] — update status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { status, numGuia } = await request.json() as { status: OrderStatus; numGuia?: string };

  const result = await updateOrderStatus(id, status, numGuia);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
