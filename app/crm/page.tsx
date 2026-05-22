import type { Metadata } from "next";
import { getAllClients } from "@/lib/crm-sheet";
import { CRMDashboard } from "./CRMDashboard";

export const metadata: Metadata = {
  title: "CRM Clientes | SBUVEN",
  robots: { index: false, follow: false },
};
export const revalidate = 0;

export default async function CRMPage() {
  const clients = await getAllClients();
  return <CRMDashboard initialClients={clients} />;
}
