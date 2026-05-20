import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = "https://catalogo.sociedadesbiblicas.org.ve";

export const metadata: Metadata = {
  // ── Título ──────────────────────────────────────────────────────────────────
  // Template: las sub-páginas pueden sobreescribir "%s | SBUVEN"
  title: {
    default: "Compra Biblias en Venezuela | Catálogo Oficial SBUVEN",
    template: "%s | SBUVEN Venezuela",
  },

  // ── Descripción ─────────────────────────────────────────────────────────────
  description:
    "Compra Biblias, literatura cristiana e infantil con envío a todo Venezuela. " +
    "Reina Valera, NVI, DHH y más. Pago Móvil, Cashea y tasa BCV actualizada. " +
    "Tienda oficial de Sociedades Bíblicas Unidas en Venezuela (SBUVEN), Caracas.",

  // ── Keywords ────────────────────────────────────────────────────────────────
  keywords: [
    "Biblia Venezuela",
    "comprar Biblia Venezuela",
    "Biblia Reina Valera Venezuela",
    "Biblia NVI Venezuela",
    "Biblia DHH Venezuela",
    "literatura cristiana Venezuela",
    "tienda bíblica Caracas",
    "Sociedades Bíblicas Venezuela",
    "SBUVEN",
    "Biblia online Venezuela",
    "devocionales Venezuela",
    "libros religiosos Venezuela",
    "Biblia pago móvil Venezuela",
    "Biblia Cashea Venezuela",
    "recursos bíblicos Venezuela",
  ],

  // ── Autor / Organización ────────────────────────────────────────────────────
  authors: [{ name: "Sociedades Bíblicas Unidas en Venezuela" }],
  creator: "SBUVEN",
  publisher: "Sociedades Bíblicas Unidas en Venezuela",

  // ── Canónica ─────────────────────────────────────────────────────────────────
  alternates: {
    canonical: SITE_URL,
  },

  // ── Robots ──────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Open Graph (Facebook, WhatsApp, LinkedIn) ────────────────────────────────
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: SITE_URL,
    siteName: "Catálogo SBUVEN",
    title: "Compra Biblias en Venezuela | Catálogo Oficial SBUVEN",
    description:
      "Biblias, literatura cristiana e infantil con envío a todo Venezuela. " +
      "Pago Móvil, Cashea, tasa BCV. Tienda oficial de Sociedades Bíblicas (SBUVEN).",
    // Next.js sirve la OG image automáticamente desde app/opengraph-image.tsx
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Catálogo SBUVEN — Biblias y Literatura Cristiana en Venezuela",
      },
    ],
  },

  // ── Twitter / X Card ─────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Compra Biblias en Venezuela | Catálogo Oficial SBUVEN",
    description:
      "Biblias, literatura cristiana e infantil con envío a todo Venezuela. Pago Móvil, Cashea, tasa BCV.",
    images: [`${SITE_URL}/opengraph-image`],
  },

  // ── Verificación de propiedad (agregar IDs cuando los tengas) ────────────────
  // verification: {
  //   google: "TU_GOOGLE_SEARCH_CONSOLE_TOKEN",
  // },
};

// ── Schema.org JSON-LD ────────────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // Organización
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Sociedades Bíblicas Unidas en Venezuela",
      alternateName: "SBUVEN",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        width: 300,
        height: 100,
      },
      description:
        "Distribuidora oficial de Biblias y literatura cristiana en Venezuela desde 1807.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Urbanización La Urbina",
        addressLocality: "Caracas",
        addressRegion: "Distrito Capital",
        addressCountry: "VE",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+58-412-5383814",
          contactType: "customer service",
          availableLanguage: "Spanish",
          contactOption: "TollFree",
        },
      ],
      foundingDate: "1807",
      areaServed: {
        "@type": "Country",
        name: "Venezuela",
      },
    },
    // Sitio web con buscador
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Catálogo SBUVEN",
      description:
        "Catálogo oficial de Biblias y literatura cristiana de Sociedades Bíblicas Unidas en Venezuela.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "es-VE",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    // Tienda local (Local Business)
    {
      "@type": ["Store", "LocalBusiness"],
      "@id": `${SITE_URL}/#store`,
      name: "Sociedades Bíblicas Unidas en Venezuela — Tienda Urbina",
      image: `${SITE_URL}/og-image.jpg`,
      url: SITE_URL,
      telephone: "+58-412-5383814",
      priceRange: "$$",
      currenciesAccepted: "USD, VES",
      paymentAccepted: "Cash, Mobile Payment, Bank Transfer",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Urbanización La Urbina",
        addressLocality: "Caracas",
        addressRegion: "Distrito Capital",
        addressCountry: "VE",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 10.4806,
        longitude: -66.8792,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "17:00",
        },
      ],
      hasMap: "https://maps.google.com/?q=Urbanización+La+Urbina,+Caracas,+Venezuela",
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
