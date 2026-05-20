# Configuración Google Sheets — SBUVEN Catálogo

## Paso 1: Crear el Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com)
2. Crea un nuevo archivo: **"SBUVEN — Pedidos"**
3. En la primera hoja (Hoja1), agrega estos encabezados en la fila 1:

```
N° Pedido | Fecha | Cliente | Email | Teléfono | Ciudad | Productos | Cant. Items | Total | Forma de Pago | Estado | Mensaje
```

## Paso 2: Instalar el Apps Script

1. En el Google Sheet, ve a **Extensiones → Apps Script**
2. Borra todo el código existente y pega esto:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    sheet.appendRow(data.row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "SBUVEN Orders API" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Haz clic en **Guardar** (Ctrl+S)
4. Haz clic en **Implementar → Nueva implementación**
5. En "Tipo", selecciona **Aplicación web**
6. Configura:
   - Ejecutar como: **Yo (tu email)**
   - Quién puede acceder: **Cualquier persona**
7. Haz clic en **Implementar**
8. **Copia la URL** que aparece (algo como `https://script.google.com/macros/s/...../exec`)

## Paso 3: Configurar la URL en el proyecto

1. Abre el archivo `.env.local` en el proyecto
2. Pega la URL en `GOOGLE_SCRIPT_URL`:

```
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/TU_ID/exec
```

3. En Vercel, ve a **Settings → Environment Variables** y agrega la misma variable

## Paso 4: Verificar

Haz un pedido de prueba en el catálogo. Debería aparecer una fila nueva en el Google Sheet.
