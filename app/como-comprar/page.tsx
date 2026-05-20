import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  ClipboardList,
  Truck,
  CreditCard,
  CheckCircle,
  MessageCircle,
  Phone,
  MapPin,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cómo Comprar",
  description:
    "Aprende a comprar en el Catálogo SBUVEN paso a paso. Busca tu Biblia, agrégala al carrito y recíbela en todo Venezuela con MRW, Zoom o Delivery. Pago Móvil, Cashea y más.",
};

// ── Pasos del proceso de compra ────────────────────────────────────────────────
const steps = [
  {
    num: 1,
    icon: Search,
    color: "#1E3A8A",
    accent: "#dbeafe",
    border: "#93c5fd",
    title: "Explora el catálogo",
    description:
      "Navega por más de 200 productos: Biblias, literatura cristiana, material infantil y devocionales. Usa el buscador para encontrar por nombre, ISBN o categoría.",
    tips: [
      "Filtra por categoría en la barra lateral",
      "Haz clic en cualquier producto para ver todos los detalles",
      "El precio siempre se muestra en USD",
    ],
  },
  {
    num: 2,
    icon: ShoppingCart,
    color: "#065f46",
    accent: "#d1fae5",
    border: "#6ee7b7",
    title: "Agrega al carrito",
    description:
      'Selecciona los productos que deseas y haz clic en "Agregar al carrito". Puedes agregar varios artículos antes de proceder al pago.',
    tips: [
      "Puedes cambiar la cantidad en el carrito",
      "El ícono del carrito (🛒) en la esquina superior derecha muestra cuántos artículos tienes",
      'Haz clic en "Finalizar pedido" cuando estés listo',
    ],
  },
  {
    num: 3,
    icon: ClipboardList,
    color: "#92400e",
    accent: "#fef3c7",
    border: "#fcd34d",
    title: "Completa tus datos",
    description:
      "Llena el formulario con tu información personal: nombre, cédula o RIF, email, teléfono y dirección de entrega (estado, municipio, calle y punto de referencia).",
    tips: [
      "Todos los campos marcados con * son obligatorios",
      "Tu dirección completa es necesaria para coordinar el envío",
      "Revisa bien tu número de WhatsApp — te contactaremos por ahí",
    ],
  },
  {
    num: 4,
    icon: Truck,
    color: "#4c1d95",
    accent: "#ede9fe",
    border: "#c4b5fd",
    title: "Elige cómo recibir tu pedido",
    description:
      "Selecciona la opción de envío que más te convenga según tu ubicación.",
    tips: [
      "MRW — Encomienda nacional a cualquier ciudad de Venezuela",
      "Zoom — Encomienda nacional con cobertura amplia",
      "Delivery Caracas — Envío a domicilio en Caracas (se coordina por WhatsApp)",
      "Retiro en tienda — Visítanos en La Urbina, Caracas (sin costo de envío)",
    ],
  },
  {
    num: 5,
    icon: CreditCard,
    color: "#065f46",
    accent: "#d1fae5",
    border: "#6ee7b7",
    title: "Selecciona tu forma de pago",
    description:
      "Ofrecemos varias opciones de pago en bolívares y dólares para tu comodidad.",
    tips: [
      "Pago Móvil Bs — Transferencia interbancaria en bolívares",
      "Transferencia Bs — Depósito bancario en bolívares",
      "Cashea — Financia tu compra en cuotas en bolívares",
      "Efectivo USD o Bs — Solo disponible en tienda",
      "Débito / Crédito — Solo disponible en tienda",
    ],
  },
  {
    num: 6,
    icon: CheckCircle,
    color: "#1E3A8A",
    accent: "#dbeafe",
    border: "#93c5fd",
    title: "Confirma tu pedido",
    description:
      'Haz clic en "Confirmar pedido". El sistema genera automáticamente un número de orden único (ej: SBU-260520-7546) y te muestra el total en USD y en bolívares a la tasa BCV del momento.',
    tips: [
      "Guarda tu número de pedido — lo necesitarás para cualquier consulta",
      'Haz clic en el botón verde "Enviar por WhatsApp" para notificarnos',
      "Luego envía el comprobante de pago al mismo número de WhatsApp",
    ],
  },
];

// ── Formas de pago ─────────────────────────────────────────────────────────────
const paymentMethods = [
  {
    icon: "📱",
    name: "Pago Móvil",
    desc: "Transferencia interbancaria en bolívares desde tu banco",
    badge: "Bs",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: "🏦",
    name: "Transferencia Bs",
    desc: "Depósito o transferencia bancaria en bolívares",
    badge: "Bs",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: "📲",
    name: "Cashea",
    desc: "Financia tu compra en cuotas cómodas en bolívares",
    badge: "Cuotas Bs",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    icon: "💵",
    name: "Efectivo USD",
    desc: "Pago en dólares en efectivo directamente en tienda",
    badge: "En tienda",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    icon: "💰",
    name: "Efectivo Bs",
    desc: "Pago en bolívares en efectivo directamente en tienda",
    badge: "En tienda",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    icon: "💳",
    name: "Débito / Crédito",
    desc: "Tarjeta de débito o crédito en nuestro punto de venta",
    badge: "En tienda",
    badgeColor: "bg-green-100 text-green-700",
  },
];

