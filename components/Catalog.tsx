"use client";

import { useState, useMemo, useCallback } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Product } from "@/lib/types";
import { searchProducts, filterProducts } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { Header } from "./Header";
import { CartDrawer } from "./CartDrawer";

interface CatalogProps {
  products: Product[];
  categories: string[];
}

const ENCUADERNACIONES = [
  "Tapa Dura",
  "Tapa Blanda",
  "Imitación Piel",
  "Lino",
  "Acolchada",
];

const PAGE_SIZE = 24;

export function Catalog({ products, categories }: CatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEncuadernacion, setSelectedEncuadernacion] = useState("");
  const [soloEnStock, setSoloEnStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = searchProducts(products, searchQuery);
    result = filterProducts(result, {
      categoria: selectedCategory || undefined,
      encuadernacion: selectedEncuadernacion || undefined,
      enStock: soloEnStock || undefined,
    });
    return result;
  }, [products, searchQuery, selectedCategory, selectedEncuadernacion, soloEnStock]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, page * PAGE_SIZE);
  }, [filteredProducts, page]);

  const hasMore = paginatedProducts.length < filteredProducts.length;

  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedEncuadernacion("");
    setSoloEnStock(false);
    setPage(1);
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedEncuadernacion,
    soloEnStock,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={handleSearch} />
      <CartDrawer />

      {/* Category bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => { setSelectedCategory(""); setPage(1); }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? "bg-[#1e3a8a] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setPage(1); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-[#1e3a8a] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 w-full flex-1">
        {/* Results bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-[#1e3a8a]">
                {filteredProducts.length}
              </span>{" "}
              {filteredProducts.length === 1 ? "producto" : "productos"}
              {searchQuery && (
                <span className="text-gray-400">
                  {" "}
                  para &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Limpiar filtros ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-[#1e3a8a] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {showFilters ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Encuadernación */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Encuadernación
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ENCUADERNACIONES.map((enc) => (
                  <button
                    key={enc}
                    onClick={() => {
                      setSelectedEncuadernacion(
                        selectedEncuadernacion === enc ? "" : enc
                      );
                      setPage(1);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedEncuadernacion === enc
                        ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {enc}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Disponibilidad
              </label>
              <button
                onClick={() => { setSoloEnStock((v) => !v); setPage(1); }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  soloEnStock
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                Solo en stock
              </button>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar todo
              </button>
            </div>
          </div>
        )}

        {/* Product grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
            <span className="text-6xl">🔍</span>
            <p className="text-lg font-medium">No se encontraron productos</p>
            <p className="text-sm">
              Intenta con otros términos o limpia los filtros
            </p>
            <button
              onClick={() => { setSearchQuery(""); resetFilters(); }}
              className="text-[#1e3a8a] font-medium hover:underline"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetail={setSelectedProduct}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="bg-white border border-gray-200 hover:border-[#1e3a8a] text-gray-700 hover:text-[#1e3a8a] font-medium px-8 py-3 rounded-xl transition-colors text-sm"
                >
                  Cargar más productos ({filteredProducts.length - paginatedProducts.length} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#1e3a8a] text-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold text-lg">Sociedades Bíblicas Unidas en Venezuela</p>
          <p className="text-blue-200 text-sm mt-1">
            Llevando la Palabra de Dios a cada rincón de Venezuela
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-blue-200">
            <a href="https://wa.me/584125383814" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              WhatsApp: 0412-5383814
            </a>
            <a href="https://wa.me/584125383824" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              0412-5383824
            </a>
          </div>
        </div>
      </footer>

      {/* Product detail modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
