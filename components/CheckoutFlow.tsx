"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Smartphone,
  DollarSign,
  CreditCard,
  Wallet,
  Loader2,
  ShoppingBag,
  RefreshCw,
  TrendingUp,
  Package,
  Truck,
  Store,
} from "lucide-react";
import { useCart } from "./CartProvider";
import type { CustomerInfo, PaymentMethod, ShippingMethod } from "@/lib/types";

type Step = "cart-review" | "customer" | "envio" | "payment";

const BS_METHODS: PaymentMethod[] = ["cashea", "pago_movil", "transferencia_bs", "efectivo_bs"];

// ─── Documentos de identidad Venezuela ──────────────────────────────────────
const DOC_TYPES = [
  { value: "V", label: "V — Venezolano" },
  { value: "E", label: "E — Extranjero" },
  { value: "J", label: "J — Jurídico (RIF)" },
  { value: "G", label: "G — Gobierno" },
  { value: "P", label: "P — Pasaporte" },
  { value: "C", label: "C — Comunidad/Consorcio" },
];

// ─── Estados de Venezuela ────────────────────────────────────────────────────
const ESTADOS_VENEZUELA = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Dependencias Federales",
  "Distrito Capital", "Falcón", "Guárico", "La Guaira", "Lara",
  "Mérida", "Miranda", "Monagas", "Nueva Esparta", "Portuguesa",
  "Sucre", "Táchira", "Trujillo", "Yaracuy", "Zulia",
];

// ─── Datos bancarios ─────────────────────────────────────────────────────────
const BANCOS_PAGO_MOVIL = [
  { id: "bdv", nombre: "Banco de Venezuela", codigo: "0102", rif: "J-30721039-7", telefono: "0412-5383870" },
  { id: "banesco", nombre: "Banesco", codigo: "0134", rif: "J-30721039-7", telefono: "0412-2461128" },
  { id: "bnc", nombre: "BNC", codigo: "0191", rif: "J-30721039-7", telefono: "0412-2461128" },
];

const BANCOS_TRANSFERENCIA = [
  {
    id: "bdv",
    nombre: "Banco de Venezuela",
    cuenta: "0102-0127-6100-0539-0375",
    tipo: "Cuenta Corriente",
    rif: "J-30721039-7",
    titular: "SOCIEDADES BÍBLICAS UNIDAS EN VENEZUELA",
  },
  {
    id: "banesco",
    nombre: "Banco Banesco",
    cuenta: "0134-0056-3705-6102-4839",
    tipo: "Cuenta Corriente",
    rif: "J-30721039-7",
    titular: "SOCIEDADES BÍBLICAS UNIDAS EN VENEZUELA",
  },
  {
    id: "bnc",
    nombre: "Banco Nacional de Crédito",
    cuenta: "0191-0514-8421-00009860",
    tipo: "Cuenta Corriente",
    rif: "J-30721039-7",
    titular: "SOCIEDADES BÍBLICAS UNIDAS EN VENEZUELA",
  },
];

// ─── Opciones de pago ─────────────────────────────────────────────────────────
const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Smartphone;
  badge?: string;
}[] = [
  { id: "cashea",         label: "Cashea",                    description: "Financiamiento en cuotas en bolívares",         icon: Smartphone, badge: "Bs" },
  { id: "pago_movil",     label: "Pago Móvil Bs",             description: "Transferencia interbancaria en bolívares",       icon: Wallet,     badge: "Bs" },
  { id: "transferencia_bs", label: "Transferencia Bs",        description: "Transferencia bancaria en bolívares",           icon: TrendingUp, badge: "Bs" },
  { id: "efectivo_bs",    label: "Efectivo Bs (en tienda)",   description: "Pago presencial en bolívares en nuestra tienda", icon: Wallet,     badge: "Bs" },
  { id: "efectivo_usd",   label: "Efectivo USD (en tienda)",  description: "Efectivo en dólares en nuestra tienda",          icon: DollarSign, badge: "USD" },
  { id: "tarjeta_tienda", label: "Débito / Crédito (en tienda)", description: "Tarjeta de débito o crédito en nuestra tienda", icon: CreditCard, badge: "Bs/USD" },
];

