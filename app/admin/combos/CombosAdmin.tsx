"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Combo, Product } from "@/lib/types";
import { ArrowLeft, Plus, Edit, ToggleRight, ToggleLeft, Layers, BookOpen, Search, X, Save, Loader2, CheckCircle } from "lucide-react";

interface Props {
  combos: Combo[];
  products: Product[];
}

function fmt(n: number) { return `$${Number(n || 0).toFixed(2)}`; }

// ── Formulario de combo ────────────────────────────────────────────────────
function ComboForm({ combo, products, onSave, onCancel }: {
  combo?: Combo;
  products: Product[];
  onSave: (saved: Combo) => void;
  onCancel: () => void;
}) {
  const [nombre, setNombre] = useState(combo?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(combo?.descripcion ?? "");
  const [precio, setPrecio] = useState(combo?.precio ?? 0);
  const [imagen, setImagen] = useState(combo?.imagen ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(combo?.productoIds ?? []));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredProducts = products.filter((p) =>
    search.trim() === "" || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  function toggleProduct(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const selectedProducts = products.filter((p) => selectedIds.has(p.id));
  const sumPrecio = selectedProducts.reduce((s, p) => s + Number(p.precioFinal || p.precio || 0), 0);

  async function handleSave() {
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    if (selectedIds.size === 0) { setError("Selecciona al menos un producto para el combo."); return; }
    setSaving(true); setError("");
    const id = combo?.id ?? "nuevo";
    const res = await fetch(`/api/admin/combos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, precio, imagen, productoIds: Array.from(selectedIds), activo: combo?.activo ?? true }),
    });
    if (res.ok) {
      const { id: newId } = await res.json();
      onSave({ id: newId, nombre, descripcion, precio, imagen, productoIds: Array.from(selectedIds), activo: combo?.activo ?? true });
    } else {
      setError("Error al guardar. Intenta de nuevo.");
    }
    setSaving(false);
  }

  const INPUT = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="font-bold text-lg text-gray-900">{combo ? "Editar combo" : "Nuevo combo"}</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del combo *</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={INPUT} placeholder="Ej: Pack Biblia + Devocional" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Precio del combo (USD) *</label>
          <input type="number" min={0} step={0.01} value={precio} onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)} className={INPUT} />
          {sumPrecio > 0 && (
            <p className="text-xs text-gray-400 mt-1">Suma individual: {fmt(sumPrecio)} → ahorro: {fmt(sumPrecio - precio)}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className={INPUT + " resize-none"} placeholder="Describe qué incluye este combo y por qué es especial…" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">URL de imagen del combo</label>
          <input type="url" value={imagen} onChange={(e) => setImagen(e.target.value)} className={INPUT} placeholder="https://..." />
        </div>
      </div>

      {/* Selector de productos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">Productos incluidos * ({selectedIds.size} seleccionados)</label>
        </div>

        {/* Chips de seleccionados */}
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 p-3 bg-blue-50 rounded-lg">
            {selectedProducts.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1 bg-[#1e3a8a] text-white text-xs px-2 py-1 rounded-full">
                {p.nombre.substring(0, 30)}{p.nombre.length > 30 ? "…" : ""}
                <button onClick={() => toggleProduct(p.id)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="search" placeholder="Buscar producto por nombre o SKU…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-64 divide-y divide-gray-100">
          {filteredProducts.slice(0, 50).map((p) => (
            <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleProduct(p.id)}
                className="w-4 h-4 rounded border-gray-300 text-[#1e3a8a]" />
              {p.imagen
                ? <img src={p.imagen} alt="" className="w-8 h-10 object-cover rounded shrink-0" />
                : <div className="w-8 h-10 bg-gray-100 rounded shrink-0 flex items-center justify-center"><BookOpen className="w-3 h-3 text-gray-300" /></div>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{p.nombre}</p>
                <p className="text-xs text-gray-400">{p.sku} · {fmt(p.precioFinal || p.precio)}</p>
              </div>
            </label>
          ))}
          {filteredProducts.length === 0 && <p className="px-4 py-6 text-center text-sm text-gray-400">Sin resultados</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors">Cancelar</button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Guardando…" : "Guardar combo"}
        </button>
      </div>
    </div>
  );
}

// ── Vista principal ───────────────────────────────────────────────────────
export function CombosAdmin({ combos: initialCombos, products }: Props) {
  const [combos, setCombos] = useState(initialCombos);
  const [editingCombo, setEditingCombo] = useState<Combo | null | "nuevo">(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function toggleActivo(combo: Combo) {
    setTogglingId(combo.id);
    const newActivo = !combo.activo;
    await fetch(`/api/admin/combos/${combo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: newActivo }),
    });
    setCombos((prev) => prev.map((c) => c.id === combo.id ? { ...c, activo: newActivo } : c));
    setTogglingId(null);
  }

  function handleSaved(saved: Combo) {
    setCombos((prev) => {
      const exists = prev.find((c) => c.id === saved.id);
      if (exists) return prev.map((c) => c.id === saved.id ? saved : c);
      return [...prev, saved];
    });
    setEditingCombo(null);
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-1.5 text-blue-200 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm">Panel</span>
          </Link>
          <div className="flex items-center gap-2 ml-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <p className="font-semibold text-sm">Gestión de Combos</p>
          </div>
          <div className="flex-1" />
          <button onClick={() => setEditingCombo("nuevo")}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />Nuevo combo
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Formulario nuevo / editar */}
        {editingCombo !== null && (
          <ComboForm
            combo={editingCombo === "nuevo" ? undefined : editingCombo}
            products={products}
            onSave={handleSaved}
            onCancel={() => setEditingCombo(null)}
          />
        )}

        {/* Lista de combos */}
        {combos.length === 0 && editingCombo === null && (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <Layers className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Todavía no hay combos creados.</p>
            <button onClick={() => setEditingCombo("nuevo")}
              className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
              <Plus className="w-4 h-4" />Crear primer combo
            </button>
          </div>
        )}

        {combos.map((combo) => (
          <div key={combo.id} className={`bg-white rounded-xl border border-gray-200 p-5 ${!combo.activo ? "opacity-60" : ""}`}>
            <div className="flex gap-4">
              {combo.imagen
                ? <img src={combo.imagen} alt={combo.nombre} className="w-20 h-24 object-cover rounded-lg border border-gray-200 shrink-0" />
                : <div className="w-20 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center shrink-0"><Layers className="w-6 h-6 text-gray-300" /></div>}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{combo.nombre}</h3>
                    <p className="text-xl font-bold text-[#1e3a8a] mt-1">{fmt(combo.precio)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleActivo(combo)} disabled={togglingId === combo.id} title={combo.activo ? "Desactivar" : "Activar"} className="transition-colors">
                      {togglingId === combo.id
                        ? <span className="w-5 h-5 border-2 border-gray-300 border-t-[#1e3a8a] rounded-full animate-spin inline-block" />
                        : combo.activo ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-gray-300" />}
                    </button>
                    <button onClick={() => setEditingCombo(combo)}
                      className="flex items-center gap-1.5 text-xs text-[#1e3a8a] hover:text-[#1e40af] border border-[#1e3a8a] px-3 py-1.5 rounded-lg transition-colors">
                      <Edit className="w-3.5 h-3.5" />Editar
                    </button>
                  </div>
                </div>

                {combo.descripcion && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{combo.descripcion}</p>}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {combo.productoIds.map((pid) => {
                    const p = productMap.get(pid);
                    return (
                      <span key={pid} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {p ? p.nombre.substring(0, 28) + (p.nombre.length > 28 ? "…" : "") : pid}
                      </span>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-400 mt-2">{combo.productoIds.length} producto{combo.productoIds.length !== 1 ? "s" : ""} incluido{combo.productoIds.length !== 1 ? "s" : ""} · {combo.activo ? "Visible en catálogo" : "Oculto del catálogo"}</p>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
