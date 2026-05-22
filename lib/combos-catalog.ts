import { google } from "googleapis";
import type { Combo } from "./types";

const CATALOG_SHEET_ID = process.env.GOOGLE_CATALOG_SHEET_ID;
const SA_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

// Columnas de la pestaña "Combos":
// A=id, B=nombre, C=descripcion, D=precio, E=imagen, F=productoIds (|), G=activo

async function getSheets() {
  if (!CATALOG_SHEET_ID || !SA_KEY_JSON) throw new Error("Faltan env vars de Sheets");
  const decoded = Buffer.from(SA_KEY_JSON, "base64").toString("utf8");
  const credentials = JSON.parse(decoded);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return { sheets: google.sheets({ version: "v4", auth }), sheetId: CATALOG_SHEET_ID };
}

function rowToCombo(values: unknown[], rowIdx: number): Combo | null {
  const get = (i: number): string => {
    const v = values[i];
    if (v === null || v === undefined) return "";
    return String(v);
  };
  const id = get(0);
  if (!id || !get(1)) return null;

  const activoVal = values[6];
  const activo = activoVal === undefined || activoVal === null || activoVal === ""
    ? true
    : String(activoVal).toLowerCase() === "true";

  return {
    id,
    nombre: get(1),
    descripcion: get(2),
    precio: parseFloat(get(3)) || 0,
    imagen: get(4),
    productoIds: get(5) ? get(5).split("|").map((s) => s.trim()).filter(Boolean) : [],
    activo,
  };
}

export async function getAllCombos(): Promise<Combo[]> {
  if (!CATALOG_SHEET_ID || !SA_KEY_JSON) return [];
  try {
    const { sheets, sheetId } = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Combos!A2:G",
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    const rows = res.data.values ?? [];
    return rows
      .map((r, i) => rowToCombo(r as unknown[], i))
      .filter((c): c is Combo => c !== null);
  } catch (err) {
    console.error("getAllCombos error:", err);
    return [];
  }
}

export async function saveCombo(combo: Omit<Combo, "id"> & { id?: string }): Promise<string> {
  const { sheets, sheetId } = await getSheets();

  let id = combo.id;
  let rowNumber: number | null = null;

  if (id) {
    // Buscar fila existente
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Combos!A2:A",
    });
    const rows = res.data.values ?? [];
    for (let i = 0; i < rows.length; i++) {
      if ((rows[i][0] ?? "").toString().trim() === id) {
        rowNumber = i + 2;
        break;
      }
    }
  } else {
    // Generar nuevo ID
    id = `CMB-${Date.now()}`;
  }

  const rowData = [
    id,
    combo.nombre,
    combo.descripcion,
    combo.precio,
    combo.imagen,
    combo.productoIds.join("|"),
    combo.activo ? "TRUE" : "FALSE",
  ];

  if (rowNumber) {
    // Actualizar fila existente
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Combos!A${rowNumber}:G${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [rowData] },
    });
  } else {
    // Agregar nueva fila
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Combos!A:G",
      valueInputOption: "RAW",
      requestBody: { values: [rowData] },
    });
  }

  return id;
}

export async function toggleComboActivo(comboId: string, activo: boolean): Promise<void> {
  const { sheets, sheetId } = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Combos!A2:A",
  });
  const rows = res.data.values ?? [];
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][0] ?? "").toString().trim() === comboId) {
      const rowNumber = i + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Combos!G${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: { values: [[activo ? "TRUE" : "FALSE"]] },
      });
      return;
    }
  }
}
