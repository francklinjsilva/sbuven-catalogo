import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Catálogo SBUVEN — Sociedades Bíblicas Unidas en Venezuela",
  description:
    "Catálogo oficial de Biblias y textos bíblicos de Sociedades Bíblicas Unidas en Venezuela. Más de 200 productos disponibles.",
  keywords: "Biblia, Venezuela, Reina Valera, Sociedades Bíblicas, SBUVEN",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