// ─── Opciones de envío ────────────────────────────────────────────────────────
const SHIPPING_OPTIONS: {
  id: ShippingMethod;
  label: string;
  description: string;
  icon: typeof Truck;
}[] = [
  { id: "paqueteria_mrw",    label: "MRW",                    description: "Encomienda nacional vía MRW",                          icon: Package },
  { id: "paqueteria_zoom",   label: "Zoom",                   description: "Encomienda nacional vía Zoom",                         icon: Package },
  { id: "delivery_caracas",  label: "Delivery Caracas",       description: "Envío a domicilio en Caracas (costo según zona, se coordina por WhatsApp)", icon: Truck },
  { id: "retiro_tienda",     label: "Retiro en tienda",       description: "Retira tu pedido en nuestra tienda — Urbina, Caracas", icon: Store },
];

// ─── BCV ──────────────────────────────────────────────────────────────────────
interface BCVRate { tasa: number; fuente: string; actualizacion: string; }

function useBCVRate() {
  const [rate, setRate] = useState<BCVRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchRate = async () => {
    setLoading(true); setError(false);
    try {
      const res = await fetch("/api/bcv-rate");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.tasa) setRate(data as BCVRate); else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRate(); }, []);
  return { rate, loading, error, refetch: fetchRate };
}

