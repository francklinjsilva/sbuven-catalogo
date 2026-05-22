import type { Metadata } from "next";
import { getAllOrders } from "@/lib/orders-sheet";
import { SalesDashboard } from "./SalesDashboard";

export const metadata: Metadata = {
  title: "Ventas | SBUVEN",
  robots: { index: false, follow: false },
};
export const revalidate = 0;

export default async function VentasPage() {
  const orders = await getAllOrders();
  return <SalesDashboard orders={orders} />;
}
