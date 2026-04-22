export type CategoriaProducto = 'Palma' | 'Traje' | 'Merchandising';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  categoria: CategoriaProducto | null;
  imagen_url: string | null;
  activo: boolean;
}

export interface Pedido {
  id: number;
  hermano_id: number;
  producto_id: number;
  cantidad: number;
  total: number;
  estado: 'pendiente' | 'pagado' | 'entregado';
  pago_id: number | null;
  fecha: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}
