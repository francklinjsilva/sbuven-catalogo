/**
 * One-time script to populate the Google Sheet catalog with all products.
 * Run after sharing the sheet with the service account:
 *   node scripts/populate-catalog.mjs
 *
 * Requires GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_CATALOG_SHEET_ID in .env.local
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = resolve(__dirname, "../.env.local");
try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {
  // .env.local not found — rely on real env vars
}

const SA_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const CATALOG_SHEET_ID = process.env.GOOGLE_CATALOG_SHEET_ID;

if (!SA_KEY_JSON || !CATALOG_SHEET_ID) {
  console.error("Missing GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_CATALOG_SHEET_ID");
  process.exit(1);
}

const products = JSON.parse(
  readFileSync(resolve(__dirname, "../lib/products.json"), "utf8")
);

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

function productToRow(p) {
  return COLUMNS.map((col) => {
    const v = p[col];
    if (Array.isArray(v)) return v.join("|");
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    return v ?? "";
  });
}

async function main() {
  const credentials = JSON.parse(SA_KEY_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  console.log(`Clearing sheet and writing ${products.length} products...`);

  // Get the first sheet's title (could be "Hoja1", "Sheet1", etc.)
  const meta = await sheets.spreadsheets.get({ spreadsheetId: CATALOG_SHEET_ID });
  const sheetTitle = meta.data.sheets?.[0]?.properties?.title ?? "Hoja1";
  console.log(`Using tab: "${sheetTitle}"`);

  // Clear existing data
  await sheets.spreadsheets.values.clear({
    spreadsheetId: CATALOG_SHEET_ID,
    range: `${sheetTitle}!A1:Z`,
  });

  // Write header + all rows
  const header = COLUMNS;
  const rows = [header, ...products.map(productToRow)];

  await sheets.spreadsheets.values.update({
    spreadsheetId: CATALOG_SHEET_ID,
    range: `${sheetTitle}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rows },
  });

  console.log(`Done! ${products.length} products written to sheet ${CATALOG_SHEET_ID}`);
  console.log(`Open: https://docs.google.com/spreadsheets/d/${CATALOG_SHEET_ID}/edit`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