// ── Preguntas frecuentes del cliente ──────────────────────────────────────────
const faqs = [
  {
    q: "¿Cuánto tarda en llegar mi pedido?",
    a: "Depende de la forma de envío. MRW y Zoom generalmente entregan en 2–5 días hábiles a nivel nacional. El Delivery en Caracas se coordina el mismo día o al día siguiente. El retiro en tienda es inmediato.",
  },
  {
    q: "¿Los precios son en dólares o bolívares?",
    a: "Los precios del catálogo están en USD. Al seleccionar una forma de pago en bolívares, el sistema calcula automáticamente el equivalente en Bs usando la tasa oficial del BCV en tiempo real.",
  },
  {
    q: "¿Cómo envío el comprobante de pago?",
    a: "Una vez confirmado tu pedido, te redirigimos a un botón para enviar tu pedido por WhatsApp al 0412-5383814. Desde ese mismo chat, adjunta la captura de pantalla de tu comprobante de pago.",
  },
  {
    q: "¿Puedo pedir varios productos en un solo pedido?",
    a: "Sí. Agrega todos los productos que desees al carrito antes de finalizar el pedido. Solo se genera un número de orden y se coordina un solo envío.",
  },
  {
    q: "¿Qué pasa si un producto aparece agotado?",
    a: 'Si un producto aparece como "Agotado", lamentablemente no está disponible en este momento. Contáctanos por WhatsApp para consultar disponibilidad próxima.',
  },
  {
    q: "¿Puedo modificar mi pedido después de confirmarlo?",
    a: "Contáctanos lo antes posible por WhatsApp al 0412-5383814 indicando tu número de pedido. Si aún no ha sido procesado, podemos hacer ajustes.",
  },
  {
    q: "¿Tienen factura o comprobante de compra?",
    a: "Sí. Si necesitas factura, indícalo en las notas de tu pedido o comunícalo por WhatsApp al confirmar el pago.",
  },
];

// ── Componente FAQ con accordeon (client-side toggle en server component) ──────
// Para este componente usaremos un summary/details nativo (sin JS) ─────────────

export default function ComoPaginarPage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-[#1e3a8a] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Volver al catálogo"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">Cómo comprar</h1>
            <p className="text-blue-200 text-xs">Catálogo SBUVEN · Guía paso a paso</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3 pt-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Compra tu Biblia en 6 pasos simples
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Realizamos envíos a todo Venezuela. Elige la forma de pago que más
            te convenga y recibe tu pedido en la puerta de tu casa.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Ir al catálogo
          </Link>
        </div>

        {/* ── Pasos ───────────────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            El proceso de compra
          </h3>
          <div className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white rounded-2xl border overflow-hidden shadow-sm"
                  style={{ borderColor: step.border }}
                >
                  {/* Cabecera del paso */}
                  <div
                    className="px-5 py-4 flex items-center gap-4"
                    style={{ background: step.accent, borderBottom: `1px solid ${step.border}` }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: step.color }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: step.color }}
                      >
                        Paso {step.num}
                      </span>
                      <h4 className="font-bold text-gray-800 leading-tight">{step.title}</h4>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-sm text-gray-600">{step.description}</p>
                    <ul className="space-y-1.5">
                      {step.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span
                            className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                            style={{ background: step.color }}
                          />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Formas de pago ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-100 border-b border-slate-200">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#1e3a8a]" />
              Formas de pago disponibles
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paymentMethods.map((pm) => (
              <div
                key={pm.name}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50"
              >
                <span className="text-2xl shrink-0">{pm.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-800">{pm.name}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pm.badgeColor}`}>
                      {pm.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-4">
            <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              💱 Los pagos en bolívares se calculan automáticamente con la tasa oficial BCV al momento del pedido.
            </p>
          </div>
        </section>

        {/* ── Envío ───────────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-100 border-b border-slate-200">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1e3a8a]" />
              Opciones de envío
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              {
                icon: "📦",
                name: "MRW",
                desc: "Encomienda nacional. Cobertura en toda Venezuela.",
                detail: "2–5 días hábiles · Costo según peso y destino",
              },
              {
                icon: "📦",
                name: "Zoom",
                desc: "Encomienda nacional con amplia cobertura.",
                detail: "2–5 días hábiles · Costo según peso y destino",
              },
              {
                icon: "🛵",
                name: "Delivery Caracas",
                desc: "Envío a domicilio dentro de Caracas.",
                detail: "Mismo día o siguiente · Costo según zona (se coordina por WhatsApp)",
              },
              {
                icon: "🏪",
                name: "Retiro en tienda",
                desc: "Retira tu pedido sin costo de envío en La Urbina, Caracas.",
                detail: "Disponible de lunes a viernes · Coordina horario por WhatsApp",
              },
            ].map((opt) => (
              <div key={opt.name} className="px-5 py-4 flex gap-3">
                <span className="text-2xl shrink-0">{opt.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{opt.name}</p>
                  <p className="text-sm text-gray-600">{opt.desc}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-100 border-b border-slate-200">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-[#1e3a8a]" />
              Preguntas frecuentes
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-start justify-between gap-4 px-5 py-4 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-gray-800">{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Contacto ────────────────────────────────────────────────────────── */}
        <section className="bg-[#1e3a8a] rounded-2xl p-6 text-white text-center space-y-4">
          <h3 className="font-bold text-lg">¿Tienes alguna duda?</h3>
          <p className="text-blue-200 text-sm">
            Escríbenos por WhatsApp y te atendemos con gusto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/584125383814"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp 0412-538-3814
            </a>
            <a
              href="https://wa.me/584125383824"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              WhatsApp 0412-538-3824
            </a>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-blue-200 mt-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Tienda: Urbanización La Urbina, Caracas · Lunes a viernes</span>
          </div>
        </section>

        {/* ── CTA final ───────────────────────────────────────────────────────── */}
        <div className="text-center pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            ¡Comenzar a comprar!
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            catalogo.sociedadesbiblicas.org.ve · Catálogo oficial SBUVEN
          </p>
        </div>

      </div>
    </div>
  );
}
