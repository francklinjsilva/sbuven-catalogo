# Configuración Google Sheets — SBUVEN Catálogo

## Hoja creada ✅

**Nombre:** SBUVEN — Pedidos Catálogo  
**ID:** `1ULG09BzPZ4ydeGUhf66214Yx3R-LshULc0n1V-ZXHps`  
**Link:** https://docs.google.com/spreadsheets/d/1ULG09BzPZ4ydeGUhf66214Yx3R-LshULc0n1V-ZXHps/edit

Columnas ya configuradas:
`N° Pedido | Fecha | Cliente | Email | Teléfono | Ciudad | Dirección | Productos | Cant. Items | Total USD | Forma de Pago | Estado | Notas`

---

## Paso 1: Abrir el Apps Script

1. Abre la hoja: https://docs.google.com/spreadsheets/d/1ULG09BzPZ4ydeGUhf66214Yx3R-LshULc0n1V-ZXHps/edit
2. En el menú: **Extensiones → Apps Script**
3. Se abre el editor. Borra todo el código que aparece por defecto.

---

## Paso 2: Pegar el código

Copia y pega este código exacto:

```javascript
const SHEET_ID = "1ULG09BzPZ4ydeGUhf66214Yx3R-LshULc0n1V-ZXHps";
const SHEET_NAME = "Hoja1"; // nombre de la pestaña (no cambiar salvo que la renombres)

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    // Si la hoja está vacía, agregar encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "N° Pedido", "Fecha", "Cliente", "Email", "Teléfono",
        "Ciudad", "Dirección", "Productos", "Cant. Items",
        "Total USD", "Forma de Pago", "Estado", "Notas"
      ]);
    }

    // Agregar la fila del pedido
    sheet.appendRow(data.row);

    // Formato: colorear fila según estado
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, data.row.length)
      .setBackground("#f0fdf4"); // verde claro para pedido nuevo

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "ok",
      message: "SBUVEN Orders API activa",
      sheet: SHEET_ID
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Paso 3: Guardar y desplegar

1. Haz clic en 💾 **Guardar** (o Ctrl+S / Cmd+S)
2. Haz clic en **Implementar → Nueva implementación**
3. Haz clic en el ⚙️ engranaje y selecciona **Aplicación web**
4. Configura así:
   - **Descripción:** SBUVEN Orders v1
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **Quién puede acceder:** Cualquier persona
5. Clic en **Implementar**
6. Google te pedirá autorizar permisos → **Permitir**
7. **Copia la URL** que aparece (termina en `/exec`)

La URL se verá así:
```
https://script.google.com/macros/s/AKfycby.../exec
```

---

## Paso 4: Agregar la URL en Vercel

1. Ve a https://vercel.com → tu proyecto `sbuven-catalogo`
2. **Settings → Environment Variables**
3. Agrega:
   - **Name:** `GOOGLE_SCRIPT_URL`
   - **Value:** (pega la URL del paso anterior)
   - **Environments:** Production, Preview, Development
4. Clic en **Save**
5. Ve a **Deployments** → botón **...** en el último deploy → **Redeploy**

---

## Paso 5: Probar

Haz un pedido de prueba en https://sbuven-catalogo.vercel.app/checkout  
Debería aparecer una fila nueva en la hoja con fondo verde.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| La fila no aparece | Verifica que la URL en Vercel sea correcta y que hayas hecho Redeploy |
| Error de permisos | Vuelve al Apps Script → Implementar → Administrar → Autorizar acceso |
| URL expirada | En Apps Script crea una **Nueva implementación** (no editar la existente) |
