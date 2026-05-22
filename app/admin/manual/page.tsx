import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen, ArrowLeft, Edit, Package, Tag, ToggleRight,
  Layers, ShoppingBag, CheckCircle, AlertCircle, Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Manual de Uso | Admin SBUVEN",
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
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1e3a8a] text-white text-sm font-bold flex items-center justify-center">{num}</div>
      <div>
        <p className="font-semibold text-gray-900 mb-1">{title}</p>
        <div className="text-sm text-gray-600">{children}</div>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "productos", label: "Editar productos" },
  { id: "precios", label: "Precios y ofertas" },
  { id: "estado", label: "Activar / Desactivar" },
  { id: "acciones-masivas", label: "Acciones masivas" },
  { id: "combos", label: "Combos" },
  { id: "ventas", label: "Dashboard de ventas" },
];

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-bold text-sm leading-tight">SBUVEN Admin</p>
              <p className="text-[10px] text-blue-200">Panel de catálogo</p>
            </div>
          </div>
          <div className="flex-1" />
          <Link href="/admin" className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar nav */}
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

        {/* Main content */}
        <main className="flex-1 space-y-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manual de uso</h1>
            <p className="text-gray-500">Guía completa para administrar el catálogo digital de SBUVEN.</p>
          </div>

          {/* ── EDITAR PRODUCTOS ────────────────────────────────────────────── */}
          <Section id="productos" icon={<Edit className="w-5 h-5" />} title="Editar productos">
            <p>Desde el panel principal puedes editar cualquier producto del catálogo. Los cambios se guardan directamente en Google Sheets y se reflejan en el catálogo público al instante.</p>

            <div className="space-y-3">
              <Step num={1} title="Buscar el producto">
                Usa la barra de búsqueda para filtrar por nombre, SKU, ISBN o autor. También puedes filtrar por categoría o estado de stock usando los selectores.
              </Step>
              <Step num={2} title="Abrir el editor">
                Haz clic en el ícono de lápiz (✏️) en la fila del producto. Se abrirá la página de edición.
              </Step>
              <Step num={3} title="Modificar los campos">
                Puedes editar: nombre, SKU, ISBN, descripción, precio, precio rebajado, stock, categorías, encuadernación, tamaño de letra, versión bíblica, autor, editorial, páginas, etiquetas, peso e imágenes.
              </Step>
              <Step num={4} title="Guardar">
                Haz clic en <strong>Guardar cambios</strong>. El sistema actualiza el Sheet y regresa al listado.
              </Step>
            </div>

            <Tip>
              La descripción se limpia automáticamente: se eliminan los códigos <code>\n</code> y los metadatos embebidos (Editorial:, Autor:, etc.) que vienen de importaciones antiguas.
            </Tip>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-gray-800 mb-2">Campos disponibles en el editor</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-gray-600">
                {[
                  "SKU / ISBN", "Nombre", "Descripción corta", "Precio base",
                  "Precio rebajado", "En stock / Cantidad", "Categoría principal",
                  "Categorías adicionales", "Subcategorías", "Versión bíblica",
                  "Encuadernación", "Tamaño de letra", "Tamaño de biblia",
                  "Autor", "Editorial", "N° páginas", "Etiquetas", "Peso",
                  "Imagen principal", "Imágenes adicionales",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── PRECIOS Y OFERTAS ───────────────────────────────────────────── */}
          <Section id="precios" icon={<Tag className="w-5 h-5" />} title="Precios y ofertas">
            <p>Cada producto tiene tres campos de precio que trabajan juntos:</p>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Precio base", desc: "El precio original del producto. Siempre debe estar lleno.", color: "border-gray-300" },
                { label: "Precio rebajado", desc: "Precio con descuento. Si se establece, el catálogo muestra el precio tachado y el nuevo precio.", color: "border-amber-400" },
                { label: "Precio final", desc: "Calculado automáticamente: usa el precio rebajado si existe, de lo contrario el precio base.", color: "border-green-500" },
              ].map((p) => (
                <div key={p.label} className={`border-2 ${p.color} rounded-lg p-3 text-sm`}>
                  <p className="font-bold text-gray-900 mb-1">{p.label}</p>
                  <p className="text-gray-600">{p.desc}</p>
                </div>
              ))}
            </div>

            <Tip>
              Para quitar una oferta, deja el campo <strong>Precio rebajado</strong> en blanco (o en cero) y guarda. El producto volverá a mostrar solo el precio base.
            </Tip>

            <p className="font-semibold text-gray-800 mt-2">Ajustes masivos de precio</p>
            <p>Si necesitas ajustar el precio de varios productos a la vez, usa las <a href="#acciones-masivas" className="text-[#1e3a8a] underline">acciones masivas</a>.</p>
          </Section>

          {/* ── ACTIVAR / DESACTIVAR ────────────────────────────────────────── */}
          <Section id="estado" icon={<ToggleRight className="w-5 h-5" />} title="Activar y desactivar productos">
            <p>Puedes ocultar temporalmente un producto del catálogo público sin eliminarlo. El producto queda guardado en el Sheet pero no es visible para los clientes.</p>

            <div className="space-y-3">
              <Step num={1} title="Toggle rápido desde el listado">
                En la tabla de productos, cada fila tiene un ícono de toggle (🔵 activo / ⚫ inactivo). Haz clic para cambiar el estado al instante.
              </Step>
              <Step num={2} title="Desde el editor de producto">
                Al editar un producto encontrarás un interruptor de <strong>Activo / Inactivo</strong> que también modifica este estado.
              </Step>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <ToggleRight className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Activo — visible en el catálogo</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3">
                <ToggleRight className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 font-medium">Inactivo — oculto del catálogo</span>
              </div>
            </div>

            <Warning>
              Desactivar un producto no lo elimina del Sheet. Puedes volver a activarlo en cualquier momento.
            </Warning>
          </Section>

          {/* ── ACCIONES MASIVAS ────────────────────────────────────────────── */}
          <Section id="acciones-masivas" icon={<Package className="w-5 h-5" />} title="Acciones masivas">
            <p>Permite aplicar cambios a múltiples productos a la vez sin necesidad de editarlos uno por uno.</p>

            <div className="space-y-3">
              <Step num={1} title="Seleccionar productos">
                Marca la casilla al inicio de cada fila. También puedes usar la casilla de la cabecera para seleccionar todos los productos visibles (con los filtros aplicados).
              </Step>
              <Step num={2} title="Elegir acción">
                Aparece una barra flotante en la parte inferior con las acciones disponibles. Selecciona la que necesitas del desplegable.
              </Step>
              <Step num={3} title="Configurar y aplicar">
                Algunas acciones piden un valor (porcentaje, precio fijo). Introdúcelo y haz clic en <strong>Aplicar</strong>.
              </Step>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden text-sm">
              <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">Acciones disponibles</div>
              <div className="divide-y divide-gray-200">
                {[
                  { action: "Activar seleccionados", desc: "Pone en activo todos los productos marcados." },
                  { action: "Desactivar seleccionados", desc: "Oculta del catálogo todos los productos marcados." },
                  { action: "Subir precio (%)", desc: "Aumenta el precio base un porcentaje. Ej.: 10 → sube 10%." },
                  { action: "Bajar precio (%)", desc: "Reduce el precio base un porcentaje." },
                  { action: "Establecer precio fijo", desc: "Asigna el mismo precio base a todos los seleccionados." },
                  { action: "Aplicar oferta (%)", desc: "Establece el precio rebajado con el descuento indicado." },
                  { action: "Quitar oferta", desc: "Elimina el precio rebajado de todos los seleccionados." },
                ].map((r) => (
                  <div key={r.action} className="px-4 py-2.5 flex gap-3">
                    <span className="font-medium text-[#1e3a8a] w-52 shrink-0">{r.action}</span>
                    <span className="text-gray-600">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <Tip>
              Combina los filtros con las acciones masivas. Por ejemplo: filtra por categoría «Biblias» y luego aplica una oferta del 15% solo a esos productos.
            </Tip>
          </Section>

          {/* ── COMBOS ──────────────────────────────────────────────────────── */}
          <Section id="combos" icon={<Layers className="w-5 h-5" />} title="Combos">
            <p>Los combos son productos especiales que agrupan varios artículos con un precio fijo propio, generalmente más económico que la suma individual.</p>

            <div className="space-y-3">
              <Step num={1} title="Ir a la sección de combos">
                Desde el panel de administración, haz clic en <strong>Combos</strong> en el menú superior.
              </Step>
              <Step num={2} title="Crear un combo">
                Haz clic en <strong>+ Nuevo combo</strong>. Completa: nombre, descripción, precio del combo, URL de imagen y selecciona los productos que lo conforman buscándolos por nombre.
              </Step>
              <Step num={3} title="Guardar">
                Haz clic en <strong>Guardar combo</strong>. Se almacena en la pestaña «Combos» del Google Sheet del catálogo.
              </Step>
              <Step num={4} title="Editar o desactivar">
                Haz clic en el ícono de lápiz de cualquier combo para modificarlo. Usa el toggle para activarlo o desactivarlo del catálogo.
              </Step>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>Ahorro calculado:</strong> El editor de combos muestra automáticamente cuánto ahorra el cliente respecto a comprar los productos por separado, basado en los precios finales de cada artículo.
            </div>
          </Section>

          {/* ── VENTAS ──────────────────────────────────────────────────────── */}
          <Section id="ventas" icon={<ShoppingBag className="w-5 h-5" />} title="Dashboard de ventas">
            <p>El área de ventas permite al equipo comercial revisar y gestionar los pedidos recibidos a través del catálogo digital. Tiene su propio acceso con contraseña independiente del panel de administración.</p>

            <div className="space-y-3">
              <Step num={1} title="Acceder al área de ventas">
                Ve a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#1e3a8a] font-mono">/ventas</code> e ingresa con la contraseña del equipo de ventas. El panel de administración también puede acceder a esta sección.
              </Step>
              <Step num={2} title="Ver pedidos">
                Los pedidos se muestran del más reciente al más antiguo. Puedes filtrar por estado, método de envío o buscar por nombre de cliente.
              </Step>
              <Step num={3} title="Gestionar un pedido">
                Haz clic en cualquier pedido para ver el panel lateral con todos los detalles: datos del cliente, productos, método de pago y método de envío.
              </Step>
              <Step num={4} title="Cambiar el estado">
                En el panel del pedido verás los pasos del flujo según el método de envío. Haz clic en el botón del siguiente estado para avanzar.
              </Step>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden text-sm">
              <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">Flujo de estados por método de envío</div>
              <div className="divide-y divide-gray-200">
                {[
                  { method: "Retiro en tienda", flow: "Recibido → Pago confirmado → En preparación → Listo para retirar → Retirado" },
                  { method: "Delivery Caracas", flow: "Recibido → Pago confirmado → En preparación → En camino → Entregado" },
                  { method: "MRW / Zoom", flow: "Recibido → Pago confirmado → En preparación → Despachado → Entregado" },
                ].map((r) => (
                  <div key={r.method} className="px-4 py-3">
                    <p className="font-medium text-gray-800 mb-0.5">{r.method}</p>
                    <p className="text-gray-500 text-xs font-mono">{r.flow}</p>
                  </div>
                ))}
              </div>
            </div>

            <Tip>
              Para los envíos por MRW o Zoom, puedes registrar el número de guía directamente en el panel del pedido. Este número queda guardado en la hoja de pedidos del Sheet.
            </Tip>

            <Warning>
              Cancelar un pedido es irreversible desde el dashboard. Si necesitas reactivarlo, debes cambiar el estado manualmente en el Google Sheet.
            </Warning>
          </Section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
            <p>¿Tienes dudas o encontraste un problema? Contacta al equipo técnico.</p>
            <Link href="/admin" className="mt-3 inline-flex items-center gap-1.5 text-[#1e3a8a] hover:underline font-medium">
              <ArrowLeft className="w-4 h-4" />
              Volver al panel de administración
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
