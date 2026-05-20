// No cachear en el servidor — la tasa cambia 1-2 veces al día
// El cliente tiene su propio estado y puede refrescar manualmente
export const revalidate = 0;

interface BCVResult {
  tasa: number;
  fuente: string;
  actualizacion: string;
}

interface DolarApiItem {
  fuente: string;
  moneda?: string;
  promedio?: number;
  venta?: number;
  fechaActualizacion?: string;
}

async function fromDolarApi(): Promise<BCVResult> {
  const res = await fetch("https://ve.dolarapi.com/v1/dolares", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`dolarapi HTTP ${res.status}`);
  const data = await res.json() as DolarApiItem[];

  // La API devuelve fuente "oficial" (no "BCV") para la tasa del BCV
  const oficial = data.find(
    (d) => d.fuente === "oficial" || d.fuente === "BCV"
  );
  if (!oficial) throw new Error("Tasa oficial no encontrada en dolarapi");

  const tasa = oficial.promedio ?? oficial.venta ?? 0;
  if (!tasa) throw new Error("Tasa es 0 o nula");

  return {
    tasa,
    fuente: "BCV oficial",
    actualizacion: oficial.fechaActualizacion ?? new Date().toISOString(),
  };
}

async function fromDolarApiV2(): Promise<BCVResult> {
  // Endpoint alternativo: moneda individual
  const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`dolarapi/oficial HTTP ${res.status}`);
  const data = await res.json() as DolarApiItem;
  const tasa = data.promedio ?? data.venta ?? 0;
  if (!tasa) throw new Error("Tasa es 0 en dolarapi/oficial");
  return {
    tasa,
    fuente: "BCV oficial",
    actualizacion: data.fechaActualizacion ?? new Date().toISOString(),
  };
}

export async function GET() {
  // Fuente primaria: listado completo
  try {
    const result = await fromDolarApi();
    return Response.json(result);
  } catch (e) {
    console.warn("fromDolarApi falló:", e);
  }

  // Fuente secundaria: endpoint directo /oficial
  try {
    const result = await fromDolarApiV2();
    return Response.json(result);
  } catch (e) {
    console.warn("fromDolarApiV2 falló:", e);
  }

  return Response.json(
    { error: "No se pudo obtener la tasa BCV. Intenta más tarde." },
    { status: 503 }
  );
}
