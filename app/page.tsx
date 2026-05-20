import { getAllProducts, getMainCategories } from "@/lib/products";
import { Catalog } from "@/components/Catalog";

export default function HomePage() {
  const products = getAllProducts();
  const categories = getMainCategories();
  return <Catalog products={products} categories={categories} />;
}
