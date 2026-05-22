import { google } from "googleapis";

const CATALOG_SHEET_ID = process.env.GOOGLE_CATALOG_SHEET_ID;
const SA_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

// Campos editables y su columna en el Sheet (0-indexed → letra)
// A=id(0) B=sku(1) C=isbn(2) D=nombre(3) E=descripcionCorta(4)
// F=precio(5) G=precioRebajado(6) H=precioFinal(7)
// I=enStock(8) J=stock(9)
// K=categoriaMain(10) L=categorias(11) M=subCategorias(12)
// N=imagen(13) O=imagenes(14)
// P=encuadernacion(15) Q=tamanoLetra(16) R=tamanoBiblia(17)
// S=version(18) T=autor(19) U=editorial(20) V=paginas(21)
// W=etiquetas(22) X=peso(23)

export interface ProductUpdate {
  sku?: string;
  isbn?: string;
  activo?: boolean;
  nombre?: string;
  descripcionCorta?: string;
  precio?: number;
  precioRebajado?: number;
  precioFinal?: number;
  enStock?: boolean;
  stock?: number;
  categoriaMain?: string;
  categorias?: string[];
  subCategorias?: string[];
  imagen?: string;
  imagenes?: string[];
  encuadernacion?: string;
  tamanoLetra?: string;
  tamanoBiblia?: string;
  version?: string;
  autor?: string;
  editorial?: string;
  paginas?: number;
  etiquetas?: string[];
  peso?: number;
}

const COL_MAP: Record<keyof ProductUpdate, number> = {
  sku: 1,
  isbn: 2,
  activo: 24, // columna Y
  nombre: 3,
  descripcionCorta: 4,
  precio: 5,
  precioRebajado: 6,
  precioFinal: 7,
  enStock: 8,
  stock: 9,
  categoriaMain: 10,
  categorias: 11,
  subCategorias: 12,
  imagen: 13,
  imagenes: 14,
  encuadernacion: 15,
  tamanoLetra: 16,
  tamanoBiblia: 17,
  version: 18,
  autor: 19,
  editorial: 20,
  paginas: 21,
  etiquetas: 22,
  peso: 23,
};

function colLetter(index: number): string {
  // Convert 0-based column index to spreadsheet letter (A=0, B=1, ... Z=25, AA=26...)
  let result = "";
  let n = index;
  do {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return result;
}

function toSheetValue(key: keyof ProductUpdate, value: unknown): string {
  if (key === "enStock") return value ? "TRUE" : "FALSE";
  if (Array.isArray(value)) return (value as string[]).join("|");
  if (typeof value === "number") return String(value);
  return String(value ?? "");
}

async function getSheets() {
  if (!CATALOG_SHEET_ID || !SA_KEY_JSON) {
    throw new Error("Faltan variables de entorno GOOGLE_CATALOG_SHEET_ID o GOOGLE_SERVICE_ACCOUNT_JSON");
  }
  const decoded = Buffer.from(SA_KEY_JSON, "base64").toString("utf8");
  const credentials = JSON.parse(decoded);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return {
    sheets: google.sheets({ version: "v4", auth }),
    sheetId: CATALOG_SHEET_ID,
  };
}

/**
 * Encuentra el número de fila (1-based, con cabecera) de un producto por ID.
 * Devuelve null si no lo encuentra.
 */
async function findRowByProductId(
  sheetsClient: ReturnType<typeof google.sheets>,
  sheetId: string,
  productId: string
): Promise<number | null> {
  const res = await sheetsClient.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "A2:A", // solo columna ID
  });
  const rows = res.data.values ?? [];
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][0] ?? "").trim() === productId.trim()) {
      return i + 2; // +1 por base-1, +1 por cabecera
    }
  }
  return null;
}

/**
 * Actualiza los campos de un producto en el Google Sheet.
 * @param productId  El campo "id" del producto (columna A)
 * @param updates    Objeto con los campos a actualizar
 */
export async function updateProductInSheet(
  productId: string,
  updates: ProductUpdate
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { sheets, sheetId } = await getSheets();
    const rowNumber = await findRowByProductId(sheets, sheetId, productId);

    if (rowNumber === null) {
      return { ok: false, error: `Producto ${productId} no encontrado en el Sheet` };
    }

    // Construir actualización por celda
    const data: { range: string; values: string[][] }[] = [];

    for (const [key, value] of Object.entries(updates) as [keyof ProductUpdate, unknown][]) {
      const colIndex = COL_MAP[key];
      if (colIndex === undefined) continue;
      const cellRef = `${colLetter(colIndex)}${rowNumber}`;
      data.push({ range: cellRef, values: [[toSheetValue(key, value)]] });
    }

    if (data.length === 0) {
      return { ok: true }; // nada que actualizar
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: "RAW",
        data,
      },
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("updateProductInSheet error:", message);
    return { ok: false, error: message };
  }
}
