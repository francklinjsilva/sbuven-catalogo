"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/orders-types";
import {
  STATUS_LABELS, STATUS_COLORS, SHIPPING_LABELS, PAYMENT_LABELS, getStatusFlow,
} from "@/lib/orders-types";
import {
  ShoppingBag, LogOut, Search, Filter, ChevronDown, ChevronUp,
  Package, Clock, CheckCircle, Truck, MapPin, RefreshCw, X,
  Phone, Mail, CreditCard, ExternalLink,
} from "lucide-react";

interface Props { orders: Order[] }

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  pendiente: <Clock className="w-3.5 h-3.5" />,
  confirmado: <CheckCircle className="w-3.5 h-3.5" />,
  preparando: <Package className="w-3.5 h-3.5" />,
  listo_retiro: <MapPin className="w-3.5 h-3.5" />,
  en_camino: <Truck className="w-3.5 h-3.5" />,
  despachado: <Truck className="w-3.5 h-3.5" />,
  entregado: <CheckCircle className="w-3.5 h-3.5" />,
  retirado: <CheckCircle className="w-3.5 h-3.5" />,
  cancelado: <X className="w-3.5 h-3.5" />,
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
      {STATUS_ICONS[status]}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ── Panel de detalle + cambio de estado ─────────────────────────────────────
