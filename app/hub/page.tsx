import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ShoppingBag, Package, Users, ExternalLink, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Hub SBUVEN — Sistema de Gestión",
  robots: { index: false, follow: false },
};

const MODULES = [
  {
    key: "catalogo",
    icon: BookOpen,
    label: "Catálogo",
    sublabel: "Tienda pública",
    description: "Visualiza el catálogo tal como lo ven los clientes. Explora productos, precios y disponibilidad.",
    href: "/",
    external: true,
    color: "from-[#1e3a8a] to-[#1e40af]",
    badge: null,
    action: "Ver catálogo",
  },
  {
    key: "ventas",
    icon: ShoppingBag,
    label: "Ventas",
    sublabel: "Gestión de pedidos",
    description: "Revisa los pedidos recibidos, confirma pagos, actualiza estados y registra números de guía.",
    href: "/ventas",
    external: false,
    color: "from-amber-600 to-amber-500",
    badge: null,
    action: "Ingresar a Ventas",
  },
  {
    key: "inventario",
    icon: Package,
    label: "Inventario",
    sublabel: "Admin del catálogo",
    description: "Edita productos, ajusta precios, activa o desactiva artículos y gestiona combos.",
    href: "/admin",
    external: false,
    color: "from-[#1e3a8a] to-indigo-700",
    badge: null,
    action: "Ingresar a Inventario",
  },
  {
    key: "crm",
    icon: Users,
    label: "CRM",
    sublabel: "Base de clientes",
    description: "Gestiona los datos de clientes, sincroniza desde pedidos y lleva un historial de compras.",
    href: "/crm",
    external: false,
    color: "from-teal-700 to-teal-600",
    badge: null,
    action: "Ingresar al CRM",
  },
];

export default function HubPage() {
  return (
    <div className="min-h-screen bg-[#0f1f4d] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="bg-amber-500 rounded-xl p-2.5">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">SBUVEN</p>
            <p className="text-blue-300 text-xs">Sociedades Bíblicas Unidas en Venezuela</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="text-center px-6 pt-14 pb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Sistema de Gestión
        </h1>
        <p className="text-blue-200 text-base max-w-md mx-auto">
          Accede a los módulos del catálogo digital de SBUVEN según tu rol en el equipo.
        </p>
      </div>

      {/* Módulos */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pb-16">
        <div className="grid sm:grid-cols-2 gap-5">
          {MODULES.map(mod => {
            const Icon = mod.icon;
            const CardContent = (
              <div className={`group relative bg-gradient-to-br ${mod.color} rounded-2xl p-6 flex flex-col gap-4 h-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden`}>
                {/* Fondo decorativo */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                <div className="flex items-start justify-between relative">
                  <div className="bg-white/20 rounded-xl p-3">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  {mod.external ? (
                    <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors mt-1" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors mt-1 group-hover:translate-x-0.5 duration-200" />
                  )}
                </div>

                <div className="relative flex-1">
                  <p className="text-white font-bold text-xl leading-tight">{mod.label}</p>
                  <p className="text-white/60 text-xs font-medium mt-0.5 uppercase tracking-wider">{mod.sublabel}</p>
                  <p className="text-white/80 text-sm mt-3 leading-relaxed">{mod.description}</p>
                </div>

                <div className="relative">
                  <div className="bg-white/15 hover:bg-white/25 transition-colors text-white text-sm font-semibold py-2.5 px-4 rounded-xl text-center">
                    {mod.action}
                  </div>
                </div>
              </div>
            );

            return mod.external ? (
              <a key={mod.key} href={mod.href} target="_blank" rel="noopener noreferrer" className="flex">
                {CardContent}
              </a>
            ) : (
              <Link key={mod.key} href={mod.href} className="flex">
                {CardContent}
              </Link>
            );
          })}
        </div>

        {/* Info de acceso */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Accesos y contraseñas</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { module: "Ventas", desc: "Contraseña del equipo comercial", icon: ShoppingBag },
              { module: "Inventario", desc: "Contraseña de administración", icon: Package },
              { module: "CRM", desc: "Misma contraseña de administración", icon: Users },
            ].map(item => {
              const ItemIcon = item.icon;
              return (
                <div key={item.module} className="flex gap-3 items-start">
                  <div className="bg-white/10 rounded-lg p-2 shrink-0">
                    <ItemIcon className="w-4 h-4 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.module}</p>
                    <p className="text-blue-300 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4 text-center">
        <p className="text-blue-400 text-xs">
          catalogo.sociedadesbiblicas.org.ve — Solo para uso interno del equipo SBUVEN
        </p>
      </footer>
    </div>
  );
}
