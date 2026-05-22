import { Users } from "lucide-react";

export default function CRMLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#1e3a8a] h-14 flex items-center px-6 gap-3 shadow-lg">
        <Users className="w-5 h-5 text-amber-400" />
        <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-7 w-12 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 animate-pulse">
          <div className="h-9 bg-gray-100 rounded-lg w-full" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="px-4 py-3.5 border-b border-gray-50 flex gap-4 animate-pulse">
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
              <div className="h-5 w-24 bg-gray-100 rounded-full" />
              <div className="h-5 w-20 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Cargando base de clientes…
        </p>
      </div>
    </div>
  );
}
