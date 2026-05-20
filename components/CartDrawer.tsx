"use client";

import Image from "next/image";
import { X, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "./CartProvider";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, totalItems } =
    useCart();
  const router = useRouter();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b bg-[#1e3a8a] text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="font-bold text-lg">
              Carrito ({totalItems}{" "}
              {totalItems === 1 ? "producto" : "productos"})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <ShoppingCart className="w-12 h-12" />
              <p className="text-sm">Tu carrito está vacío</p>
              <button
                onClick={closeCart}
                className="text-[#1e3a8a] text-sm font-medium hover:underline"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 bg-gray-50 rounded-xl p-3"
              >
                {/* Product image */}
                <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100">
                  {item.product.imagen ? (
                    <Image
                      src={item.product.imagen}
                      alt={item.product.nombre}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl">
                      📖
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                    {item.product.nombre}
                  </p>
                  {item.product.isbn && (
                    <p className="text-[10px] text-gray-400 font-mono">
                      {item.product.isbn}
                    </p>
                  )}
                  <p className="text-sm font-bold text-[#1e3a8a]">
                    ${item.product.precioFinal.toFixed(2)} c/u
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() =>
                        updateQty(item.product.id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(item.product.id, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-gray-500 ml-auto">
                      ${(item.product.precioFinal * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors self-start"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-gray-50">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-xl font-bold text-[#1e3a8a]">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Precio en USD · Forma de pago en el siguiente paso
            </p>

            {/* Checkout button */}
            <button
              onClick={() => {
                closeCart();
                router.push("/checkout");
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
            >
              Finalizar pedido →
            </button>

            {/* Continue shopping */}
            <button
              onClick={closeCart}
              className="w-full text-[#1e3a8a] font-medium text-sm py-2 hover:underline"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
