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
  | "transferencia_usd"
  | "efectivo_usd";

export interface CustomerInfo {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  mensaje: string;
}

export interface Order {
  id: string;
  fecha: string;
  cliente: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  formaPago: PaymentMethod;
  estado: "pendiente" | "confirmado" | "completado";
}
