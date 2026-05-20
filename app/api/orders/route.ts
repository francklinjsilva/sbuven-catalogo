import { NextRequest } from "next/server";
import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "1ULG09BzPZ4ydeGUhf66214Yx3R-LshULc0n1V-ZXHps";

async function appendToSheet(row: (string | number)[]) {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!keyJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");

  const credentials = JSON.parse(keyJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Get real tab name (avoids hardcoding)
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const tabName = spreadsheet.data.sheets?.[0]?.properties?.title ?? "Hoja1";

  const header = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1:A1`,
  });

  if (!header.data.values?.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${tabName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          "N° Pedido", "Fecha", "Cliente", "Cédula/RIF", "Email", "Teléfono",
          "Estado", "Municipio", "Dirección", "Punto de Referencia",
          "Productos", "Cant. Items", "Total USD",
          "Forma de Pago", "Envío", "Estado Pedido", "Notas",
        ]],
      },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, fecha, cliente, items, subtotal, formaPago, envio, estado } = body;

    const itemsText = items
      .map(
        (i: { nombre: string; isbn: string; cantidad: number; subtotal: number }) =>
          `${i.nombre} (ISBN: ${i.isbn}) x${i.cantidad} = $${i.subtotal.toFixed(2)}`
      )
      .join(" | ");

    const rowData: (string | number)[] = [
      orderId,
      new Date(fecha).toLocaleString("es-VE", { timeZone: "America/Caracas" }),
      `${cliente.nombre} ${cliente.apellido}`,
      cliente.cedula || "",
      cliente.email,
      cliente.telefono,
      cliente.estado || "",
      cliente.municipio || "",
      cliente.direccion || "",
      cliente.puntoReferencia || "",
      itemsText,
      items.length,
      `$${subtotal.toFixed(2)}`,
      formaPago,
      envio || "",
      estado,
      cliente.mensaje || "",
    ];

    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      await appendToSheet(rowData);
    } else {
      console.log("📦 NEW ORDER:", {
        orderId,
        cliente: `${cliente.nombre} ${cliente.apellido}`,
        cedula: cliente.cedula,
        total: `$${subtotal.toFixed(2)}`,
        formaPago,
        envio,
      });
    }

    const webhookUrl = process.env.WEBHOOK_NOTIFICATION_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch((err) => console.error("Webhook error:", err));
    }

    return Response.json({ success: true, orderId }, { status: 200 });
  } catch (error) {
    console.error("Order API error:", error);
    return Response.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
