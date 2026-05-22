import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { google } from "googleapis";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbuven_admin")?.value;
  const pass = process.env.ADMIN_PASSWORD ?? "sbuven2025";
  const expected = createHmac("sha256", "sbuven-salt-2025").update(pass).digest("hex");
  return token === expected;
}

async function getSheets() {
  const SA_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON!;
  const SHEET_ID = process.env.GOOGLE_CATALOG_SHEET_ID!;
  const decoded = Buffer.from(SA_KEY_JSON, "base64").toString("utf8");
  const credentials = JSON.parse(decoded);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return { sheets: google.sheets({ version: "v4", auth }), sheetId: SHEET_ID };
}

/**
 * POST /api/admin/products/bulk
 * Body: { ids: string[], action: string, value?: number }
 *
 * Acciones:
 *   activate         → activo = TRUE  (col Y)
 *   deactivate       → activo = FALSE (col Y)
 *   price_increase   → precio += value%  (cols F,H recalculadas)
 *   price_decrease   → precio -= value%
 *   price_fixed      → precio = value
 *   apply_offer      → precioRebajado = precio * (1 - value/100), precioFinal = precioRebajado
 *   remove_offer     → precioRebajado = 0, precioFinal = precio
 */
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { ids, action, value } = await request.json() as {
    ids: string[];
    action: string;
    value?: number;
  };

  if (!ids?.length || !action) {
    return NextResponse.json({ error: "Faltan ids o action" }, { status: 400 });
  }

  const { sheets, sheetId } = await getSheets();

  // Leer todas las filas para encontrar los índices de fila de los IDs
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "A2:H",  // id(A), ..., precio(F), precioRebajado(G), precioFinal(H)
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  const rows = res.data.values ?? [];
  const idSet = new Set(ids);

  // Columna letra helpers
  const col = (idx: number) => String.fromCharCode(65 + idx); // 0→A, 5→F…

  const updates: { range: string; values: unknown[][] }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowId = String(row[0] ?? "").trim();
    if (!idSet.has(rowId)) continue;

    const sheetRow = i + 2; // +1 base1, +1 header
    const precio = parseFloat(String(row[5] ?? "0")) || 0;
    const precioRebajado = parseFloat(String(row[6] ?? "0")) || 0;

    switch (action) {
      case "activate":
        updates.push({ range: `${col(24)}${sheetRow}`, values: [["TRUE"]] });
        break;

      case "deactivate":
        updates.push({ range: `${col(24)}${sheetRow}`, values: [["FALSE"]] });
        break;

      case "price_increase": {
        const factor = 1 + (value ?? 0) / 100;
        const newPrecio = Math.round(precio * factor * 100) / 100;
        const newFinal = precioRebajado > 0 ? Math.round(precioRebajado * factor * 100) / 100 : newPrecio;
        updates.push({ range: `F${sheetRow}`, values: [[newPrecio]] });
        if (precioRebajado > 0) updates.push({ range: `G${sheetRow}`, values: [[newFinal]] });
        updates.push({ range: `H${sheetRow}`, values: [[newFinal]] });
        break;
      }

      case "price_decrease": {
        const factor = 1 - (value ?? 0) / 100;
        const newPrecio = Math.max(0, Math.round(precio * factor * 100) / 100);
        const newFinal = precioRebajado > 0 ? Math.max(0, Math.round(precioRebajado * factor * 100) / 100) : newPrecio;
        updates.push({ range: `F${sheetRow}`, values: [[newPrecio]] });
        if (precioRebajado > 0) updates.push({ range: `G${sheetRow}`, values: [[newFinal]] });
        updates.push({ range: `H${sheetRow}`, values: [[newFinal]] });
        break;
      }

      case "price_fixed": {
        const newPrecio = value ?? 0;
        updates.push({ range: `F${sheetRow}`, values: [[newPrecio]] });
        updates.push({ range: `G${sheetRow}`, values: [[0]] });
        updates.push({ range: `H${sheetRow}`, values: [[newPrecio]] });
        break;
      }

      case "apply_offer": {
        const discount = (value ?? 0) / 100;
        const newRebajado = Math.round(precio * (1 - discount) * 100) / 100;
        updates.push({ range: `G${sheetRow}`, values: [[newRebajado]] });
        updates.push({ range: `H${sheetRow}`, values: [[newRebajado]] });
        break;
      }

      case "remove_offer":
        updates.push({ range: `G${sheetRow}`, values: [[0]] });
        updates.push({ range: `H${sheetRow}`, values: [[precio]] });
        break;
    }
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: updates,
      },
    });
  }

  return NextResponse.json({ ok: true, updated: ids.length });
}
