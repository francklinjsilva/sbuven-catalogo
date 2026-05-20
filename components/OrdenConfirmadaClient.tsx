"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ConfirmationData {
  orderId: string;
  nombre: string;
  apellido: string;
  cedula: string;
  subtotal: number;
  bcvRate: { tasa: number; fuente: string; actualizacion: string } | null;
  paymentMethod: string;
  shippingMethod: string;
  isBsMethod: boolean;
  paymentLabel: string;
  shippingLabel: string;
  whatsappUrl: string;
  fecha: string;
}

function formatBs(n: number) {
  return n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function OrdenConfirmadaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("id");

  const [order, setOrder] = useState<ConfirmationData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Leer datos guardados por CheckoutFlow antes de redirigir
    const raw = sessionStorage.getItem("sbuven_last_order");
    if (!raw) {
      setNotFound(true);
      return;
    }
    try {
      const data: ConfirmationData = JSON.parse(raw);
      // Verificar que el ID de la URL coincide con el guardado
      if (urlOrderId && data.orderId !== urlOrderId) {
        setNotFound(true);
        return;
      }
      setOrder(data);

      // ── Eventos de conversión ──────────────────────────────────────────────
      // Los eventos se disparan aquí, una sola vez al cargar la confirmación.
      // Descomentar cuando estén configurados los píxeles.

      // GA4 — page_view se dispara automáticamente por el router de Next.js.
      // Para evento de conversión personalizado:
      // if (typeof window !== "undefined" && window.gtag) {
      //   window.gtag("event", "purchase", {
      //     transaction_id: data.orderId,
      //     value: data.subtotal,
      //     currency: "USD",
      //     payment_type: data.paymentMethod,
      //   });
      // }

      // Meta Pixel — Purchase:
      // if (typeof window !== "undefined" && window.fbq) {
      //   window.fbq("track", "Purchase", {
      //     value: data.subtotal,
      //     currency: "USD",
      //     content_ids: [data.orderId],
      //     content_type: "product",
      //   });
      // }

      // Limpiar sessionStorage para que un refresh no re-dispare eventos
      // (opcional — si prefieres que la página persista en refresh, comenta esto)
      // sessionStorage.removeItem("sbuven_last_order");
    } catch {
      setNotFound(true);
    }
  }, [urlOrderId]);

  // ── Estado: no hay datos (acceso directo a la URL sin haber hecho checkout) ──
  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Orden no encontrada</h1>
        <p className="text-gray-500 text-sm max-w-xs">
          No encontramos los datos de este pedido en esta sesión. Si ya lo realizaste,
          revisa el mensaje que enviaste por WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push("/")}
            className="bg-[#1e3a8a] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1e2d6b] transition-colors text-sm"
          >
            Ir al catálogo
          </button>
          <a
            href="https://wa.me/584125383814"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition-colors text-sm text-center"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // ── Cargando ─────────────────────────────────────────────────────────────────
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Confirmación ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white px-4 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-bold text-lg">Catálogo SBUVEN</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Ícono y título */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">¡Pedido confirmado!</h2>
          <p className="text-gray-500">
            Hemos recibido tu pedido. Nos pondremos en contacto contigo pronto.
          </p>
        </div>

        {/* Tarjeta resumen */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="text-center border-b pb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Número de pedido</p>
            <p className="text-2xl font-bold text-[#1e3a8a] font-mono mt-1">{order.orderId}</p>
          </div>

          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente</span>
              <span className="font-medium">{order.nombre} {order.apellido}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cédula / RIF</span>
              <span className="font-medium font-mono">{order.cedula}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total USD</span>
              <span className="font-bold text-[#1e3a8a]">${order.subtotal.toFixed(2)}</span>
            </div>
            {order.isBsMethod && order.bcvRate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Total Bs (BCV)</span>
                <span className="font-bold text-[#1e3a8a]">
                  Bs. {formatBs(order.subtotal * order.bcvRate.tasa)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Envío</span>
              <span className="font-medium">{order.shippingLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Forma de pago</span>
              <span className="font-medium">{order.paymentLabel}</span>
            </div>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Próximos pasos:</p>
          <p>
            Haz clic en el botón de WhatsApp para enviarnos tu pedido completo al{" "}
            <strong>0412-5383814</strong>. Luego adjunta tu comprobante de pago para
            que procesemos tu orden.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={order.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-500 hover:bg-green-400 text-white font-bold py-4 px-4 rounded-xl transition-colors text-sm text-center flex items-center justify-center gap-2"
          >
            {/* WhatsApp icon */}
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar pedido por WhatsApp
          </a>
          <button
            onClick={() => router.push("/")}
            className="flex-1 bg-[#1e3a8a] hover:bg-[#1e2d6b] text-white font-bold py-4 px-4 rounded-xl transition-colors text-sm"
          >
            Ver más productos
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pt-2">
          Guarda tu número de pedido <strong className="text-gray-600">{order.orderId}</strong> para cualquier consulta.
        </p>
      </div>
    </div>
  );
}
