"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Client, ClientType } from "@/lib/crm-types";
import { CLIENT_TYPE_LABELS, CLIENT_TYPE_COLORS } from "@/lib/crm-types";
import {
  Users, LogOut, Search, RefreshCw, Plus, X, Edit, Phone,
  Mail, MapPin, Tag, FileText, CheckCircle, AlertCircle,
  ShoppingBag, ArrowLeft, Save, ChevronDown,
} from "lucide-react";

interface Props { initialClients: Client[] }

type Tab = "perfil" | "pedidos";

const TIPO_OPTIONS: { value: ClientType; label: string }[] = [
  { value: "natural",  label: "Persona natural" },
  { value: "empresa",  label: "Empresa" },
  { value: "iglesia",  label: "Iglesia / Ministerio" },
  { value: "libreria", label: "Librería / Revendedor" },
  { value: "otro",     label: "Otro" },
];

const ESTADOS_VE = [
  "Amazonas","Anzoátegui","Apure","Aragua","Barinas","Bolívar","Carabobo",
  "Cojedes","Delta Amacuro","Distrito Capital","Falcón","Guárico","Lara",
  "Mérida","Miranda","Monagas","Nueva Esparta","Portuguesa","Sucre","Táchira",
  "Trujillo","Vargas","Yaracuy","Zulia",
];

// ── Formulario vacío ──────────────────────────────────────────────────────────
const emptyForm = (): Omit<Client, "id" | "rowNumber" | "fechaRegistro" | "origen"> => ({
  nombre: "", cedula: "", email: "", telefono: "",
  estadoGeo: "", municipio: "", direccion: "",
  tipo: "natural", etiquetas: [], notas: "",
});

