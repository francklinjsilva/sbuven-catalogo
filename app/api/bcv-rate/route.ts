export const revalidate = 1800; // cache 30 minutos en el servidor

interface BCVResult {
  tasa: number;
  fuente: string;
  actualizacion: string;
}

async function fromDolarApi(): Promise<BCVResult> {
  const res = await fetch("https://ve.dolarapi.com/v1/dolares", {
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error("dolarapi failed");
  const data = await res.json();
  const bcv = (data as { fuente: string; promedio?: number; venta?: number; fechaActualizacion?: string }[])
    .find((d) => d.fuente === "BCV");
  if (!bcv) throw new Error("BCV not found in dolarapi");
  return {
    tasa: bcv.promedio ?? bcv.venta ?? 0,
    fuente: "BCV oficial",
    actualizacion: bcv.fechaActualizacion ?? new Date().toISOString(),
  };
}

async function fromPydolarve(): Promise<BCVResult> {
  const res = await fetch(
    "https://pydolarve.org/api/v1/dollar?monitor=bcv&format_date=default",
    { next: { revalidate: 1800 } }
  );
  if (!res.ok) throw new Error("pydolarve failed");
  const data = await res.json() as { monitor?: { price?: number; last_update?: string } };
  const price = data?.monitor?.price;
  if (!price) throw new Error("price not found in pydolarve");
  return {
    tasa: price,
    fuente: "BCV oficial",
    actualizacion: data?.monitor?.last_update ?? new Date().toISOString(),
  };
}

export async function GET() {
  // Intentar fuente primaria
  try {
    const result = await fromDolarApi();
    return Response.json(result);
  } catch (_) {
    // fuente primaria falló, continuar
  }

  // Fuente secundaria
  try {
    const result = await fromPydolarve();
    return Response.json(result);
  } catch (_) {
    // ambas fuentes fallaron
  }

  return Response.json(
    { error: "No se pudo obtener la tasa BCV. Intenta más tarde." },
    { status: 503 }
  );
}
