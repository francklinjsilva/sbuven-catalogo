import { google } from "googleapis";
export type { OrderStatus, ShippingMethod, Order } from "./orders-types";
export { STATUS_LABELS, STATUS_COLORS, SHIPPING_LABELS, PAYMENT_LABELS, getStatusFlow } from "./orders-types";
import type { Order, OrderStatus, ShippingMethod } from "./orders-types";

const ORDERS_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SA_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const SHEET_TAB = "SBUVEN — Pedidos Catálogo";

// ── Helpers de Sheets ─────────────────────────────────────────────────────────

async function getSheets() {
  if (!ORDERS_SHEET_ID || !SA_KEY_JSON) throw new Error("Faltan env vars de Sheets");
  const decoded = Buffer.from(SA_KEY_JSON, "base64").toString("utf8");
  const credentials = JSON.parse(decoded);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return { sheets: google.sheets({ version: "v4", auth }), sheetId: ORDERS_SHEET_ID };
}

function rowToOrder(row: string[], rowNumber: number): Order | null {
  const get = (i: number) => (row[i] ?? "").trim();
  const id = get(0);
  if (!id) return null;

  return {
    id,
    fecha: get(1),
    cliente: get(2),
    cedula: get(3),
    email: get(4),
    telefono: get(5),
    estadoGeo: get(6),
    municipio: get(7),
    direccion: get(8),
    puntoRef: get(9),
    productos: get(10),
    cantItems: parseInt(get(11)) || 0,
    total: get(12),
    formaPago: get(13),
    envio: (get(14) || "retiro_tienda") as ShippingMethod,
    estadoPedido: (get(15) as OrderStatus) || "pendiente",
    notas: get(16),
    numGuia: get(17) || undefined,
    rowNumber,
  };
}

// ── API pública ───────────────────────────────────────────────────────────────

export async function getAllOrders(): Promise<Order[]> {
  const { sheets, sheetId } = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${SHEET_TAB}'!A2:R`,
  });
  const rows = (res.data.values ?? []) as string[][];
  return rows
    .map((r, i) => rowToOrder(r, i + 2))
    .filter((o): o is Order => o !== null)
    .reverse();
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  numGuia?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { sheets, sheetId } = await getSheets();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${SHEET_TAB}'!A2:A`,
    });
    const rows = (res.data.values ?? []) as string[][];
    let rowNumber: number | null = null;
    for (let i = 0; i < rows.length; i++) {
      if ((rows[i][0] ?? "").trim() === orderId) {
        rowNumber = i + 2;
        break;
      }
    }
    if (rowNumber === null) return { ok: false, error: "Pedido no encontrado" };

    const updates: { range: string; values: string[][] }[] = [
      { range: `'${SHEET_TAB}'!P${rowNumber}`, values: [[status]] },
    ];
    if (numGuia !== undefined) {
      updates.push({ range: `'${SHEET_TAB}'!R${rowNumber}`, values: [[numGuia]] });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { valueInputOption: "RAW", data: updates },
    });

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { ok: false, error: msg };
  }
}
