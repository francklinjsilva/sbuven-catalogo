import productsData from "./products.json";
import type { Product } from "./types";

const products = productsData as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategories(): string[] {
  const cats = new Set<string>();
  products.forEach((p) => {
    p.categorias.forEach((c) => {
      if (c && c !== "Sin categorizar") cats.add(c);
    });
  });
  return Array.from(cats).sort();
}

export function getMainCategories(): string[] {
  const cats = new Set<string>();
  products.forEach((p) => {
    if (p.categoriaMain && p.categoriaMain !== "Sin categorizar") {
      cats.add(p.categoriaMain);
    }
  });
  return Array.from(cats).sort();
}

export function searchProducts(
  products: Product[],
  query: string
): Product[] {
  if (!query.trim()) return products;
  const q = query.toLowerCase().trim();
  return products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(q) ||
      p.isbn.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      p.autor.toLowerCase().includes(q) ||
      p.etiquetas.some((t) => t.toLowerCase().includes(q))
  );
}

export function filterProducts(
  products: Product[],
  filters: {
    categoria?: string;
    encuadernacion?: string;
    precioMin?: number;
    precioMax?: number;
    enStock?: boolean;
  }
): Product[] {
  return products.filter((p) => {
    if (
      filters.categoria &&
      !p.categorias.some(
        (c) => c.toLowerCase() === filters.categoria!.toLowerCase()
      ) &&
      p.categoriaMain.toLowerCase() !== filters.categoria!.toLowerCase()
    ) {
      return false;
    }
    if (
      filters.encuadernacion &&
      !p.encuadernacion
        .toLowerCase()
        .includes(filters.encuadernacion.toLowerCase())
    ) {
      return false;
    }
    if (filters.precioMin && p.precioFinal < filters.precioMin) return false;
    if (filters.precioMax && p.precioFinal > filters.precioMax) return false;
    if (filters.enStock && !p.enStock) return false;
    return true;
  });
}
