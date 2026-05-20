"use client";

import Link from "next/link";
import { ShoppingCart, BookOpen, Phone, HelpCircle } from "lucide-react";
import { useCart } from "./CartProvider";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { toggleCart, totalItems } = useCart();

  return (
    <header className="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <BookOpen className="w-7 h-7 text-amber-400" />
            <div className="hidden sm:block">
              <p className="font-bold text-base leading-tight">SBUVEN</p>
              <p className="text-[10px] text-blue-200 leading-tight">
                Sociedades Bíblicas
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <input
              type="search"
              placeholder="Buscar por nombre, ISBN, categoría..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Cómo comprar */}
          <Link
            href="/como-comprar"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-200 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Cómo comprar</span>
          </Link>

          {/* Contact */}
          <a
            href="https://wa.me/584125383814"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 text-xs text-green-300 hover:text-green-200 shrink-0"
          >
            <Phone className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {/* Cart button */}
          <button
            onClick={toggleCart}
            className="relative p-2 rounded-lg bg-amber-500 hover:bg-amber-400 transition-colors shrink-0"
            aria-label="Ver carrito"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
