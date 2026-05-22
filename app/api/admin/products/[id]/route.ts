import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { updateProductInSheet } from "@/lib/sheets-write";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbuven_admin")?.value;
  const pass = process.env.ADMIN_PASSWORD ?? "sbuven2025";
  const expected = createHmac("sha256", "sbuven-salt-2025").update(pass).digest("hex");
  return token === expected;
}

// PUT /api/admin/products/[id] — Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const updates = await request.json();
  const result = await updateProductInSheet(id, updates);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
