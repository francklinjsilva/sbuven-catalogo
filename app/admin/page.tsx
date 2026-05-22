import type { Metadata } from "next";
import { getAllProductsFromSheets } from "@/lib/sheets-catalog";
import { AdminProductList } from "./AdminProductList";

export const metadata: Metadata = {
  title: "Panel de Administración | SBUVEN",
  robots: { index: false, follow: false },
};

export const revalidate = 0; // siempre fresco

export default async function AdminPage() {
  const products = await getAllProductsFromSheets();

  const inStock = products.filter((p) => p.enStock).length;
  const outOfStock = products.length - inStock;

  return (
    <AdminProductList
      products={products}
      stats={{ total: products.length, inStock, outOfStock }}
    />
  );
}
