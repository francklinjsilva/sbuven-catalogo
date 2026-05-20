import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdenConfirmadaClient } from "@/components/OrdenConfirmadaClient";

// Título en tab del navegador: "Orden Confirmada | SBUVEN Venezuela"
export const metadata: Metadata = {
  title: "Orden Confirmada",
  description: "Tu pedido en el Catálogo SBUVEN ha sido confirmado. Revisa el resumen y envíanos tu comprobante por WhatsApp.",
  // No indexar páginas de confirmación — no tienen valor SEO y exponen datos de sesión
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdenConfirmadaPage() {
  return (
    // Suspense requerido porque OrdenConfirmadaClient usa useSearchParams()
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrdenConfirmadaClient />
    </Suspense>
  );
}
