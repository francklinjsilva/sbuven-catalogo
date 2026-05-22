// Tipos y constantes de pedidos — importable en client components (sin googleapis)

export type OrderStatus =
  | "pendiente"
  | "confirmado"
  | "preparando"
  | "listo_retiro"
  | "en_camino"
  | "despachado"
  | "entregado"
  | "retirado"
  | "cancelado";

export type ShippingMethod =
  | "retiro_tienda"
  | "delivery_caracas"
  | "paqueteria_mrw"
  | "paqueteria_zoom"
  | string;

export interface Order {
  id: string;
  fecha: string;
  cliente: string;
  cedula: string;
  email: string;
  telefono: string;
  estadoGeo: string;
  municipio: string;
  direccion: string;
  puntoRef: string;
  productos: string;
  cantItems: number;
  total: string;
  formaPago: string;
  envio: ShippingMethod;
  estadoPedido: OrderStatus;
  notas: string;
  numGuia?: string;
  rowNumber?: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pedido Recibido",
  confirmado: "Pago Confirmado",
  preparando: "En Preparación",
  listo_retiro: "Listo para Retirar",
  en_camino: "En Camino",
  despachado: "Despachado",
  entregado: "Entregado",
  retirado: "Retirado",
  cancelado: "Cancelado",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  preparando: "bg-purple-100 text-purple-800",
  listo_retiro: "bg-cyan-100 text-cyan-800",
  en_camino: "bg-orange-100 text-orange-800",
  despachado: "bg-indigo-100 text-indigo-800",
  entregado: "bg-green-100 text-green-800",
  retirado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export const SHIPPING_LABELS: Record<string, string> = {
  retiro_tienda: "Retiro en tienda",
  delivery_caracas: "Delivery Caracas",
  paqueteria_mrw: "MRW",
  paqueteria_zoom: "Zoom",
};

export const PAYMENT_LABELS: Record<string, string> = {
  pago_movil: "Pago Móvil",
  transferencia_bs: "Transferencia Bs.",
  efectivo_bs: "Efectivo Bs.",
  efectivo_usd: "Efectivo USD",
  cashea: "Cashea",
  tarjeta_tienda: "Tarjeta (tienda)",
};

/** Flujo de estados permitidos según método de envío */
export function getStatusFlow(envio: ShippingMethod): OrderStatus[] {
  if (envio === "retiro_tienda")
    return ["pendiente", "confirmado", "preparando", "listo_retiro", "retirado", "cancelado"];
  if (envio === "delivery_caracas")
    return ["pendiente", "confirmado", "preparando", "en_camino", "entregado", "cancelado"];
  return ["pendiente", "confirmado", "preparando", "despachado", "entregado", "cancelado"];
}
