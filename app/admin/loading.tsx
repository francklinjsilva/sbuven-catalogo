import { BookOpen } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header skeleton */}
      <div className="bg-[#1e3a8a] h-14 flex items-center px-6 gap-3 shadow-lg">
        <BookOpen className="w-5 h-5 text-amber-400" />
        <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-7 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 animate-pulse">
          <div className="h-9 bg-gray-100 rounded-lg w-full" />
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 animate-pulse">
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-3.5 border-b border-gray-50 flex gap-4 animate-pulse">
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="h-4 flex-1 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-14 bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        {/* Mensaje centrado */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Cargando productos desde el catálogo…
        </p>
      </div>
    </div>
  );
}