function OrderPanel({ order, onClose, onUpdated }: {
  order: Order;
  onClose: () => void;
  onUpdated: (id: string, status: OrderStatus, guia?: string) => void;
}) {
  const flow = getStatusFlow(order.envio);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.estadoPedido);
  const [numGuia, setNumGuia] = useState(order.numGuia ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const needsGuia = ["despachado"].includes(newStatus) && ["paqueteria_mrw", "paqueteria_zoom"].includes(order.envio);

  async function saveStatus() {
    setSaving(true); setMsg("");
    const res = await fetch(`/api/ventas/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, numGuia: numGuia || undefined }),
    });
    if (res.ok) {
      onUpdated(order.id, newStatus, numGuia || undefined);
      setMsg("✓ Estado actualizado correctamente");
    } else {
      setMsg("❌ Error al actualizar. Intenta de nuevo.");
    }
    setSaving(false);
  }

  // Parsear productos
  const items = order.productos.split("|").map((s) => s.trim()).filter(Boolean);

  const waUrl = `https://wa.me/${order.telefono.replace(/\D/g, "")}`;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-[#1e3a8a] text-white px-5 py-4 flex items-center justify-between sticky top-0">
          <div>
            <p className="font-bold text-base">{order.id}</p>
            <p className="text-xs text-blue-200">{order.fecha}</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 p-5 space-y-5">
          {/* Cliente */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cliente</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <p className="font-semibold text-gray-900">{order.cliente}</p>
              <p className="text-sm text-gray-600">{order.cedula}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-green-700 hover:text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                  <Phone className="w-3.5 h-3.5" />{order.telefono}
                </a>
                {order.email && (
                  <a href={`mailto:${order.email}`}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <Mail className="w-3.5 h-3.5" />{order.email}
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Dirección */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dirección de entrega</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
              <p>{order.estadoGeo} — {order.municipio}</p>
              <p>{order.direccion}</p>
              {order.puntoRef && <p className="text-gray-400 text-xs">Ref: {order.puntoRef}</p>}
            </div>
          </section>

          {/* Productos */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Productos ({order.cantItems})</h3>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
              {items.map((item, i) => (
                <div key={i} className="px-4 py-3 text-sm text-gray-700">{item}</div>
              ))}
              <div className="px-4 py-3 flex justify-between items-center bg-gray-50 rounded-b-xl">
                <span className="text-xs font-medium text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{order.total}</span>
              </div>
            </div>
          </section>

          {/* Pago & Envío */}
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Forma de pago</p>
              <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                {PAYMENT_LABELS[order.formaPago] ?? order.formaPago}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Método de envío</p>
              <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                {SHIPPING_LABELS[order.envio] ?? order.envio}
              </p>
            </div>
          </section>

          {/* Notas */}
          {order.notas && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notas del cliente</h3>
              <p className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-gray-700">{order.notas}</p>
            </section>
          )}

          {/* Número de guía actual */}
          {order.numGuia && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Número de guía</h3>
              <p className="font-mono text-sm bg-indigo-50 text-indigo-800 border border-indigo-100 px-4 py-2 rounded-xl">{order.numGuia}</p>
            </section>
          )}

          {/* Cambio de estado */}
          <section className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Actualizar estado del pedido</h3>

            {/* Flujo visual */}
            <div className="flex items-center gap-1 flex-wrap mb-4">
              {flow.filter(s => s !== "cancelado").map((s, i, arr) => (
                <div key={s} className="flex items-center gap-1">
                  <button onClick={() => setNewStatus(s)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${
                      newStatus === s
                        ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                        : order.estadoPedido === s
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400"
                    }`}>
                    {STATUS_LABELS[s]}
                  </button>
                  {i < arr.length - 1 && <ChevronDown className="w-3 h-3 text-gray-300 rotate-[-90deg]" />}
                </div>
              ))}
              <button onClick={() => setNewStatus("cancelado")}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border ml-2 ${
                  newStatus === "cancelado"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-600"
                }`}>
                Cancelar pedido
              </button>
            </div>

            {/* N° guía */}
            {needsGuia && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Número de guía ({SHIPPING_LABELS[order.envio]})</label>
                <input type="text" value={numGuia} onChange={(e) => setNumGuia(e.target.value)}
                  placeholder="Ej: MRW-123456789"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" />
              </div>
            )}

            {msg && <p className="text-sm mb-3 px-3 py-2 rounded-lg bg-gray-50 text-gray-700">{msg}</p>}

            <button onClick={saveStatus} disabled={saving || newStatus === order.estadoPedido}
              className="w-full flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? "Guardando…" : "Guardar estado"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard principal ──────────────────────────────────────────────────────
export function SalesDashboard({ orders: initialOrders }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [envioFilter, setEnvioFilter] = useState("all");
  const [pagoFilter, setPagoFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const filtered = useMemo(() => {
    let list = orders;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.cliente.toLowerCase().includes(q) ||
        o.telefono.includes(q) ||
        o.cedula.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter((o) => o.estadoPedido === statusFilter);
    if (envioFilter !== "all") list = list.filter((o) => o.envio === envioFilter);
    if (pagoFilter !== "all") list = list.filter((o) => o.formaPago === pagoFilter);
    return list;
  }, [orders, search, statusFilter, envioFilter, pagoFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: orders.length,
    pendientes: orders.filter((o) => o.estadoPedido === "pendiente").length,
    enProceso: orders.filter((o) => ["confirmado", "preparando", "listo_retiro", "en_camino", "despachado"].includes(o.estadoPedido)).length,
    completados: orders.filter((o) => ["entregado", "retirado"].includes(o.estadoPedido)).length,
  }), [orders]);

  function handleUpdated(id: string, status: OrderStatus, guia?: string) {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, estadoPedido: status, numGuia: guia ?? o.numGuia } : o));
    if (selectedOrder?.id === id) setSelectedOrder((prev) => prev ? { ...prev, estadoPedido: status, numGuia: guia ?? prev.numGuia } : null);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/ventas/auth", { method: "DELETE" });
    router.push("/ventas/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-bold text-sm leading-tight">SBUVEN Ventas</p>
              <p className="text-[10px] text-blue-200">Gestión de pedidos</p>
            </div>
          </div>
          <div className="flex-1" />
          <button onClick={handleLogout} disabled={loggingOut}
            className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total pedidos", value: stats.total, color: "text-[#1e3a8a]", bg: "bg-blue-50" },
            { label: "Pendientes", value: stats.pendientes, color: "text-yellow-700", bg: "bg-yellow-50" },
            { label: "En proceso", value: stats.enProceso, color: "text-purple-700", bg: "bg-purple-50" },
            { label: "Completados", value: stats.completados, color: "text-green-700", bg: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" placeholder="N° pedido, cliente, teléfono…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white">
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <select value={envioFilter} onChange={(e) => setEnvioFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white">
            <option value="all">Todo envío</option>
            {Object.entries(SHIPPING_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <select value={pagoFilter} onChange={(e) => setPagoFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white">
            <option value="all">Todo pago</option>
            {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <p className="text-xs text-gray-500 mb-3">{filtered.length} pedido{filtered.length !== 1 ? "s" : ""}</p>

        {/* Tabla de pedidos */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">N° Pedido</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Envío</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Pago</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="px-4 py-3 font-mono text-xs text-[#1e3a8a] font-semibold">{order.id}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{order.fecha.split(",")[0]}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.cliente}</p>
                      <p className="text-xs text-gray-400">{order.telefono}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 hidden md:table-cell">{order.total}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{SHIPPING_LABELS[order.envio] ?? order.envio}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{PAYMENT_LABELS[order.formaPago] ?? order.formaPago}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.estadoPedido} /></td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                        className="text-xs text-[#1e3a8a] hover:underline font-medium">Ver detalle</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No hay pedidos con ese filtro.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Panel de detalle */}
      {selectedOrder && (
        <OrderPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
