import { google } from "googleapis";
export type { Client, ClientType } from "./crm-types";
export { CLIENT_TYPE_LABELS, CLIENT_TYPE_COLORS } from "./crm-types";
import type { Client, ClientType } from "./crm-types";

const SHEET_ID    = process.env.GOOGLE_SHEET_ID; // hoja de pedidos — aquí también vive CRM
const SA_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const CRM_TAB     = "SBUVEN — Clientes";
const ORDERS_TAB  = "SBUVEN — Pedidos Catálogo";

// ── Auth ──────────────────────────────────────────────────────────────────────
async function getSheets() {
  if (!SHEET_ID || !SA_KEY_JSON) throw new Error("Faltan env vars de Sheets");
  const credentials = JSON.parse(Buffer.from(SA_KEY_JSON, "base64").toString("utf8"));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return { sheets: google.sheets({ version: "v4", auth }), sheetId: SHEET_ID };
}

// ── Conversión fila → objeto ──────────────────────────────────────────────────
function rowToClient(row: string[], rowNumber: number): Client | null {
  const g = (i: number) => (row[i] ?? "").trim();
  if (!g(0)) return null;
  return {
    id:            g(0),
    nombre:        g(1),
    cedula:        g(2),
    email:         g(3),
    telefono:      g(4),
    estadoGeo:     g(5),
    municipio:     g(6),
    direccion:     g(7),
    tipo:          (g(8) as ClientType) || "natural",
    etiquetas:     g(9).split("|").map(e => e.trim()).filter(Boolean),
    notas:         g(10),
    fechaRegistro: g(11),
    origen:        (g(12) as "manual" | "catalogo") || "manual",
    rowNumber,
  };
}

// ── Generador de ID ───────────────────────────────────────────────────────────
function nextId(existingIds: string[]): string {
  const nums = existingIds
    .map(id => parseInt(id.replace("CLI-", ""), 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `CLI-${String(next).padStart(4, "0")}`;
}

// ── Leer todos los clientes ───────────────────────────────────────────────────
export async function getAllClients(): Promise<Client[]> {
  try {
    const { sheets, sheetId } = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${CRM_TAB}'!A2:M`,
    });
    return ((res.data.values ?? []) as string[][])
      .map((r, i) => rowToClient(r, i + 2))
      .filter((c): c is Client => c !== null);
  } catch {
    return [];
  }
}

// ── Crear cliente ─────────────────────────────────────────────────────────────
export async function createClient(
  data: Omit<Client, "id" | "rowNumber">
): Promise<{ ok: boolean; client?: Client; error?: string }> {
  try {
    const { sheets, sheetId } = await getSheets();

    const idsRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${CRM_TAB}'!A2:A`,
    });
    const existingIds = ((idsRes.data.values ?? []) as string[][]).map(r => r[0] ?? "");
    const id = nextId(existingIds);

    const row = [
      id, data.nombre, data.cedula, data.email, data.telefono,
      data.estadoGeo, data.municipio, data.direccion, data.tipo,
      data.etiquetas.join("|"), data.notas, data.fechaRegistro, data.origen,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `'${CRM_TAB}'!A2`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });

    return { ok: true, client: { ...data, id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error" };
  }
}

