// Tipos CRM — importable en client components (sin googleapis)

export type ClientType = "natural" | "empresa" | "iglesia" | "libreria" | "otro";

export interface Client {
  id: string;            // A: CLI-0001
  nombre: string;        // B
  cedula: string;        // C: Cédula / RIF
  email: string;         // D
  telefono: string;      // E
  estadoGeo: string;     // F: Estado venezolano
  municipio: string;     // G
  direccion: string;     // H
  tipo: ClientType;      // I
  etiquetas: string[];   // J: separadas por |
  notas: string;         // K
  fechaRegistro: string; // L
  origen: "manual" | "catalogo"; // M
  rowNumber?: number;
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  natural:  "Persona natural",
  empresa:  "Empresa",
  iglesia:  "Iglesia / Ministerio",
  libreria: "Librería / Revendedor",
  otro:     "Otro",
};

export const CLIENT_TYPE_COLORS: Record<ClientType, string> = {
  natural:  "bg-blue-100 text-blue-800",
  empresa:  "bg-purple-100 text-purple-800",
  iglesia:  "bg-amber-100 text-amber-800",
  libreria: "bg-green-100 text-green-800",
  otro:     "bg-gray-100 text-gray-800",
};
