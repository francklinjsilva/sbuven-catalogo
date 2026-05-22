import { getActiveProductsForCatalog } from "@/lib/sheets-catalog";
import { getMainCategories } from "@/lib/products";
import { Catalog } from "@/components/Catalog";

// Revalidate catalog every hour so changes in Google Sheets appear quickly
export const revalidate = 3600;

export default async function HomePage() {
  const products = await getActiveProductsForCatalog();
  const categories = getMainCategories();
  return <Catalog products={products} categories={categories} />;
}
