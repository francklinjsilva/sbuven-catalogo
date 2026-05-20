"use client";

import Image from "next/image";
import { ShoppingCart, Eye, Tag } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
}

export function ProductCard({ product, onViewDetail }: ProductCardProps) {
  const { addItem } = useCart();

  const hasDiscount =
    product.precioRebajado > 0 && product.precioRebajado < product.precio;
  const discountPct = hasDiscount
    ? Math.round((1 - product.precioRebajado / product.precio) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden border border-gray-100 group">
      {/* Image */}
      <div
        className="relative aspect-[3/4] bg-gray-50 cursor-pointer overflow-hidden"
        onClick={() => onViewDetail(product)}
      >
        {product.imagen ? (
          <Image
            src={product.imagen}
            alt={product.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <span className="text-4xl">📖</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              -{discountPct}%
            </span>
          )}
          {!product.enStock && (
            <span className="bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded">
              Agotado
            </span>
          )}
        </div>

        {/* Category badge */}
        {product.categoriaMain && (
          <div className="absolute top-2 right-2">
            <span className="bg-[#1e3a8a]/80 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              {product.categoriaMain}
            </span>
          </div>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(product);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-[#1e3a8a] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver detalle
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <h3
          className="text-sm font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-[#1e3a8a] transition-colors leading-tight"
          onClick={() => onViewDetail(product)}
        >
          {product.nombre}
        </h3>

        {product.isbn && (
          <p className="text-[11px] text-gray-400 font-mono">
            ISBN: {product.isbn}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-[#1e3a8a]">
            ${product.precioFinal.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ${product.precio.toFixed(2)}
            </span>
          )}
          {product.precioFinal === 0 && (
            <span className="text-sm text-amber-600 font-medium">
              Consultar
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={() => addItem(product)}
          disabled={!product.enStock}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
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
  );
}
