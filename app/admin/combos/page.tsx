import type { Metadata } from "next";
import Link from "next/link";
import { getAllCombos } from "@/lib/combos-catalog";
import { getAllProductsFromSheets } from "@/lib/sheets-catalog";
import { CombosAdmin } from "./CombosAdmin";

export const metadata: Metadata = { title: "Combos | SBUVEN Admin", robots: { index: false, follow: false } };
export const revalidate = 0;

export default async function CombosPage() {
  const [combos, products] = await Promise.all([getAllCombos(), getAllProductsFromSheets()]);
  return <CombosAdmin combos={combos} products={products} />;
}