function formatBs(n: number) {
  return n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function BCVWidget({ subtotal, rate, loading, error, refetch }: {
  subtotal: number; rate: BCVRate | null; loading: boolean; error: boolean; refetch: () => void;
}) {
  if (loading) return (
    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
      <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Consultando tasa BCV…
    </div>
  );
  if (error || !rate) return (
    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-3">
      <p className="text-xs text-red-600">No se pudo obtener la tasa BCV. Se calculará al confirmar.</p>
      <button onClick={refetch} className="ml-2 shrink-0 text-red-500 hover:text-red-700"><RefreshCw className="w-4 h-4" /></button>
    </div>
  );
  const montoBS = subtotal * rate.tasa;
  const fecha = new Date(rate.actualizacion).toLocaleString("es-VE", {
    timeZone: "America/Caracas", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
  return (
    <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">Equivalente en Bs (tasa BCV)</span>
        <button onClick={refetch} title="Actualizar" className="text-[#1e3a8a]/50 hover:text-[#1e3a8a]"><RefreshCw className="w-3.5 h-3.5" /></button>
      </div>
      <p className="text-2xl font-bold text-[#1e3a8a]">Bs. {formatBs(montoBS)}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Tasa BCV: <strong>Bs. {formatBs(rate.tasa)} / $1</strong></span>
        <span>Actualizada: {fecha}</span>
      </div>
    </div>
  );
}

// ─── WhatsApp message builder ─────────────────────────────────────────────────
function buildWhatsAppUrl(
  orderId: string,
  items: import("@/lib/types").CartItem[],
  subtotal: number,
  customer: CustomerInfo,
  paymentMethod: PaymentMethod,
  shippingMethod: ShippingMethod | "",
  bcvRate?: BCVRate | null
): string {
  const SEP = "━━━━━━━━━━━━━━━━━━━━";
  const fecha = new Date().toLocaleString("es-VE", {
    timeZone: "America/Caracas", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const payLabel = PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)?.label ?? paymentMethod;
  const shipLabel = SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)?.label ?? shippingMethod;
  const isBs = BS_METHODS.includes(paymentMethod);

  const itemsLines = items.map((i) =>
    `• ${i.quantity}× ${i.product.nombre} — ISBN: ${i.product.isbn || i.product.id} — $${i.product.precioFinal.toFixed(2)}`
  ).join("\n");

  const totalLine = isBs && bcvRate
    ? `💰 Total: $${subtotal.toFixed(2)} USD\n💵 Equiv. Bs.: ${formatBs(subtotal * bcvRate.tasa)} Bs\n   (Tasa BCV: ${formatBs(bcvRate.tasa)} Bs/$ — ${new Date(bcvRate.actualizacion).toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" })})`
    : `💰 Total: $${subtotal.toFixed(2)} USD`;

  const direccionCompleta = [
    customer.estado, customer.municipio, customer.direccion,
  ].filter(Boolean).join(", ");

  const lines = [
    `📦 NUEVO PEDIDO — SBUVEN`,
    SEP,
    `📋 Resumen del Pedido`,
    ``,
    itemsLines,
    ``,
    SEP,
    totalLine,
    `🔖 N° Pedido: ${orderId}`,
    SEP,
    ``,
    `👤 Datos del Cliente`,
    `• Nombre: ${customer.nombre} ${customer.apellido}`,
    customer.cedula ? `• Cédula/RIF: ${customer.cedula}` : null,
    `• Teléfono: ${customer.telefono}`,
    `• Email: ${customer.email}`,
    direccionCompleta ? `• Dirección: ${direccionCompleta}` : null,
    customer.puntoReferencia ? `• Ref.: ${customer.puntoReferencia}` : null,
    `• Envío: ${shipLabel}`,
    `• Pago: ${payLabel}`,
    customer.mensaje ? `` : null,
    customer.mensaje ? `📝 Notas: ${customer.mensaje}` : null,
    ``,
    `📅 ${fecha}`,
  ].filter((l) => l !== null).join("\n");

  return `https://wa.me/584125383814?text=${encodeURIComponent(lines)}`;
}

function generateOrderId() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `SBU-${yy}${mm}${dd}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

// ─── Componente banco selector (pago móvil) ───────────────────────────────────
function PagoMovilSelector({ selected, onSelect }: {
  selected: string; onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
      <p className="font-semibold text-green-800 text-sm">Selecciona el banco para Pago Móvil</p>
      <div className="space-y-2">
        {BANCOS_PAGO_MOVIL.map((banco) => (
          <button
            key={banco.id}
            type="button"
            onClick={() => onSelect(banco.id)}
            className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
              selected === banco.id ? "border-green-500 bg-white" : "border-gray-200 bg-white hover:border-green-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">{banco.nombre} ({banco.codigo})</span>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected === banco.id ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
                {selected === banco.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            {selected === banco.id && (
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <dt className="text-green-600 font-medium">RIF</dt>
                <dd className="text-green-800 font-mono">{banco.rif}</dd>
                <dt className="text-green-600 font-medium">Teléfono</dt>
                <dd className="text-green-800 font-mono">{banco.telefono}</dd>
              </dl>
            )}
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-xs text-green-600">Envía el comprobante por WhatsApp luego del pago.</p>
      )}
    </div>
  );
}

// ─── Componente banco selector (transferencia) ────────────────────────────────
function TransferenciaSelector({ selected, onSelect }: {
  selected: string; onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
      <p className="font-semibold text-teal-800 text-sm">Selecciona el banco para Transferencia</p>
      <div className="space-y-2">
        {BANCOS_TRANSFERENCIA.map((banco) => (
          <button
            key={banco.id}
            type="button"
            onClick={() => onSelect(banco.id)}
            className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
              selected === banco.id ? "border-teal-500 bg-white" : "border-gray-200 bg-white hover:border-teal-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">{banco.nombre}</span>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected === banco.id ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                {selected === banco.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            {selected === banco.id && (
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <dt className="text-teal-600 font-medium">Tipo</dt>
                <dd className="text-teal-800">{banco.tipo}</dd>
                <dt className="text-teal-600 font-medium">N° Cuenta</dt>
                <dd className="text-teal-800 font-mono">{banco.cuenta}</dd>
                <dt className="text-teal-600 font-medium">RIF</dt>
                <dd className="text-teal-800 font-mono">{banco.rif}</dd>
                <dt className="text-teal-600 font-medium">Titular</dt>
                <dd className="text-teal-800 text-xs col-span-1">{banco.titular}</dd>
              </dl>
            )}
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-xs text-teal-600">Envía el comprobante por WhatsApp luego de la transferencia.</p>
      )}
    </div>
  );
}

// ─── Instrucciones por método (sin banco selector — esos van en el componente) ──
function CasheaInstructions() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
      <p className="font-semibold text-blue-800 text-sm">Instrucciones Cashea</p>
      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
        <li>Debes tener la app Cashea en tu teléfono</li>
        <li>Crea tu cuenta o inicia sesión</li>
        <li>Recibirás un enlace para concretar tu pago por WhatsApp al confirmar tu pedido</li>
        <li>Si vienes a tienda podrás escanear el QR para culminar tu pedido</li>
        <li>Selecciona el monto y el plan de cuotas</li>
        <li>Envíanos el comprobante por WhatsApp</li>
      </ol>
      <p className="text-xs text-blue-500 mt-1">📞 Soporte: 0412-5383814</p>
      <div className="bg-blue-100 rounded-lg p-3 mt-1">
        <p className="text-xs text-blue-700 font-medium">
          ⚠️ Comercio: Al confirmar tu pedido te enviaremos el enlace de pago o podrás concretar por QR en Tienda
        </p>
      </div>
    </div>
  );
}

function EnTiendaInstructions({ titulo }: { titulo: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
      <p className="font-semibold text-amber-800 text-sm">{titulo} — Pago en Tienda</p>
      <p className="text-sm text-amber-700">
        Visítanos en nuestra tienda ubicada en la <strong>Urbina, Caracas</strong>. El monto exacto se confirma al momento del pago.
      </p>
      <ul className="text-sm text-amber-700 space-y-1 mt-1">
        <li>📞 0412-5383814 (WhatsApp)</li>
        <li>📞 0412-5383824 (WhatsApp)</li>
      </ul>
      <p className="text-xs text-amber-600 mt-1">Contáctanos para coordinar horario y disponibilidad.</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CheckoutFlow() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const { rate: bcvRate, loading: bcvLoading, error: bcvError, refetch: bcvRefetch } = useBCVRate();

  const [step, setStep] = useState<Step>("cart-review");

  // Customer fields
  const [docTipo, setDocTipo] = useState("V");
  const [docNumero, setDocNumero] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [detalle, setDetalle] = useState("");
  const [puntoReferencia, setPuntoReferencia] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Shipping
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | "">("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [bankPagoMovil, setBankPagoMovil] = useState("");
  const [bankTransferencia, setBankTransferencia] = useState("");

  // Order submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const STEPS: Step[] = ["cart-review", "customer", "envio", "payment"];
  const stepIndex = STEPS.indexOf(step);
  const stepLabels = ["Resumen", "Datos", "Envío", "Pago"];

  const buildCustomer = (): CustomerInfo => ({
    nombre,
    apellido,
    cedula: docNumero ? `${docTipo}-${docNumero}` : "",
    email,
    telefono,
    estado,
    municipio,
    direccion: detalle,
    puntoReferencia,
    ciudad: [estado, municipio].filter(Boolean).join(", "),
    envio: SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)?.label ?? shippingMethod,
    mensaje,
  });

  async function submitOrder() {
    if (!paymentMethod || !shippingMethod) return;
    setLoading(true);
    setError("");
    const id = generateOrderId();
    const customer = buildCustomer();

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
          envio: shippingMethod,
          estado: "pendiente",
        }),
      });

      if (!res.ok) throw new Error("Error al guardar el pedido");

      // Guardar datos en sessionStorage para que la página /orden-confirmada los lea
      const confirmationData = {
        orderId: id,
        nombre,
        apellido,
        cedula: `${docTipo}-${docNumero}`,
        subtotal,
        bcvRate,
        paymentMethod,
        shippingMethod,
        isBsMethod: BS_METHODS.includes(paymentMethod as PaymentMethod),
        paymentLabel: PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)?.label ?? paymentMethod,
        shippingLabel: SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)?.label ?? shippingMethod,
        whatsappUrl: buildWhatsAppUrl(id, items, subtotal, customer, paymentMethod as PaymentMethod, shippingMethod, bcvRate),
        fecha: new Date().toISOString(),
      };
      sessionStorage.setItem("sbuven_last_order", JSON.stringify(confirmationData));

      clearCart();
      router.push(`/orden-confirmada?id=${id}`);
    } catch (err) {
      console.error(err);
      setError("Hubo un error al procesar tu pedido. Por favor contáctanos por WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]";
  const labelClass = "text-xs font-semibold text-gray-500 uppercase tracking-wider";

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-8">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">Tu carrito está vacío</h2>
        <button onClick={() => router.push("/")} className="bg-[#1e3a8a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1e2d6b] transition-colors">
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
        <div className="flex items-center gap-0">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < stepIndex ? "bg-green-500 text-white" : i === stepIndex ? "bg-[#1e3a8a] text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === stepIndex ? "text-[#1e3a8a]" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < stepIndex ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── PASO 1: Resumen del carrito ────────────────────────────────── */}
        {step === "cart-review" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Resumen del pedido</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 p-4 border-b last:border-b-0">
                  <div className="relative w-14 h-18 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    {item.product.imagen && (
                      <Image src={item.product.imagen} alt={item.product.nombre} fill sizes="56px" className="object-contain p-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.product.nombre}</p>
                    {item.product.isbn && <p className="text-xs text-gray-400 mt-0.5">ISBN: {item.product.isbn}</p>}
                    <p className="text-xs text-gray-500 mt-1">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#1e3a8a]">${(item.product.precioFinal * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">${item.product.precioFinal.toFixed(2)} c/u</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <span className="font-bold text-gray-700">Total</span>
                <span className="text-xl font-bold text-[#1e3a8a]">${subtotal.toFixed(2)} USD</span>
              </div>
            </div>
            <button onClick={() => setStep("customer")} className="w-full bg-[#1e3a8a] hover:bg-[#1e2d6b] text-white font-bold py-4 rounded-xl transition-colors">
              Continuar con mis datos →
            </button>
            <button onClick={() => router.push("/")} className="w-full text-gray-500 text-sm py-2 hover:underline">
              ← Seguir comprando
            </button>
          </div>
        )}

        {/* ── PASO 2: Datos del cliente ──────────────────────────────────── */}
        {step === "customer" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Tus datos</h2>
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">

              {/* Nombre y apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Juan" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Apellido *</label>
                  <input type="text" required value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Pérez" className={inputClass} />
                </div>
              </div>

              {/* Cédula / RIF */}
              <div>
                <label className={labelClass}>Cédula / RIF *</label>
                <div className="mt-1 flex gap-2">
                  <select
                    value={docTipo}
                    onChange={(e) => setDocTipo(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a] bg-white min-w-[80px]"
                  >
                    {DOC_TYPES.map((d) => (
                      <option key={d.value} value={d.value}>{d.value}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={docNumero}
                    onChange={(e) => setDocNumero(e.target.value)}
                    placeholder={docTipo === "J" ? "30721039-7" : "15761983"}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {DOC_TYPES.find((d) => d.value === docTipo)?.label} — ej: {docTipo === "J" ? `${docTipo}-30721039-7` : `${docTipo}-15761983`}
                </p>
              </div>

              {/* Email y teléfono */}
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@ejemplo.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono / WhatsApp *</label>
                <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="0412-1234567" className={inputClass} />
              </div>

              {/* Dirección estructurada */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Dirección de entrega</p>

                <div>
                  <label className={labelClass}>Estado *</label>
                  <select
                    required
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className={inputClass + " bg-white"}
                  >
                    <option value="">— Selecciona un estado —</option>
                    {ESTADOS_VENEZUELA.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Municipio</label>
                  <input type="text" value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="Sucre, Chacao, Libertador…" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Calle / Urbanización / Edificio / N° de casa</label>
                  <input
                    type="text"
                    value={detalle}
                    onChange={(e) => setDetalle(e.target.value)}
                    placeholder="Av. Francisco de Miranda, Edif. Centro Lido, Piso 4, Ofic. 4-B"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Punto de referencia</label>
                  <input
                    type="text"
                    value={puntoReferencia}
                    onChange={(e) => setPuntoReferencia(e.target.value)}
                    placeholder="Frente al Centro Comercial…, al lado de…"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className={labelClass}>Notas adicionales (opcional)</label>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Alguna instrucción especial para tu pedido…"
                  rows={3}
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>
            <button
              onClick={() => {
                if (!nombre || !email || !telefono || !docNumero || !estado) {
                  alert("Por favor completa nombre, cédula/RIF, email, teléfono y estado.");
                  return;
                }
                setStep("envio");
              }}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e2d6b] text-white font-bold py-4 rounded-xl transition-colors"
            >
              Continuar al envío →
            </button>
          </div>
        )}

        {/* ── PASO 3: Forma de envío ─────────────────────────────────────── */}
        {step === "envio" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Forma de envío</h2>
            <div className="space-y-3">
              {SHIPPING_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = shippingMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setShippingMethod(opt.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selected ? "border-[#1e3a8a] bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selected ? "bg-[#1e3a8a] text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-[#1e3a8a] bg-[#1e3a8a]" : "border-gray-300"}`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Nota adicional para delivery */}
            {shippingMethod === "delivery_caracas" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">📦 Delivery en Caracas</p>
                <p>El costo de envío varía según la zona y se coordina directamente con el servicio de delivery. Al confirmar tu pedido te contactaremos por WhatsApp para coordinar.</p>
              </div>
            )}

            <button
              onClick={() => {
                if (!shippingMethod) { alert("Por favor selecciona una forma de envío."); return; }
                setStep("payment");
              }}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e2d6b] text-white font-bold py-4 rounded-xl transition-colors"
            >
              Continuar al pago →
            </button>
          </div>
        )}

        {/* ── PASO 4: Forma de pago ──────────────────────────────────────── */}
        {step === "payment" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Selecciona tu forma de pago</h2>

            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selected ? "border-[#1e3a8a] bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selected ? "bg-[#1e3a8a] text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.description}</p>
                    </div>
                    {opt.badge && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opt.badge === "Bs" ? "bg-blue-100 text-blue-700" : opt.badge === "USD" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                        {opt.badge}
                      </span>
                    )}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-[#1e3a8a] bg-[#1e3a8a]" : "border-gray-300"}`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instrucciones según método */}
            {paymentMethod === "cashea" && <CasheaInstructions />}
            {paymentMethod === "pago_movil" && (
              <PagoMovilSelector selected={bankPagoMovil} onSelect={setBankPagoMovil} />
            )}
            {paymentMethod === "transferencia_bs" && (
              <TransferenciaSelector selected={bankTransferencia} onSelect={setBankTransferencia} />
            )}
            {paymentMethod === "efectivo_bs" && <EnTiendaInstructions titulo="Efectivo en Bolívares" />}
            {paymentMethod === "efectivo_usd" && <EnTiendaInstructions titulo="Efectivo en Dólares" />}
            {paymentMethod === "tarjeta_tienda" && <EnTiendaInstructions titulo="Débito / Crédito" />}

            {/* Widget BCV — solo métodos en Bs */}
            {paymentMethod && BS_METHODS.includes(paymentMethod as PaymentMethod) && (
              <BCVWidget subtotal={subtotal} rate={bcvRate} loading={bcvLoading} error={bcvError} refetch={bcvRefetch} />
            )}

            {/* Resumen mini */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-600">Total ({items.length} {items.length === 1 ? "producto" : "productos"})</span>
              <span className="text-lg font-bold text-[#1e3a8a]">${subtotal.toFixed(2)} USD</span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>
            )}

            <button
              onClick={submitOrder}
              disabled={!paymentMethod || loading}
              className={`w-full font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                paymentMethod && !loading ? "bg-amber-500 hover:bg-amber-400 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando pedido…</> : "Confirmar pedido →"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
