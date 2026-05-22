import { google } from "googleapis";
import type { Product } from "./types";
import staticProducts from "./products.json";

const CATALOG_SHEET_ID = process.env.GOOGLE_CATALOG_SHEET_ID;
const SA_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

// Column order must match the sheet (see scripts/populate-catalog.mjs)
const COLUMNS = [
  "id","sku","isbn","nombre","descripcionCorta",
  "precio","precioRebajado","precioFinal",
  "enStock","stock",
  "categoriaMain","categorias","subCategorias",
  "imagen","imagenes",
  "encuadernacion","tamanoLetra","tamanoBiblia",
  "version","autor","editorial","paginas",
  "etiquetas","peso",
];

// Añade activo:true a los productos del JSON estático (que no tienen ese campo)
const staticProductsWithActivo: Product[] = (staticProducts as unknown[]).map((p) => ({
  ...(p as object),
  activo: true,
})) as Product[];

// Build lookup map from static JSON by id and sku for description fallback
const staticById = new Map<string, (typeof staticProducts)[number]>();
const staticBySku = new Map<string, (typeof staticProducts)[number]>();
for (const p of staticProducts) {
  if (p.id) staticById.set(p.id, p);
  if (p.sku) staticBySku.set(p.sku, p);
}

function rowToProduct(values: unknown[]): Product | null {
  if (!values[0]) return null;
  // Con UNFORMATTED_VALUE, los valores pueden ser number, boolean o string
  const get = (i: number): string => {
    const v = values[i];
    if (v === null || v === undefined) return "";
    return String(v);
  };
  const num = (i: number) => {
    const v = values[i];
    if (typeof v === "number") return v;
    return parseFloat(String(v ?? "")) || 0;
  };
  const bool = (i: number) => {
    const v = values[i];
    if (typeof v === "boolean") return v;
    return String(v ?? "").toLowerCase() === "true";
  };
  const list = (i: number) =>
    get(i) ? get(i).split("|").map((s) => s.trim()).filter(Boolean) : [];

  const id = get(0);
  const sku = get(1);

  // Description from Sheets column 4; if empty, fall back to static JSON
  const sheetDesc = get(4).trim();
  const staticRef = staticById.get(id) ?? staticBySku.get(sku);
  const descripcion = sheetDesc || staticRef?.descripcion || staticRef?.descripcionCorta || "";
  const descripcionCorta = sheetDesc || staticRef?.descripcionCorta || "";

  // activo: columna Y (índice 24). Si la celda está vacía → true por defecto
  const activoVal = values[24];
  const activo = activoVal === undefined || activoVal === null || activoVal === ""
    ? true
    : bool(24);

  return {
    id,
    sku,
    isbn: get(2),
    nombre: get(3),
    descripcionCorta,
    descripcion,
    precio: num(5),
    precioRebajado: num(6),
    precioFinal: num(7),
    enStock: bool(8),
    stock: num(9),
    categoriaMain: get(10),
    categorias: list(11),
    subCategorias: list(12),
    imagen: get(13),
    imagenes: list(14),
    encuadernacion: get(15),
    tamanoLetra: get(16),
    tamanoBiblia: get(17),
    version: get(18),
    autor: get(19),
    editorial: get(20),
    paginas: num(21),
    etiquetas: list(22),
    peso: num(23),
    dimensiones: [],
    activo,
  };
}

export async function getAllProductsFromSheets(): Promise<Product[]> {
  if (!CATALOG_SHEET_ID || !SA_KEY_JSON) {
    // Fall back to static JSON while sheets isn't configured
    return staticProductsWithActivo;
  }

  try {
    // Value is base64-encoded to avoid newline issues in Vercel env vars
    const decoded = Buffer.from(SA_KEY_JSON, "base64").toString("utf8");
    const credentials = JSON.parse(decoded);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: CATALOG_SHEET_ID,
      range: "A2:Y", // A=id … X=peso, Y=activo
      valueRenderOption: "UNFORMATTED_VALUE", // números crudos, sin formato de celda
    });

    const rows = res.data.values ?? [];
    if (rows.length === 0) return staticProductsWithActivo;

    const products = rows
      .map((r) => rowToProduct(r as unknown[]))
      .filter((p): p is Product => p !== null && Boolean(p.nombre));

    return products.length > 0 ? products : (staticProductsWithActivo);
  } catch (err) {
    console.error("Sheets catalog fetch failed, using static data:", err);
    return staticProductsWithActivo;
  }
}

/**
 * Versión para el catálogo público: excluye productos con activo === false.
 * Los productos sin columna activo (undefined) se tratan como activos.
 */
export async function getActiveProductsForCatalog(): Promise<Product[]> {
  const all = await getAllProductsFromSheets();
  return all.filter((p) => p.activo !== false);
}
