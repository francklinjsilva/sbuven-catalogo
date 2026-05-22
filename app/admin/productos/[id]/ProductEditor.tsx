"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { cleanDescription } from "@/lib/clean-description";
import {
  ArrowLeft, Save, BookOpen, DollarSign, Package,
  Image as ImageIcon, FileText, Tag, Ruler, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";

interface Props {
  product: Product;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <span className="text-[#1e3a8a]">{icon}</span>
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const INPUT = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white";

export function ProductEditor({ product }: Props) {
  // ── Estado del formulario ──────────────────────────────────────────────────
  const [sku, setSku] = useState(product.sku ?? "");
  const [isbn, setIsbn] = useState(product.isbn ?? "");
  const [nombre, setNombre] = useState(product.nombre ?? "");
  const [descripcion, setDescripcion] = useState(() => cleanDescription(product.descripcion));
  const [precio, setPrecio] = useState(product.precio ?? 0);
  const [precioRebajado, setPrecioRebajado] = useState(product.precioRebajado ?? 0);
  const [precioFinal, setPrecioFinal] = useState(product.precioFinal ?? 0);
  const [enStock, setEnStock] = useState(product.enStock ?? true);
  const [stock, setStock] = useState(product.stock ?? 0);
  const [categoriaMain, setCategoriaMain] = useState(product.categoriaMain ?? "");
  const [categorias, setCategorias] = useState(product.categorias?.join("|") ?? "");
  const [subCategorias, setSubCategorias] = useState(product.subCategorias?.join("|") ?? "");
  const [etiquetas, setEtiquetas] = useState(product.etiquetas?.join("|") ?? "");
  const [imagen, setImagen] = useState(product.imagen ?? "");
  // Imágenes adicionales (hasta 5)
  const initExtra = product.imagenes ?? [];
  const [imgExtra, setImgExtra] = useState<string[]>([
    initExtra[0] ?? "",
    initExtra[1] ?? "",
    initExtra[2] ?? "",
    initExtra[3] ?? "",
    initExtra[4] ?? "",
  ]);
  const [encuadernacion, setEncuadernacion] = useState(product.encuadernacion ?? "");
  const [tamanoLetra, setTamanoLetra] = useState(product.tamanoLetra ?? "");
  const [tamanoBiblia, setTamanoBiblia] = useState(product.tamanoBiblia ?? "");
  const [version, setVersion] = useState(product.version ?? "");
  const [autor, setAutor] = useState(product.autor ?? "");
  const [editorial, setEditorial] = useState(product.editorial ?? "");
  const [paginas, setPaginas] = useState(product.paginas ?? 0);
  const [peso, setPeso] = useState(product.peso ?? 0);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-calcular precioFinal cuando cambia precio o precioRebajado
  useEffect(() => {
    if (precioRebajado && precioRebajado > 0 && precioRebajado < precio) {
      setPrecioFinal(precioRebajado);
    } else {
      setPrecioFinal(precio);
    }
  }, [precio, precioRebajado]);

  async function handleSave() {
    setSaveStatus("saving");
    setErrorMsg("");

    const updates = {
      sku,
      isbn,
      nombre,
      descripcionCorta: descripcion,
      precio,
      precioRebajado: precioRebajado || 0,
      precioFinal,
      enStock,
      stock,
      categoriaMain,
      categorias: categorias.split("|").map((s) => s.trim()).filter(Boolean),
      subCategorias: subCategorias.split("|").map((s) => s.trim()).filter(Boolean),
      etiquetas: etiquetas.split("|").map((s) => s.trim()).filter(Boolean),
      imagen,
      imagenes: imgExtra.filter(Boolean),
      encuadernacion,
      tamanoLetra,
      tamanoBiblia,
      version,
      autor,
      editorial,
      paginas,
      peso,
    };

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? "Error al guardar");
      setSaveStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-1.5 text-blue-200 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver</span>
          </Link>

          <div className="flex items-center gap-2 ml-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <p className="font-semibold text-sm truncate max-w-xs">{product.nombre}</p>
          </div>

          <div className="flex-1" />

          <span className="text-xs text-blue-300 hidden sm:block font-mono">{product.sku}</span>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {saveStatus === "saving" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveStatus === "saved" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveStatus === "saving" ? "Guardando…" : saveStatus === "saved" ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      </header>

      {/* Status messages */}
      {saveStatus === "error" && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        </div>
      )}

      {saveStatus === "saved" && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Cambios guardados correctamente en Google Sheets. El catálogo se actualizará en menos de 1 hora.
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Identificadores */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ID interno</label>
              <p className="text-sm font-mono text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">{product.id}</p>
              <p className="text-xs text-gray-400 mt-1">No editable</p>
            </div>
            <Field label="SKU" hint="Código interno del producto">
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="ISBN" hint="Código de barra internacional">
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Información básica */}
          <div className="md:col-span-2">
            <Section icon={<BookOpen className="w-4 h-4" />} title="Información básica">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nombre del producto" hint="Nombre visible en el catálogo">
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label="Autor">
                  <input
                    type="text"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label="Editorial">
                  <input
                    type="text"
                    value={editorial}
                    onChange={(e) => setEditorial(e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label="Versión / Traducción">
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className={INPUT}
                    placeholder="Ej: Reina Valera 1960"
                  />
                </Field>
              </div>
            </Section>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <Section icon={<FileText className="w-4 h-4" />} title="Descripción">
              <Field label="Descripción del producto" hint="Se muestra en el modal de detalle del producto">
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={5}
                  className={INPUT + " resize-y"}
                />
              </Field>
            </Section>
          </div>

          {/* Precios */}
          <Section icon={<DollarSign className="w-4 h-4" />} title="Precios (USD)">
            <Field label="Precio regular" hint="Precio base antes de descuento">
              <input
                type="number"
                min={0}
                step={0.01}
                value={precio}
                onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)}
                className={INPUT}
              />
            </Field>
            <Field label="Precio rebajado" hint="Dejar en 0 si no hay descuento activo">
              <input
                type="number"
                min={0}
                step={0.01}
                value={precioRebajado}
                onChange={(e) => setPrecioRebajado(parseFloat(e.target.value) || 0)}
                className={INPUT}
              />
            </Field>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-xs text-amber-700 font-medium mb-0.5">Precio final calculado</p>
              <p className="text-xl font-bold text-amber-800">${precioFinal.toFixed(2)}</p>
              <p className="text-xs text-amber-600 mt-0.5">
                {precioRebajado > 0 && precioRebajado < precio
                  ? `Descuento aplicado: -$${(precio - precioRebajado).toFixed(2)}`
                  : "Sin descuento activo"}
              </p>
            </div>
          </Section>

          {/* Inventario */}
          <Section icon={<Package className="w-4 h-4" />} title="Inventario">
            <Field label="Estado de disponibilidad">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEnStock(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    enStock
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-green-400"
                  }`}
                >
                  ✓ En stock
                </button>
                <button
                  type="button"
                  onClick={() => setEnStock(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    !enStock
                      ? "bg-red-500 border-red-500 text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-red-400"
                  }`}
                >
                  ✗ Sin stock
                </button>
              </div>
            </Field>
            <Field label="Cantidad en inventario">
              <input
                type="number"
                min={0}
                step={1}
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className={INPUT}
              />
            </Field>
          </Section>

          {/* Imágenes */}
          <div className="md:col-span-2">
            <Section icon={<ImageIcon className="w-4 h-4" />} title="Imágenes">
              <Field label="Imagen principal" hint="URL de la portada del producto (se muestra en la grilla del catálogo)">
                <input
                  type="url"
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  className={INPUT}
                  placeholder="https://..."
                />
              </Field>
              {imagen && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagen}
                    alt="Vista previa"
                    className="w-14 h-16 object-cover rounded border border-gray-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                  />
                  <p className="text-xs text-gray-500">Vista previa de imagen principal</p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-600 mb-3">
                  Imágenes adicionales (galería del producto)
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {imgExtra.map((url, i) => (
                    <Field key={i} label={`Imagen ${i + 2}`}>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const next = [...imgExtra];
                          next[i] = e.target.value;
                          setImgExtra(next);
                        }}
                        className={INPUT}
                        placeholder="https://..."
                      />
                    </Field>
                  ))}
                </div>
              </div>
            </Section>
          </div>

          {/* Clasificación */}
          <Section icon={<Tag className="w-4 h-4" />} title="Clasificación">
            <Field label="Categoría principal">
              <input
                type="text"
                value={categoriaMain}
                onChange={(e) => setCategoriaMain(e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field
              label="Categorías (separadas por |)"
              hint='Ej: "Biblias|Recursos Bíblicos"'
            >
              <input
                type="text"
                value={categorias}
                onChange={(e) => setCategorias(e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field
              label="Sub-categorías (separadas por |)"
              hint='Ej: "Reina Valera|Tapa Dura"'
            >
              <input
                type="text"
                value={subCategorias}
                onChange={(e) => setSubCategorias(e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field
              label="Etiquetas (separadas por |)"
              hint='Ej: "Oferta|Nuevo|Destacado"'
            >
              <input
                type="text"
                value={etiquetas}
                onChange={(e) => setEtiquetas(e.target.value)}
                className={INPUT}
              />
            </Field>
          </Section>

          {/* Características físicas */}
          <Section icon={<Ruler className="w-4 h-4" />} title="Características físicas">
            <Field label="Encuadernación">
              <input
                type="text"
                value={encuadernacion}
                onChange={(e) => setEncuadernacion(e.target.value)}
                className={INPUT}
                placeholder="Ej: Tapa Blanda"
              />
            </Field>
            <Field label="Tamaño de letra">
              <input
                type="text"
                value={tamanoLetra}
                onChange={(e) => setTamanoLetra(e.target.value)}
                className={INPUT}
                placeholder="Ej: Grande, Normal, Compacta"
              />
            </Field>
            <Field label="Tamaño de la Biblia">
              <input
                type="text"
                value={tamanoBiblia}
                onChange={(e) => setTamanoBiblia(e.target.value)}
                className={INPUT}
                placeholder="Ej: 12cm x 19cm"
              />
            </Field>
            <Field label="Número de páginas">
              <input
                type="number"
                min={0}
                value={paginas}
                onChange={(e) => setPaginas(parseInt(e.target.value) || 0)}
                className={INPUT}
              />
            </Field>
            <Field label="Peso (gramos)">
              <input
                type="number"
                min={0}
                value={peso}
                onChange={(e) => setPeso(parseFloat(e.target.value) || 0)}
                className={INPUT}
              />
            </Field>
          </Section>
        </div>

        {/* Footer save */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            {saveStatus === "saving" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saveStatus === "saving" ? "Guardando en Google Sheets…" : "Guardar todos los cambios"}
          </button>
        </div>
      </main>
    </div>
  );
}
