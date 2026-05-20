import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      orderId,
      fecha,
      cliente,
      items,
      subtotal,
      formaPago,
      estado,
    } = body;

    // Format items as a readable string for the spreadsheet
    const itemsText = items
      .map(
        (i: { nombre: string; isbn: string; cantidad: number; subtotal: number }) =>
          `${i.nombre} (ISBN: ${i.isbn}) x${i.cantidad} = $${i.subtotal.toFixed(2)}`
      )
      .join(" | ");

    const rowData = [
      orderId,
      new Date(fecha).toLocaleString("es-VE", { timeZone: "America/Caracas" }),
      `${cliente.nombre} ${cliente.apellido}`,
      cliente.email,
      cliente.telefono,
      cliente.ciudad,
      cliente.direccion || "",
      itemsText,
      items.length,
      `$${subtotal.toFixed(2)}`,
      formaPago,
      estado,
      cliente.mensaje || "",
    ];

    // Send to Google Apps Script web app
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (scriptUrl) {
      const gsRes = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row: rowData, orderId, cliente, items, subtotal, formaPago }),
      });

      if (!gsRes.ok) {
        console.error("Google Sheets error:", await gsRes.text());
      }
    } else {
      // Log to console when no script URL configured (development)
      console.log("📦 NEW ORDER:", {
        orderId,
        cliente: `${cliente.nombre} ${cliente.apellido}`,
        email: cliente.email,
        telefono: cliente.telefono,
        total: `$${subtotal.toFixed(2)}`,
        formaPago,
        productos: items.length,
      });
    }

    // Trigger webhook notification (email, etc.)
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
