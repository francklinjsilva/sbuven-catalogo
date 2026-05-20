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

function rowToProduct(values: string[]): Product | null {
  if (!values[0]) return null;
  const get = (i: number) => values[i] ?? "";
  const num = (i: number) => parseFloat(get(i)) || 0;
  const bool = (i: number) => get(i).toLowerCase() === "true";
  const list = (i: number) =>
    get(i) ? get(i).split("|").map((s) => s.trim()).filter(Boolean) : [];

  return {
    id: get(0),
    sku: get(1),
    isbn: get(2),
    nombre: get(3),
    descripcionCorta: get(4),
    descripcion: get(4), // descripcionCorta doubles as descripcion in sheet
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
  };
}

export async function getAllProductsFromSheets(): Promise<Product[]> {
  if (!CATALOG_SHEET_ID || !SA_KEY_JSON) {
    // Fall back to static JSON while sheets isn't configured
    return staticProducts as Product[];
  }

  try {
    const credentials = JSON.parse(SA_KEY_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: CATALOG_SHEET_ID,
      range: "A2:X", // first sheet, skip header row
    });

    const rows = res.data.values ?? [];
    if (rows.length === 0) return staticProducts as Product[];

    const products = rows
      .map((r) => rowToProduct(r as string[]))
      .filter((p): p is Product => p !== null && Boolean(p.nombre));

    return products.length > 0 ? products : (staticProducts as Product[]);
  } catch (err) {
    console.error("Sheets catalog fetch failed, using static data:", err);
    return staticProducts as Product[];
  }
}
