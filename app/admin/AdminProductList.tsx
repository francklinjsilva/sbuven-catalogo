"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import {
  BookOpen, Search, LogOut, Package, CheckCircle,
  XCircle, Edit, ChevronUp, ChevronDown, ExternalLink,
  ToggleLeft, ToggleRight, Layers, X, ChevronRight,
  TrendingDown, TrendingUp, Tag, Trash2, DollarSign, HelpCircle,
} from "lucide-react";

interface Props {
  products: Product[];
  stats: { total: number; inStock: number; outOfStock: number };
}

type SortField = "nombre" | "precio" | "stock";
type SortDir = "asc" | "desc";
type BulkAction = "activate" | "deactivate" | "price_increase" | "price_decrease" | "price_fixed" | "apply_offer" | "remove_offer";

function fmt(n: number | undefined | null) {
  return `$${Number(n || 0).toFixed(2)}`;
}

export function AdminProductList({ products: initialProducts, stats }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const [activoFilter, setActivoFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("nombre");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [loggingOut, setLoggingOut] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction | "">("");
  const [bulkValue, setBulkValue] = useState<string>("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.categoriaMain).filter(Boolean));
    return ["all", ...Array.from(cats).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.nombre.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.isbn?.toLowerCase().includes(q) || p.autor?.toLowerCase().includes(q)
      );
    }
    if (stockFilter === "in") list = list.filter((p) => p.enStock);
    if (stockFilter === "out") list = list.filter((p) => !p.enStock);
    if (activoFilter === "active") list = list.filter((p) => p.activo !== false);
    if (activoFilter === "inactive") list = list.filter((p) => p.activo === false);
    if (categoryFilter !== "all") list = list.filter((p) => p.categoriaMain === categoryFilter);
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === "nombre") cmp = a.nombre.localeCompare(b.nombre, "es");
      if (sortField === "precio") cmp = Number(a.precioFinal || 0) - Number(b.precioFinal || 0);
      if (sortField === "stock") cmp = Number(a.stock || 0) - Number(b.stock || 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [products, search, stockFilter, activoFilter, categoryFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  // ── Selección ────────────────────────────────────────────────────────────────
  const allFilteredIds = filtered.map((p) => p.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => { const n = new Set(prev); allFilteredIds.forEach((id) => n.delete(id)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); allFilteredIds.forEach((id) => n.add(id)); return n; });
    }
  }
  function clearSelection() { setSelected(new Set()); setBulkAction(""); setBulkValue(""); setBulkMsg(""); }

  // ── Toggle activo individual ──────────────────────────────────────────────
  const toggleActivo = useCallback(async (p: Product) => {
    setTogglingId(p.id);
    const newActivo = !(p.activo !== false);
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: newActivo }),
    });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, activo: newActivo } : x));
    setTogglingId(null);
  }, []);

  // ── Acciones masivas ──────────────────────────────────────────────────────
  const needsValue = ["price_increase", "price_decrease", "price_fixed", "apply_offer"].includes(bulkAction);

  async function executeBulk() {
    if (!bulkAction) return;
    if (needsValue && !bulkValue) { setBulkMsg("Ingresa un valor para esta acción."); return; }
    setBulkLoading(true); setBulkMsg("");
    const ids = Array.from(selected);
    const res = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action: bulkAction, value: parseFloat(bulkValue) || 0 }),
    });
    if (res.ok) {
      setBulkMsg(`✓ Acción aplicada a ${ids.length} producto(s). Los cambios se verán en el catálogo en ≤ 1 hora.`);
      // Optimistic local update for activate/deactivate
      if (bulkAction === "activate") setProducts((prev) => prev.map((p) => selected.has(p.id) ? { ...p, activo: true } : p));
      if (bulkAction === "deactivate") setProducts((prev) => prev.map((p) => selected.has(p.id) ? { ...p, activo: false } : p));
    } else {
      setBulkMsg("❌ Error al ejecutar la acción. Inténtalo de nuevo.");
    }
    setBulkLoading(false);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="w-3.5 h-3.5 text-gray-300" />;
    return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-[#1e3a8a]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#1e3a8a]" />;
  }

  const BULK_ACTIONS: { value: BulkAction; label: string; icon: React.ReactNode; needsValue?: boolean; unit?: string; hint?: string }[] = [
    { value: "activate", label: "Activar en catálogo", icon: <ToggleRight className="w-4 h-4" /> },
    { value: "deactivate", label: "Desactivar del catálogo", icon: <ToggleLeft className="w-4 h-4" /> },
    { value: "price_increase", label: "Aumentar precio", icon: <TrendingUp className="w-4 h-4" />, needsValue: true, unit: "%", hint: "Ej: 10 → sube 10%" },
    { value: "price_decrease", label: "Reducir precio", icon: <TrendingDown className="w-4 h-4" />, needsValue: true, unit: "%", hint: "Ej: 15 → baja 15%" },
    { value: "price_fixed", label: "Establecer precio fijo", icon: <DollarSign className="w-4 h-4" />, needsValue: true, unit: "$", hint: "Nuevo precio en USD" },
    { value: "apply_offer", label: "Aplicar oferta (descuento)", icon: <Tag className="w-4 h-4" />, needsValue: true, unit: "%", hint: "Ej: 20 → 20% de descuento" },
    { value: "remove_offer", label: "Quitar oferta", icon: <Trash2 className="w-4 h-4" /> },
  ];

  const selectedActionDef = BULK_ACTIONS.find((a) => a.value === bulkAction);
  const activeCount = products.filter((p) => p.activo !== false).length;
  const inactiveCount = products.length - activeCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-bold text-sm leading-tight">SBUVEN Admin</p>
              <p className="text-[10px] text-blue-200">Panel de catálogo</p>
            </div>
          </div>
          <div className="flex-1" />
          <Link href="/admin/combos" className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors font-medium">
            <Layers className="w-4 h-4" />
            Combos
          </Link>
          <Link href="/admin/manual" className="hidden sm:flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors">
            <HelpCircle className="w-4 h-4" />
            Manual
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Ver catálogo
          </a>
          <button onClick={handleLogout} disabled={loggingOut} className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <Package className="w-7 h-7 text-[#1e3a8a] shrink-0" />
            <div><p className="text-xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">Productos</p></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <CheckCircle className="w-7 h-7 text-green-500 shrink-0" />
            <div><p className="text-xl font-bold text-gray-900">{stats.inStock}</p><p className="text-xs text-gray-500">En stock</p></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <ToggleRight className="w-7 h-7 text-blue-500 shrink-0" />
            <div><p className="text-xl font-bold text-gray-900">{activeCount}</p><p className="text-xs text-gray-500">Activos</p></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <ToggleLeft className="w-7 h-7 text-gray-400 shrink-0" />
            <div><p className="text-xl font-bold text-gray-900">{inactiveCount}</p><p className="text-xs text-gray-500">Inactivos</p></div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" placeholder="Nombre, SKU, ISBN, autor…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" />
          </div>
          <select value={activoFilter} onChange={(e) => setActivoFilter(e.target.value as "all" | "active" | "inactive")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white">
            <option value="all">Activos e inactivos</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as "all" | "in" | "out")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white">
            <option value="all">Todo el stock</option>
            <option value="in">En stock</option>
            <option value="out">Sin stock</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white max-w-[200px]">
            {categories.map((c) => <option key={c} value={c}>{c === "all" ? "Todas las categorías" : c}</option>)}
          </select>
        </div>

        <p className="text-xs text-gray-500 mb-3">{filtered.length} producto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#1e3a8a] cursor-pointer" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-14">Imagen</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    <button onClick={() => toggleSort("nombre")} className="flex items-center gap-1 hover:text-[#1e3a8a]">Producto <SortIcon field="nombre" /></button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">SKU</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    <button onClick={() => toggleSort("precio")} className="flex items-center gap-1 hover:text-[#1e3a8a]">Precio <SortIcon field="precio" /></button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    <button onClick={() => toggleSort("stock")} className="flex items-center gap-1 hover:text-[#1e3a8a]">Stock <SortIcon field="stock" /></button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Activo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const isActive = p.activo !== false;
                  const isToggling = togglingId === p.id;
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!isActive ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#1e3a8a] cursor-pointer" />
                      </td>
                      <td className="px-4 py-3">
                        {p.imagen
                          ? <img src={p.imagen} alt={p.nombre} className="w-10 h-12 object-cover rounded border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          : <div className="w-10 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center"><BookOpen className="w-4 h-4 text-gray-300" /></div>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-2 max-w-xs">{p.nombre}</p>
                        {p.categoriaMain && <p className="text-xs text-gray-500 mt-0.5">{p.categoriaMain}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell font-mono text-xs">{p.sku}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">{fmt(p.precioFinal || p.precio)}</span>
                        {Number(p.precioRebajado) > 0 && Number(p.precioRebajado) < Number(p.precio) && (
                          <span className="block text-xs text-gray-400 line-through">{fmt(p.precio)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{p.stock ?? 0}</td>
                      <td className="px-4 py-3">
                        {p.enStock
                          ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />En stock</span>
                          : <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-medium px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-red-400 rounded-full" />Sin stock</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleActivo(p)} disabled={isToggling}
                          title={isActive ? "Clic para desactivar del catálogo" : "Clic para activar en el catálogo"}
                          className="transition-colors disabled:opacity-40">
                          {isToggling
                            ? <span className="w-5 h-5 border-2 border-gray-300 border-t-[#1e3a8a] rounded-full animate-spin inline-block" />
                            : isActive
                              ? <ToggleRight className="w-7 h-7 text-green-500" />
                              : <ToggleLeft className="w-7 h-7 text-gray-300" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/productos/${p.id}`}
                          className="inline-flex items-center gap-1.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                          <Edit className="w-3.5 h-3.5" />Editar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No se encontraron productos con ese criterio.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Barra de acciones masivas (flotante) ─────────────────────────────── */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-[#1e3a8a] text-white rounded-2xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">{selected.size} producto{selected.size !== 1 ? "s" : ""} seleccionado{selected.size !== 1 ? "s" : ""}</p>
              <button onClick={clearSelection} className="text-blue-300 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select value={bulkAction} onChange={(e) => { setBulkAction(e.target.value as BulkAction | ""); setBulkValue(""); setBulkMsg(""); }}
                className="flex-1 bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/40">
                <option value="" className="text-gray-900">Selecciona una acción…</option>
                {BULK_ACTIONS.map((a) => <option key={a.value} value={a.value} className="text-gray-900">{a.label}</option>)}
              </select>

              {selectedActionDef?.needsValue && (
                <div className="flex items-center gap-1">
                  <input type="number" min={0} step={0.01} value={bulkValue} onChange={(e) => setBulkValue(e.target.value)}
                    placeholder={selectedActionDef.hint ?? "Valor"}
                    className="w-28 bg-white/10 border border-white/20 text-white placeholder-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/40" />
                  <span className="text-blue-200 text-sm">{selectedActionDef.unit}</span>
                </div>
              )}

              <button onClick={executeBulk} disabled={!bulkAction || bulkLoading}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                {bulkLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                Aplicar
              </button>
            </div>

            {bulkMsg && <p className="mt-2 text-xs text-blue-200">{bulkMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