// ── Actualizar cliente ────────────────────────────────────────────────────────
export async function updateClient(
  clientId: string,
  updates: Partial<Omit<Client, "id" | "rowNumber">>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { sheets, sheetId } = await getSheets();

    // Encontrar fila
    const idsRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${CRM_TAB}'!A2:A`,
    });
    const rows = (idsRes.data.values ?? []) as string[][];
    let rowNumber: number | null = null;
    for (let i = 0; i < rows.length; i++) {
      if ((rows[i][0] ?? "").trim() === clientId) { rowNumber = i + 2; break; }
    }
    if (rowNumber === null) return { ok: false, error: "Cliente no encontrado" };

    // Leer fila actual
    const curRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${CRM_TAB}'!A${rowNumber}:M${rowNumber}`,
    });
    const cur = ((curRes.data.values ?? [[]])[0] ?? []) as string[];
    const g = (i: number) => cur[i] ?? "";

    const newRow = [
      g(0), // ID inamovible
      updates.nombre    ?? g(1),
      updates.cedula    ?? g(2),
      updates.email     ?? g(3),
      updates.telefono  ?? g(4),
      updates.estadoGeo ?? g(5),
      updates.municipio ?? g(6),
      updates.direccion ?? g(7),
      updates.tipo      ?? g(8),
      updates.etiquetas !== undefined ? updates.etiquetas.join("|") : g(9),
      updates.notas     ?? g(10),
      g(11), // fechaRegistro inamovible
      g(12), // origen inamovible
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'${CRM_TAB}'!A${rowNumber}:M${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [newRow] },
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error" };
  }
}

// ── Sincronizar clientes desde pedidos ───────────────────────────────────────
export async function syncClientsFromOrders(): Promise<{ ok: boolean; added: number; error?: string }> {
  try {
    const { sheets, sheetId } = await getSheets();

    // Clientes existentes
    const existRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${CRM_TAB}'!A2:M`,
    });
    const existRows = (existRes.data.values ?? []) as string[][];
    const existingCedulas = new Set(existRows.map(r => (r[2] ?? "").trim().toLowerCase()));
    const existingIds = existRows.map(r => r[0] ?? "");

    // Pedidos
    const ordRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${ORDERS_TAB}'!A2:R`,
    });
    const orderRows = (ordRes.data.values ?? []) as string[][];

    // Agrupar por cédula — gana el pedido más reciente (último en la hoja)
    const discovered = new Map<string, string[]>();
    for (const row of orderRows) {
      const cedula = (row[3] ?? "").trim().toLowerCase();
      if (cedula && !existingCedulas.has(cedula)) {
        discovered.set(cedula, row); // sobreescribe → queda el más reciente
      }
    }

    if (discovered.size === 0) return { ok: true, added: 0 };

    const today = new Date().toLocaleDateString("es-VE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });

    let lastNum = existingIds
      .map(id => parseInt(id.replace("CLI-", ""), 10))
      .filter(n => !isNaN(n))
      .reduce((max, n) => Math.max(max, n), 0);

    const newRows: string[][] = [];
    for (const [, row] of discovered) {
      lastNum++;
      newRows.push([
        `CLI-${String(lastNum).padStart(4, "0")}`,
        row[2] ?? "",  // nombre
        row[3] ?? "",  // cédula
        row[4] ?? "",  // email
        row[5] ?? "",  // teléfono
        row[6] ?? "",  // estadoGeo
        row[7] ?? "",  // municipio
        row[8] ?? "",  // dirección
        "natural",     // tipo (default, equipo puede editar)
        "",            // etiquetas
        "",            // notas
        today,
        "catalogo",
      ]);
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `'${CRM_TAB}'!A2`,
      valueInputOption: "RAW",
      requestBody: { values: newRows },
    });

    return { ok: true, added: newRows.length };
  } catch (err) {
    return { ok: false, added: 0, error: err instanceof Error ? err.message : "Error" };
  }
}

// ── Pedidos de un cliente (por cédula) ───────────────────────────────────────
export async function getClientOrders(cedula: string) {
  try {
    const { sheets, sheetId } = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${ORDERS_TAB}'!A2:R`,
    });
    const rows = (res.data.values ?? []) as string[][];
    return rows
      .filter(r => (r[3] ?? "").trim().toLowerCase() === cedula.trim().toLowerCase())
      .map(r => ({
        id:          r[0] ?? "",
        fecha:       r[1] ?? "",
        productos:   r[10] ?? "",
        total:       r[12] ?? "",
        formaPago:   r[13] ?? "",
        envio:       r[14] ?? "",
        estadoPedido: r[15] ?? "",
      }))
      .reverse();
  } catch {
    return [];
  }
}
