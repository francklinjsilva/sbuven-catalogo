"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Smartphone,
  DollarSign,
  CreditCard,
  Wallet,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "./CartProvider";
import type { CustomerInfo, PaymentMethod } from "@/lib/types";

type Step = "cart-review" | "customer" | "payment" | "confirmation";

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Smartphone;
  color: string;
}[] = [
  {
    id: "cashea",
    label: "Cashea",
    description: "Paga en cuotas en bolívares con la app Cashea",
    icon: Smartphone,
    color: "blue",
  },
  {
    id: "pago_movil",
    label: "Pago Móvil Bs",
    description: "Transferencia interbancaria en bolívares",
    icon: Wallet,
    color: "green",
  },
  {
    id: "transferencia_usd",
    label: "Transferencia USD",
    description: "Transferencia bancaria en dólares americanos",
    icon: DollarSign,
    color: "emerald",
  },
  {
    id: "efectivo_usd",
    label: "Efectivo / Tarjeta USD",
    description: "Pago presencial en efectivo o tarjeta internacional",
    icon: CreditCard,
    color: "amber",
  },
];

const PAYMENT_INSTRUCTIONS: Record<PaymentMethod, React.ReactNode> = {
  cashea: (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
      <p className="font-semibold text-blue-800 text-sm">Instrucciones Cashea</p>
      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
        <li>Descarga la app Cashea en tu teléfono</li>
        <li>Crea tu cuenta o inicia sesión</li>
        <li>Escanea el código QR o busca «SBUVEN» como comercio</li>
        <li>Selecciona el monto y el plan de cuotas</li>
        <li>Envíanos el comprobante por WhatsApp</li>
      </ol>
      <p className="text-xs text-blue-500 mt-2">
        📞 Soporte: 0412-5383814 (WhatsApp)
      </p>
      <div className="bg-blue-100 rounded-lg p-3 mt-2">
        <p className="text-xs text-blue-600 font-medium">
          ⚠️ Comercio: [PENDIENTE — completar con ID de Cashea]
        </p>
      </div>
    </div>
  ),
  pago_movil: (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
      <p className="font-semibold text-green-800 text-sm">Datos Pago Móvil</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-green-600 font-medium">Banco</dt>
        <dd className="text-green-800">[PENDIENTE — completar]</dd>
        <dt className="text-green-600 font-medium">Teléfono</dt>
        <dd className="text-green-800 font-mono">[PENDIENTE]</dd>
        <dt className="text-green-600 font-medium">RIF / Cédula</dt>
        <dd className="text-green-800 font-mono">[PENDIENTE]</dd>
        <dt className="text-green-600 font-medium">Titular</dt>
        <dd className="text-green-800">Sociedades Bíblicas</dd>
      </dl>
      <p className="text-xs text-green-600 mt-2">
        Luego de realizar el pago, envía el comprobante por WhatsApp.
      </p>
    </div>
  ),
  transferencia_usd: (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
      <p className="font-semibold text-emerald-800 text-sm">
        Datos Transferencia USD
      </p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-emerald-600 font-medium">Banco</dt>
        <dd className="text-emerald-800">[PENDIENTE — completar]</dd>
        <dt className="text-emerald-600 font-medium">Titular</dt>
        <dd className="text-emerald-800">Sociedades Bíblicas</dd>
        <dt className="text-emerald-600 font-medium">Cuenta / IBAN</dt>
        <dd className="text-emerald-800 font-mono text-xs">[PENDIENTE]</dd>
        <dt className="text-emerald-600 font-medium">SWIFT / BIC</dt>
        <dd className="text-emerald-800 font-mono">[PENDIENTE]</dd>
      </dl>
      <p className="text-xs text-emerald-600 mt-2">
        Envía el comprobante de transferencia por WhatsApp o email.
      </p>
    </div>
  ),
  efectivo_usd: (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
      <p className="font-semibold text-amber-800 text-sm">
        Pago Presencial / Tarjeta Internacional
      </p>
      <p className="text-sm text-amber-700">
        Puedes pagar en efectivo USD o con tarjeta internacional en nuestras
        oficinas. Contáctanos para coordinar la entrega:
      </p>
      <ul className="text-sm text-amber-700 space-y-1 mt-2">
        <li>📞 0412-5383814 (WhatsApp)</li>
        <li>📞 0412-5383824 (WhatsApp)</li>
      </ul>
      <p className="text-xs text-amber-500 mt-2">
        Un representante te confirmará la disponibilidad y coordinarás el pago.
      </p>
    </div>
  ),
};

