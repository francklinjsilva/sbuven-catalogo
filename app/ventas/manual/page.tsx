import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag, ArrowLeft, Search, Filter, CheckCircle,
  Truck, MapPin, Package, Phone, AlertCircle, Info, Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Manual de Ventas | SBUVEN",
  robots: { index: false, follow: false },
};

function Section({ id, icon, title, children }: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="bg-[#1e3a8a] text-white rounded-lg p-2">{icon}</div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4 text-gray-700">{children}</div>
    </section>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-amber-800">{children}</p>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
      <p className="text-red-800">{children}</p>
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1e3a8a] text-white text-sm font-bold flex items-center justify-center">
        {num}
      </div>
      <div>
        <p className="font-semibold text-gray-900 mb-1">{title}</p>
        <div className="text-sm text-gray-600">{children}</div>
      </div>
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}

const NAV_ITEMS = [
  { id: "acceso", label: "Cómo acceder" },
  { id: "panel", label: "Panel de pedidos" },
  { id: "detalle", label: "Detalle de un pedido" },
  { id: "estados", label: "Cambiar el estado" },
  { id: "flujos", label: "Flujos por envío" },
  { id: "guia", label: "Número de guía" },
  { id: "faq", label: "Preguntas frecuentes" },
];

export default function VentasManualPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-bold text-sm leading-tight">SBUVEN Ventas</p>
              <p className="text-[10px] text-blue-200">Gestión de pedidos</p>
            </div>
          </div>
          <div className="flex-1" />
          <Link href="/ventas" className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contenido</p>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <a key={item.id} href={`#${item.id}`}
                  className="block text-sm text-gray-600 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-md px-3 py-1.5 transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 space-y-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manual de Ventas</h1>
            <p className="text-gray-500">
              Guía para el equipo comercial de SBUVEN sobre cómo gestionar los pedidos del catálogo digital.
            </p>
          </div>

          {/* ── ACCESO ──────────────────────────────────────────────────────── */}
          <Section id="acceso" icon={<ShoppingBag className="w-5 h-5" />} title="Cómo acceder">
            <p>
              El área de ventas es una sección protegida del catálogo, exclusiva para el equipo comercial.
              No es visible para los clientes.
            </p>
            <div className="space-y-3">
              <Step num={1} title="Ir a la URL del panel">
                Abre el navegador y ve a{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#1e3a8a] font-mono text-xs">
                  catalogo.sociedadesbiblicas.org.ve/ventas
                </code>
              </Step>
              <Step num={2} title="Ingresar la contraseña">
                Escribe la contraseña del equipo de ventas y haz clic en <strong>Ingresar</strong>.
              </Step>
              <Step num={3} title="Sesión activa">
                La sesión se mantiene activa en el navegador. Para cerrarla, usa el botón{" "}
                <strong>Cerrar sesión</strong> en la esquina superior derecha.
              </Step>
            </div>
            <Tip>
              Puedes guardar la URL en favoritos para acceder más rápido. Si olvidaste la contraseña, contacta al administrador del sistema.
            </Tip>
          </Section>

          {/* ── PANEL ───────────────────────────────────────────────────────── */}
          <Section id="panel" icon={<Package className="w-5 h-5" />} title="Panel de pedidos">
            <p>
              Al ingresar, verás el panel principal con todos los pedidos recibidos a través del catálogo digital.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden text-sm">
              <div className="bg-gray-100 px-4 py-2.5 font-semibold text-gray-700">Elementos del panel</div>
              <div className="divide-y divide-gray-200">
                {[
                  {
                    label: "Estadísticas superiores",
                    desc: "Muestra de un vistazo: total de pedidos, cuántos están pendientes, en proceso y completados.",
                  },
                  {
                    label: "Barra de búsqueda",
                    desc: "Busca por número de pedido, nombre del cliente, teléfono o cédula.",
                  },
                  {
                    label: "Filtros",
                    desc: "Filtra por estado del pedido, método de envío o forma de pago.",
                  },
                  {
                    label: "Tabla de pedidos",
                    desc: "Lista todos los pedidos del más reciente al más antiguo. Haz clic en cualquier fila para ver el detalle.",
                  },
                ].map((r) => (
                  <div key={r.label} className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="font-semibold text-gray-800">Filtros disponibles</p>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              {[
                { icon: <Search className="w-4 h-4 text-gray-400" />, label: "Búsqueda libre", desc: "Nombre, N° pedido, teléfono, cédula" },
                { icon: <Filter className="w-4 h-4 text-amber-500" />, label: "Por estado", desc: "Pendiente, confirmado, en camino, etc." },
                { icon: <Truck className="w-4 h-4 text-blue-500" />, label: "Por método de envío", desc: "Retiro, delivery, MRW, Zoom" },
              ].map((f) => (
                <div key={f.label} className="flex gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  {f.icon}
                  <div>
                    <p className="font-medium text-gray-800 text-xs">{f.label}</p>
                    <p className="text-gray-500 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── DETALLE ─────────────────────────────────────────────────────── */}
          <Section id="detalle" icon={<CheckCircle className="w-5 h-5" />} title="Detalle de un pedido">
            <p>
              Haz clic en cualquier fila de la tabla para abrir el panel lateral con toda la información del pedido.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden text-sm">
              <div className="bg-gray-100 px-4 py-2.5 font-semibold text-gray-700">Información disponible</div>
              <div className="divide-y divide-gray-200">
                {[
                  { label: "Datos del cliente", desc: "Nombre completo, cédula/RIF, teléfono (enlace directo a WhatsApp) y correo electrónico." },
                  { label: "Dirección de entrega", desc: "Estado, municipio, dirección completa y punto de referencia." },
                  { label: "Productos del pedido", desc: "Lista de artículos solicitados con cantidades." },
                  { label: "Resumen económico", desc: "Total en USD y forma de pago seleccionada por el cliente." },
                  { label: "Método de envío", desc: "Retiro en tienda, delivery Caracas, MRW o Zoom." },
                  { label: "Notas del cliente", desc: "Observaciones o instrucciones especiales que el cliente dejó al hacer el pedido." },
                  { label: "Número de guía", desc: "Para envíos por paquetería, el tracking de MRW o Zoom." },
                ].map((r) => (
                  <div key={r.label} className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <Tip>
              El teléfono del cliente es un enlace directo a WhatsApp. Haz clic en él para abrir una conversación sin necesidad de guardar el número.
            </Tip>
          </Section>

          {/* ── ESTADOS ─────────────────────────────────────────────────────── */}
          <Section id="estados" icon={<Clock className="w-5 h-5" />} title="Cambiar el estado de un pedido">
            <p>
              Dentro del panel de detalle verás el flujo de estados como pasos visuales.
              El paso actual aparece resaltado y los disponibles como botones activos.
            </p>
            <div className="space-y-3">
              <Step num={1} title="Abre el pedido">
                Haz clic en la fila del pedido en la tabla para abrir el panel lateral.
              </Step>
              <Step num={2} title="Revisa el estado actual">
                El sistema muestra en qué paso está el pedido dentro del flujo correspondiente al método de envío.
              </Step>
              <Step num={3} title="Selecciona el nuevo estado">
                Haz clic en el botón del estado al que quieres avanzar.
              </Step>
              <Step num={4} title="Guarda">
                Haz clic en <strong>Guardar estado</strong>. El cambio se registra en Google Sheets de inmediato y la tabla se actualiza sin recargar la página.
              </Step>
            </div>

            <p className="font-semibold text-gray-800">Significado de cada estado</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                { label: "Pedido Recibido", color: "bg-yellow-100 text-yellow-800", desc: "El cliente completó el formulario. Aún no confirmaste el pago." },
                { label: "Pago Confirmado", color: "bg-blue-100 text-blue-800", desc: "Verificaste que el pago fue recibido correctamente." },
                { label: "En Preparación", color: "bg-purple-100 text-purple-800", desc: "El pedido está siendo armado en el almacén." },
                { label: "Listo para Retirar", color: "bg-cyan-100 text-cyan-800", desc: "Solo para retiro en tienda. El pedido está listo." },
                { label: "En Camino", color: "bg-orange-100 text-orange-800", desc: "Solo para delivery Caracas. El mensajero salió." },
                { label: "Despachado", color: "bg-indigo-100 text-indigo-800", desc: "Solo para MRW/Zoom. El paquete fue enviado a la paquetería." },
                { label: "Entregado / Retirado", color: "bg-green-100 text-green-800", desc: "El cliente recibió su pedido. Proceso completado." },
                { label: "Cancelado", color: "bg-red-100 text-red-800", desc: "El pedido fue anulado." },
              ].map((s) => (
                <div key={s.label} className="flex gap-3 items-start bg-white border border-gray-200 rounded-lg p-3">
                  <StatusPill label={s.label} color={s.color} />
                  <p className="text-gray-500 text-xs">{s.desc}</p>
                </div>
              ))}
            </div>

            <Warning>
              <strong>Cancelar un pedido es permanente desde este panel.</strong> Si necesitas reactivarlo, deberás modificar el estado directamente en el Google Sheet de pedidos.
            </Warning>
          </Section>

          {/* ── FLUJOS ──────────────────────────────────────────────────────── */}
          <Section id="flujos" icon={<Truck className="w-5 h-5" />} title="Flujos según método de envío">
            <p>
              El sistema adapta el flujo de estados al método de envío del pedido. No todos los estados aplican a todos los métodos.
            </p>

            <div className="space-y-4">
              {[
                {
                  method: "Retiro en tienda",
                  icon: <MapPin className="w-4 h-4" />,
                  color: "border-cyan-400 bg-cyan-50",
                  headerColor: "bg-cyan-100 text-cyan-800",
                  steps: ["Pedido Recibido", "Pago Confirmado", "En Preparación", "Listo para Retirar", "Retirado"],
                  tip: "Cuando el cliente pase a retirar, avanza a «Listo para Retirar» antes de que llegue para que el equipo lo tenga preparado.",
                },
                {
                  method: "Delivery Caracas",
                  icon: <Truck className="w-4 h-4" />,
                  color: "border-orange-400 bg-orange-50",
                  headerColor: "bg-orange-100 text-orange-800",
                  steps: ["Pedido Recibido", "Pago Confirmado", "En Preparación", "En Camino", "Entregado"],
                  tip: "Cambia a «En Camino» cuando el mensajero salga con el pedido para que el cliente sepa que ya está en ruta.",
                },
                {
                  method: "MRW / Zoom",
                  icon: <Package className="w-4 h-4" />,
                  color: "border-indigo-400 bg-indigo-50",
                  headerColor: "bg-indigo-100 text-indigo-800",
                  steps: ["Pedido Recibido", "Pago Confirmado", "En Preparación", "Despachado", "Entregado"],
                  tip: "Registra el número de guía antes de marcar como «Despachado» para que quede registrado en el sistema.",
                },
              ].map((f) => (
                <div key={f.method} className={`border-2 ${f.color} rounded-xl overflow-hidden`}>
                  <div className={`${f.headerColor} px-4 py-2.5 flex items-center gap-2 font-semibold text-sm`}>
                    {f.icon}
                    {f.method}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {f.steps.map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                          <span className="text-xs font-medium bg-white border border-gray-300 rounded-full px-3 py-1 text-gray-700">
                            {step}
                          </span>
                          {i < f.steps.length - 1 && (
                            <span className="text-gray-400 text-xs">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      💡 {f.tip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── GUÍA ────────────────────────────────────────────────────────── */}
          <Section id="guia" icon={<Package className="w-5 h-5" />} title="Registrar número de guía (MRW / Zoom)">
            <p>
              Para pedidos enviados por paquetería, es importante registrar el número de guía o tracking para que quede en el historial del pedido.
            </p>
            <div className="space-y-3">
              <Step num={1} title="Abre el pedido">
                Haz clic en la fila del pedido por paquetería.
              </Step>
              <Step num={2} title="Localiza el campo de guía">
                Dentro del panel de detalle encontrarás el campo <strong>Número de guía</strong>.
              </Step>
              <Step num={3} title="Ingresa el número">
                Escribe el código de rastreo que te proporcionó MRW o Zoom.
              </Step>
              <Step num={4} title="Cambia el estado a Despachado y guarda">
                Selecciona el estado <strong>Despachado</strong> y haz clic en <strong>Guardar estado</strong>. Ambos datos (estado y guía) se guardan juntos en el Sheet.
              </Step>
            </div>
            <Tip>
              El número de guía queda almacenado en la columna R de la hoja de pedidos en Google Sheets, disponible para consultas futuras.
            </Tip>
          </Section>

          {/* ── FAQ ─────────────────────────────────────────────────────────── */}
          <Section id="faq" icon={<CheckCircle className="w-5 h-5" />} title="Preguntas frecuentes">
            <div className="space-y-4">
              {[
                {
                  q: "¿Cómo sé cuándo llega un nuevo pedido?",
                  a: "Por ahora, los nuevos pedidos llegan por WhatsApp al número configurado y también quedan registrados en el Google Sheet de pedidos. Te recomendamos revisar el panel al inicio de cada jornada y cuando recibas la notificación por WhatsApp.",
                },
                {
                  q: "¿Puedo ver pedidos viejos que ya están completados?",
                  a: "Sí. La tabla muestra todos los pedidos históricos. Usa el filtro de estado «Entregado» o «Retirado» para ver los completados.",
                },
                {
                  q: "¿Qué hago si el cliente cancela después de confirmado el pago?",
                  a: "Cambia el estado a «Cancelado» desde el panel. Si ya hubo reversión de pago o gestión adicional, agrégalo en las notas directamente en el Google Sheet.",
                },
                {
                  q: "¿Puedo editar los datos del cliente desde aquí?",
                  a: "No. Los datos del pedido son de solo lectura en este panel. Si necesitas corregir algún dato, hazlo directamente en el Google Sheet de pedidos.",
                },
                {
                  q: "¿Se actualiza la tabla en tiempo real?",
                  a: "Los cambios que tú haces se reflejan inmediatamente de forma optimista (sin recargar). Si otra persona del equipo hace cambios desde otro dispositivo, recarga la página para ver los pedidos actualizados.",
                },
                {
                  q: "¿El cliente recibe una notificación cuando cambio el estado?",
                  a: "Por ahora no hay notificación automática al cliente. Se recomienda contactarlo por WhatsApp (el enlace directo está en el panel del pedido) para informarle de los avances importantes.",
                },
              ].map((item) => (
                <div key={item.q} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">📌 {item.q}</p>
                  <p className="text-sm text-gray-600">{item.a}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
            <p>¿Tienes dudas o encontraste un problema? Contacta al equipo técnico.</p>
            <Link href="/ventas" className="mt-3 inline-flex items-center gap-1.5 text-[#1e3a8a] hover:underline font-medium">
              <ArrowLeft className="w-4 h-4" />
              Volver al panel de ventas
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