// ── Componente badge de tipo ──────────────────────────────────────────────────
function TypeBadge({ tipo }: { tipo: ClientType }) {
  return (
    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${CLIENT_TYPE_COLORS[tipo]}`}>
      {CLIENT_TYPE_LABELS[tipo]}
    </span>
  );
}

// ── Input de etiquetas ────────────────────────────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  function add() {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Escribir y presionar Enter…"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" />
        <button type="button" onClick={add}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
          + Añadir
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span key={t} className="inline-flex items-center gap-1 bg-[#1e3a8a]/10 text-[#1e3a8a] text-xs px-2.5 py-1 rounded-full">
              {t}
              <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-red-600 ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Formulario de cliente ─────────────────────────────────────────────────────
function ClientForm({
  initialData, onSave, onCancel, saving,
}: {
  initialData: ReturnType<typeof emptyForm>;
  onSave: (data: ReturnType<typeof emptyForm>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initialData);
  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const field = (label: string, key: keyof typeof form, type = "text", required = false) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input type={type} value={form[key] as string} onChange={e => set(key, e.target.value)}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" />
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {field("Nombre completo", "nombre", "text", true)}
        {field("Cédula / RIF", "cedula", "text", true)}
        {field("Teléfono", "telefono")}
        {field("Email", "email", "email")}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de cliente</label>
        <select value={form.tipo} onChange={e => set("tipo", e.target.value as ClientType)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white">
          {TIPO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
          <select value={form.estadoGeo} onChange={e => set("estadoGeo", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white">
            <option value="">— Seleccionar —</option>
            {ESTADOS_VE.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        {field("Municipio", "municipio")}
      </div>

      {field("Dirección", "direccion")}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Etiquetas</label>
        <TagInput tags={form.etiquetas} onChange={v => set("etiquetas", v)} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notas internas</label>
        <textarea value={form.notas} onChange={e => set("notas", e.target.value)} rows={3}
          placeholder="Observaciones del equipo de ventas…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] resize-none" />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
          <Save className="w-4 h-4" />
          {saving ? "Guardando…" : "Guardar cliente"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── Panel lateral ─────────────────────────────────────────────────────────────
function ClientPanel({ client, onClose, onUpdated }: {
  client: Client;
  onClose: () => void;
  onUpdated: (c: Client) => void;
}) {
  const [tab, setTab] = useState<Tab>("perfil");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [orders, setOrders] = useState<{id:string;fecha:string;productos:string;total:string;formaPago:string;envio:string;estadoPedido:string}[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (tab === "pedidos" && orders.length === 0) {
      setLoadingOrders(true);
      fetch(`/api/crm/clients/${client.id}?cedula=${encodeURIComponent(client.cedula)}`)
        .then(r => r.json())
        .then(data => { setOrders(Array.isArray(data) ? data : []); setLoadingOrders(false); })
        .catch(() => setLoadingOrders(false));
    }
  }, [tab, client.id, client.cedula, orders.length]);

  async function handleSave(form: ReturnType<typeof emptyForm>) {
    setSaving(true); setMsg("");
    const res = await fetch(`/api/crm/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      onUpdated({ ...client, ...form });
      setEditing(false);
      setMsg("✓ Cambios guardados");
    } else {
      setMsg("❌ Error al guardar");
    }
    setSaving(false);
  }

  const waUrl = `https://wa.me/${client.telefono.replace(/\D/g, "")}`;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e3a8a] text-white px-5 py-4 flex items-start justify-between">
          <div>
            <p className="font-bold text-base leading-tight">{client.nombre}</p>
            <p className="text-xs text-blue-200 mt-0.5">{client.cedula}</p>
            <div className="flex gap-2 mt-2">
              <TypeBadge tipo={client.tipo} />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${client.origen === "catalogo" ? "bg-amber-400/30 text-amber-200" : "bg-white/20 text-white"}`}>
                {client.origen === "catalogo" ? "Desde catálogo" : "Manual"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white mt-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          {(["perfil", "pedidos"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t ? "border-b-2 border-[#1e3a8a] text-[#1e3a8a]" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "perfil" ? "Perfil" : `Pedidos`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {msg && (
            <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${msg.startsWith("✓") ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {msg}
            </div>
          )}

          {/* ── PESTAÑA PERFIL ── */}
          {tab === "perfil" && (
            editing ? (
              <ClientForm
                initialData={{ nombre: client.nombre, cedula: client.cedula, email: client.email, telefono: client.telefono, estadoGeo: client.estadoGeo, municipio: client.municipio, direccion: client.direccion, tipo: client.tipo, etiquetas: client.etiquetas, notas: client.notas }}
                onSave={handleSave}
                onCancel={() => setEditing(false)}
                saving={saving}
              />
            ) : (
              <div className="space-y-5">
                {/* Contacto */}
                <section>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contacto</h3>
                  <div className="space-y-2">
                    {client.telefono && (
                      <a href={waUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-green-700 hover:text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <Phone className="w-4 h-4 shrink-0" />{client.telefono}
                      </a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`}
                        className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                        <Mail className="w-4 h-4 shrink-0" />{client.email}
                      </a>
                    )}
                  </div>
                </section>

                {/* Ubicación */}
                {(client.estadoGeo || client.municipio || client.direccion) && (
                  <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ubicación</h3>
                    <div className="flex gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2.5 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        {[client.direccion, client.municipio, client.estadoGeo].filter(Boolean).join(", ")}
                      </div>
                    </div>
                  </section>
                )}

                {/* Etiquetas */}
                {client.etiquetas.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Etiquetas</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {client.etiquetas.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 bg-[#1e3a8a]/10 text-[#1e3a8a] text-xs px-2.5 py-1 rounded-full">
                          <Tag className="w-3 h-3" />{t}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Notas */}
                {client.notas && (
                  <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Notas</h3>
                    <div className="flex gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2.5 rounded-lg">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <p className="whitespace-pre-wrap">{client.notas}</p>
                    </div>
                  </section>
                )}

                {/* Meta */}
                <section className="text-xs text-gray-400 pt-2 border-t border-gray-100 space-y-1">
                  <p>Registrado: {client.fechaRegistro}</p>
                  <p>Origen: {client.origen === "catalogo" ? "Pedido del catálogo" : "Creado manualmente"}</p>
                </section>

                <button onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50 font-semibold text-sm py-2.5 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                  Editar perfil
                </button>
              </div>
            )
          )}

          {/* ── PESTAÑA PEDIDOS ── */}
          {tab === "pedidos" && (
            <div className="space-y-3">
              {loadingOrders ? (
                <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />Cargando pedidos…
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Sin pedidos registrados</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500">{orders.length} pedido{orders.length !== 1 ? "s" : ""} encontrado{orders.length !== 1 ? "s" : ""}</p>
                  {orders.map(o => (
                    <div key={o.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{o.id}</span>
                        <span className="text-gray-500 text-xs">{o.fecha}</span>
                      </div>
                      <p className="text-gray-600 text-xs line-clamp-2">{o.productos}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-bold text-[#1e3a8a]">${o.total}</span>
                        <span className="text-xs text-gray-500">{o.estadoPedido}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────
export function CRMDashboard({ initialClients }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<ClientType | "all">("all");
  const [origenFilter, setOrigenFilter] = useState<"all" | "manual" | "catalogo">("all");
  const [selected, setSelected] = useState<Client | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const filtered = useMemo(() => {
    let list = clients;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        c.cedula.toLowerCase().includes(q) ||
        c.telefono.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.etiquetas.some(t => t.toLowerCase().includes(q))
      );
    }
    if (tipoFilter !== "all") list = list.filter(c => c.tipo === tipoFilter);
    if (origenFilter !== "all") list = list.filter(c => c.origen === origenFilter);
    return list;
  }, [clients, search, tipoFilter, origenFilter]);

  const stats = useMemo(() => {
    const thisMonth = new Date().toLocaleDateString("es-VE", { month: "2-digit", year: "numeric" });
    return {
      total: clients.length,
      nuevos: clients.filter(c => c.fechaRegistro.includes(thisMonth.split("/")[1])).length,
      catalogo: clients.filter(c => c.origen === "catalogo").length,
      manual: clients.filter(c => c.origen === "manual").length,
    };
  }, [clients]);

  async function handleSync() {
    setSyncing(true); setSyncMsg("");
    const res = await fetch("/api/crm/sync", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setSyncMsg(data.added > 0 ? `✓ ${data.added} cliente${data.added !== 1 ? "s" : ""} nuevo${data.added !== 1 ? "s" : ""} importado${data.added !== 1 ? "s" : ""} desde pedidos` : "✓ No hay clientes nuevos en los pedidos");
      if (data.added > 0) {
        const updated = await fetch("/api/crm/clients").then(r => r.json());
        if (Array.isArray(updated)) setClients(updated);
      }
    } else {
      setSyncMsg("❌ Error al sincronizar");
    }
    setSyncing(false);
    setTimeout(() => setSyncMsg(""), 5000);
  }

  async function handleAddClient(form: ReturnType<typeof emptyForm>) {
    setAddSaving(true);
    const res = await fetch("/api/crm/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newClient = await res.json();
      setClients(prev => [newClient, ...prev]);
      setShowAdd(false);
    }
    setAddSaving(false);
  }

  function handleUpdated(updated: Client) {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelected(updated);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Users className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-bold text-sm leading-tight">SBUVEN CRM</p>
              <p className="text-[10px] text-blue-200">Base de clientes</p>
            </div>
          </div>
          <div className="flex-1" />
          <Link href="/hub" className="hidden sm:flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />Hub
          </Link>
          <Link href="/admin" className="hidden sm:flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors">
            Inventario
          </Link>
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
            { label: "Total clientes", value: stats.total, color: "text-[#1e3a8a]", bg: "bg-blue-50" },
            { label: "Desde catálogo", value: stats.catalogo, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Creados manual", value: stats.manual, color: "text-purple-700", bg: "bg-purple-50" },
            { label: "Este mes", value: stats.nuevos, color: "text-green-700", bg: "bg-green-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mensaje de sync */}
        {syncMsg && (
          <div className={`mb-4 text-sm px-4 py-3 rounded-lg flex items-center gap-2 ${syncMsg.startsWith("✓") ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {syncMsg.startsWith("✓") ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {syncMsg}
          </div>
        )}

        {/* Barra de acciones */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" placeholder="Nombre, cédula, teléfono, etiqueta…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" />
          </div>

          <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value as ClientType | "all")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white">
            <option value="all">Todos los tipos</option>
            {TIPO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select value={origenFilter} onChange={e => setOrigenFilter(e.target.value as typeof origenFilter)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white">
            <option value="all">Todos los orígenes</option>
            <option value="catalogo">Desde catálogo</option>
            <option value="manual">Creados manualmente</option>
          </select>

          <div className="flex gap-2 sm:ml-auto">
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{syncing ? "Sincronizando…" : "Sincronizar pedidos"}</span>
            </button>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Nuevo cliente
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-xs text-gray-500">
            {filtered.length} cliente{filtered.length !== 1 ? "s" : ""} {search || tipoFilter !== "all" || origenFilter !== "all" ? "(filtrado)" : ""}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No se encontraron clientes</p>
              {clients.length === 0 && (
                <p className="text-xs mt-1">Usa «Sincronizar pedidos» o crea el primero manualmente</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Contacto</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Ubicación</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Etiquetas</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Origen</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(c => (
                    <tr key={c.id} onClick={() => setSelected(c)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{c.nombre}</p>
                        <p className="text-xs text-gray-500">{c.cedula}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-700">{c.telefono}</p>
                        {c.email && <p className="text-xs text-gray-400 truncate max-w-32">{c.email}</p>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-xs">
                        {[c.municipio, c.estadoGeo].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <TypeBadge tipo={c.tipo} />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.etiquetas.slice(0, 2).map(t => (
                            <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                          {c.etiquetas.length > 2 && (
                            <span className="text-xs text-gray-400">+{c.etiquetas.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.origen === "catalogo" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>
                          {c.origen === "catalogo" ? "Catálogo" : "Manual"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); setSelected(c); }}
                          className="text-gray-400 hover:text-[#1e3a8a] transition-colors p-1 rounded">
                          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Panel de detalle */}
      {selected && (
        <ClientPanel
          client={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Modal nuevo cliente */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-lg">Nuevo cliente</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <ClientForm
                initialData={emptyForm()}
                onSave={handleAddClient}
                onCancel={() => setShowAdd(false)}
                saving={addSaving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