function buildWhatsAppUrl(
  orderId: string,
  items: import("@/lib/types").CartItem[],
  subtotal: number,
  customer: CustomerInfo,
  paymentMethod: PaymentMethod
): string {
  const SEP = "━━━━━━━━━━━━━━━━━━━━";
  const fecha = new Date().toLocaleString("es-VE", {
    timeZone: "America/Caracas",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const paymentLabel =
    PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)?.label ?? paymentMethod;

  const itemsLines = items
    .map((i) => {
      const ref = i.product.precioFinal.toFixed(2);
      const sku = i.product.isbn || i.product.sku || i.product.id;
      return `• ${i.quantity}× ${i.product.nombre} — ISBN: ${sku} — $${ref}`;
    })
    .join("\n");

  const lines = [
    `📦 NUEVO PEDIDO — SBUV`,
    SEP,
    `📋 Resumen del Pedido`,
    ``,
    itemsLines,
    ``,
    SEP,
    `💰 Total: $${subtotal.toFixed(2)} USD`,
    `🔖 N° Pedido: ${orderId}`,
    SEP,
    ``,
    `👤 Datos del Cliente`,
    `• Nombre: ${customer.nombre} ${customer.apellido}`,
    `• Teléfono: ${customer.telefono}`,
    `• Email: ${customer.email}`,
    `• Ciudad: ${customer.ciudad}`,
    customer.direccion ? `• Dirección: ${customer.direccion}` : null,
    `• Pago: ${paymentLabel}`,
    customer.mensaje ? `` : null,
    customer.mensaje ? `📝 Notas: ${customer.mensaje}` : null,
    ``,
    `📅 ${fecha}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return `https://wa.me/584125383814?text=${encodeURIComponent(lines)}`;
}

function generateOrderId() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `SBU-${yy}${mm}${dd}-${rand}`;
}

export function CheckoutFlow() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>("cart-review");
  const [customer, setCustomer] = useState<CustomerInfo>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    ciudad: "",
    direccion: "",
    mensaje: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  // Snapshot para la pantalla de confirmación (el carrito ya fue limpiado)
  const [confirmedItems, setConfirmedItems] = useState(items);
  const [confirmedSubtotal, setConfirmedSubtotal] = useState(subtotal);

  const STEPS: Step[] = ["cart-review", "customer", "payment", "confirmation"];
  const stepIndex = STEPS.indexOf(step);
  const stepLabels = ["Resumen", "Datos", "Pago", "Confirmación"];

  async function submitOrder() {
    if (!paymentMethod) return;
    setLoading(true);
    setError("");
    const id = generateOrderId();

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          fecha: new Date().toISOString(),
          cliente: customer,
          items: items.map((i) => ({
            id: i.product.id,
            nombre: i.product.nombre,
            isbn: i.product.isbn,
            precio: i.product.precioFinal,
            cantidad: i.quantity,
            subtotal: i.product.precioFinal * i.quantity,
          })),
          subtotal,
          formaPago: paymentMethod,
          estado: "pendiente",
        }),
      });

      if (!res.ok) throw new Error("Error al guardar el pedido");
      setOrderId(id);
      setConfirmedItems(items);
      setConfirmedSubtotal(subtotal);
      clearCart();
      setStep("confirmation");
    } catch (err) {
      console.error(err);
      setError(
        "Hubo un error al procesar tu pedido. Por favor contáctanos por WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  }

  // Empty cart check
  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-8">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">
          Tu carrito está vacío
        </h2>
        <button
          onClick={() => router.push("/")}
          className="bg-[#1e3a8a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1e2d6b] transition-colors"
        >
          Ver catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white px-4 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => {
              if (step === "cart-review") router.push("/");
              else setStep(STEPS[stepIndex - 1]);
            }}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Finalizar pedido</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Step indicator */}
        {step !== "confirmation" && (
          <div className="flex items-center gap-0">
            {stepLabels.slice(0, 3).map((label, i) => (
              <div key={label} className="flex items-center flex-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < stepIndex
                        ? "bg-green-500 text-white"
                        : i === stepIndex
                        ? "bg-[#1e3a8a] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      i === stepIndex ? "text-[#1e3a8a]" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      i < stepIndex ? "bg-green-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Cart review */}
        {step === "cart-review" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              Resumen del pedido
            </h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-4 border-b last:border-b-0"
                >
                  <div className="relative w-14 h-18 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    {item.product.imagen && (
                      <Image
                        src={item.product.imagen}
                        alt={item.product.nombre}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                      {item.product.nombre}
                    </p>
                    {item.product.isbn && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        ISBN: {item.product.isbn}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#1e3a8a]">
                      ${(item.product.precioFinal * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ${item.product.precioFinal.toFixed(2)} c/u
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <span className="font-bold text-gray-700">Total</span>
                <span className="text-xl font-bold text-[#1e3a8a]">
                  ${subtotal.toFixed(2)} USD
                </span>
              </div>
            </div>
            <button
              onClick={() => setStep("customer")}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e2d6b] text-white font-bold py-4 rounded-xl transition-colors"
            >
              Continuar con mis datos →
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full text-gray-500 text-sm py-2 hover:underline"
            >
              ← Seguir comprando
            </button>
          </div>
        )}

        {/* STEP 2: Customer info */}
        {step === "customer" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Tus datos</h2>
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.nombre}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, nombre: e.target.value }))
                    }
                    placeholder="Juan"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.apellido}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, apellido: e.target.value }))
                    }
                    placeholder="Pérez"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, email: e.target.value }))
                  }
                  placeholder="juan@ejemplo.com"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={customer.telefono}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, telefono: e.target.value }))
                  }
                  placeholder="0412-1234567"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ciudad *
                </label>
                <input
                  type="text"
                  required
                  value={customer.ciudad}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, ciudad: e.target.value }))
                  }
                  placeholder="Caracas"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dirección de entrega
                </label>
                <input
                  type="text"
                  value={customer.direccion}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, direccion: e.target.value }))
                  }
                  placeholder="Av. Principal, Edif. Torre Norte, Piso 3, Ofic. 3-A"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Notas del pedido (opcional)
                </label>
                <textarea
                  value={customer.mensaje}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, mensaje: e.target.value }))
                  }
                  placeholder="Alguna instrucción especial para tu pedido..."
                  rows={3}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a] resize-none"
                />
              </div>
            </div>
            <button
              onClick={() => {
                if (!customer.nombre || !customer.email || !customer.telefono) {
                  alert(
                    "Por favor completa nombre, email y teléfono para continuar."
                  );
                  return;
                }
                setStep("payment");
              }}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e2d6b] text-white font-bold py-4 rounded-xl transition-colors"
            >
              Continuar al pago →
            </button>
          </div>
        )}

        {/* STEP 3: Payment */}
        {step === "payment" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              Selecciona tu forma de pago
            </h2>

            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selected
                        ? "border-[#1e3a8a] bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        selected ? "bg-[#1e3a8a] text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500">{opt.description}</p>
                    </div>
                    <div className="ml-auto">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selected
                            ? "border-[#1e3a8a] bg-[#1e3a8a]"
                            : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Payment instructions */}
            {paymentMethod && (
              <div className="mt-4">
                {PAYMENT_INSTRUCTIONS[paymentMethod as PaymentMethod]}
              </div>
            )}

            {/* Order summary mini */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Total a pagar ({items.length}{" "}
                {items.length === 1 ? "producto" : "productos"})
              </span>
              <span className="text-lg font-bold text-[#1e3a8a]">
                ${subtotal.toFixed(2)} USD
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              onClick={submitOrder}
              disabled={!paymentMethod || loading}
              className={`w-full font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                paymentMethod && !loading
                  ? "bg-amber-500 hover:bg-amber-400 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando pedido...
                </>
              ) : (
                "Confirmar pedido →"
              )}
            </button>
          </div>
        )}

        {/* STEP 4: Confirmation */}
        {step === "confirmation" && (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                ¡Pedido confirmado!
              </h2>
              <p className="text-gray-500 mt-2">
                Hemos recibido tu pedido. Nos pondremos en contacto contigo pronto.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm text-left space-y-3 max-w-sm mx-auto">
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Número de pedido
                </p>
                <p className="text-2xl font-bold text-[#1e3a8a] font-mono mt-1">
                  {orderId}
                </p>
              </div>
              <hr />
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente</span>
                  <span className="font-medium">
                    {customer.nombre} {customer.apellido}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-xs">{customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-[#1e3a8a]">
                    ${subtotal.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Forma de pago</span>
                  <span className="font-medium capitalize">
                    {PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)?.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 max-w-sm mx-auto">
              <p className="font-semibold mb-1">Próximos pasos:</p>
              <p>
                Haz clic en el botón de WhatsApp para enviarnos tu pedido completo al{" "}
                <strong>0412-5383814</strong>. Luego adjunta tu comprobante de pago.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <a
                href={buildWhatsAppUrl(orderId, confirmedItems, confirmedSubtotal, customer, paymentMethod as PaymentMethod)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm text-center flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar pedido por WhatsApp
              </a>
              <button
                onClick={() => router.push("/")}
                className="flex-1 bg-[#1e3a8a] hover:bg-[#1e2d6b] text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
              >
                Ver más productos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
