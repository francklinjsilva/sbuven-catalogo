export interface Product {
  id: string;
  sku: string;
  isbn: string;
  nombre: string;
  descripcionCorta: string;
  descripcion: string;
  precio: number;
  precioRebajado: number;
  precioFinal: number;
  enStock: boolean;
  stock: number;
  peso: number;
  dimensiones: number[];
  categorias: string[];
  categoriaMain: string;
  subCategorias: string[];
  imagenes: string[];
  imagen: string;
  etiquetas: string[];
  encuadernacion: string;
  tamanoLetra: string;
  tamanoBiblia: string;
  version: string;
  autor: string;
  editorial: string;
  paginas: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod =
  | "cashea"
  | "pago_movil"
  | "transferencia_bs"
  | "efectivo_bs"
  | "efectivo_usd"
  | "tarjeta_tienda";

export type ShippingMethod =
  | "paqueteria_mrw"
  | "paqueteria_zoom"
  | "delivery_caracas"
  | "retiro_tienda";

export interface CustomerInfo {
  nombre: string;
  apellido: string;
  cedula: string;       // e.g. "V-15761983" o "J-30721039-7"
  email: string;
  telefono: string;
  estado: string;
  municipio: string;
  direccion: string;    // calle, edificio, número de casa
  puntoReferencia: string;
  ciudad: string;       // derivado: estado + municipio (para la hoja)
  envio: string;        // label del método de envío
  mensaje: string;
}

export interface Order {
  id: string;
  fecha: string;
  cliente: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  formaPago: PaymentMethod;
  envio: ShippingMethod;
  estado: "pendiente" | "confirmado" | "completado";
}
