import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProductsFromSheets } from "@/lib/sheets-catalog";
import { ProductEditor } from "./ProductEditor";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Editar Producto | SBUVEN Admin",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getAllProductsFromSheets();
  const product = products.find((p) => p.id === id);

  if (!product) notFound();

  return <ProductEditor product={product} />;
}
