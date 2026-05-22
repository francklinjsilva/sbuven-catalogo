"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cleanDescription } from "@/lib/clean-description";
import {
  X,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Tag,
  Ruler,
  Hash,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    setImageIndex(0);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  const images =
    product.imagenes.length > 0 ? product.imagenes : [product.imagen];
  const hasDiscount =
    product.precioRebajado > 0 && product.precioRebajado < product.precio;
  const discountPct = hasDiscount
    ? Math.round((1 - product.precioRebajado / product.precio) * 100)
    : 0;

  const details = [
    product.isbn && { label: "ISBN", value: product.isbn, icon: Hash },
    product.sku && { label: "SKU", value: product.sku, icon: Tag },
    product.autor && { label: "Autor", value: product.autor, icon: BookOpen },
    product.editorial && {
      label: "Editorial",
      value: product.editorial,
      icon: BookOpen,
    },
    product.version && {
      label: "Versión",
      value: product.version,
      icon: BookOpen,
    },
    product.encuadernacion && {
      label: "Encuadernación",
      value: product.encuadernacion,
      icon: BookOpen,
    },
    product.tamanoLetra && {
      label: "Tamaño de letra",
      value: product.tamanoLetra,
      icon: Ruler,
    },
    product.tamanoBiblia && {
      label: "Tamaño",
      value: product.tamanoBiblia,
      icon: Ruler,
    },
    product.paginas > 0 && {
      label: "Páginas",
      value: String(product.paginas),
      icon: BookOpen,
    },
  ].filter(Boolean) as { label: string; value: string; icon: typeof Tag }[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Images */}
          <div className="bg-gray-50 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none p-6 flex flex-col items-center gap-4">
            <div className="relative w-full aspect-[3/4] max-w-[260px]">
              {images[imageIndex] ? (
                <Image
                  src={images[imageIndex]}
                  alt={product.nombre}
                  fill
                  sizes="260px"
                  className="object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300 text-6xl">
                  📖
                </div>
              )}

              {/* Image nav */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setImageIndex((i) => (i - 1 + images.length) % images.length)
                    }
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full shadow"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setImageIndex((i) => (i + 1) % images.length)
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full shadow"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`relative w-12 h-16 rounded border-2 overflow-hidden transition-colors ${
                      i === imageIndex
                        ? "border-[#1e3a8a]"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Vista ${i + 1}`}
                      fill
                      sizes="48px"
                      className="object-contain p-0.5"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col gap-4">
            {/* Category */}
            <div className="flex flex-wrap gap-1.5">
              {product.categorias.map((cat) => (
                <span
                  key={cat}
                  className="text-xs bg-blue-50 text-[#1e3a8a] px-2 py-0.5 rounded-full font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Name */}
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {product.nombre}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#1e3a8a]">
                {product.precioFinal > 0
                  ? `$${product.precioFinal.toFixed(2)}`
                  : "Consultar precio"}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ${product.precio.toFixed(2)}
                  </span>
                  <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div
              className={`text-sm font-medium ${
                product.enStock ? "text-green-600" : "text-red-500"
              }`}
            >
              {product.enStock ? "✓ Disponible en stock" : "✗ Sin stock"}
            </div>

            {/* Description */}
            {product.descripcion && (
              <div className="text-sm text-gray-600 leading-relaxed max-h-40 overflow-y-auto scrollbar-thin">
                {cleanDescription(product.descripcion)
                  .split("\n")
                  .filter((l) => l.trim())
                  .map((line, i) => (
                    <p key={i} className="mb-1.5">
                      {line}
                    </p>
                  ))}
              </div>
            )}

            {/* Details grid */}
            {details.length > 0 && (
              <div className="border-t pt-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Especificaciones
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {details.map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-[11px] text-gray-400">{label}</dt>
                      <dd className="text-xs font-medium text-gray-700 truncate">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-auto pt-2">
              <button
                onClick={() => {
                  addItem(product);
                  onClose();
                }}
                disabled={!product.enStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-colors ${
                  product.enStock
                    ? "bg-[#1e3a8a] hover:bg-[#1e2d6b] text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {product.enStock ? "Agregar al carrito" : "Sin stock"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
