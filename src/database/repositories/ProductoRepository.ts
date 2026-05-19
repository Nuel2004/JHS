import type { Producto, Pedido, ProductoCreate } from '../../interfaces/Producto';

export interface ProductoRepository {
  /** Obtiene todos los productos activos */
  obtenerActivos(): Promise<{ data?: Producto[]; error?: string }>;

  /** Obtiene todos los productos — solo admin */
  obtenerTodos(): Promise<{ data?: Producto[]; error?: string }>;

  /** Crea un nuevo producto — solo admin */
  crearProducto(datos: ProductoCreate): Promise<{ data?: Producto; error?: string }>;

  /** Actualiza los campos de un producto — solo admin */
  actualizarProducto(id: number, datos: Partial<ProductoCreate>): Promise<{ error?: string }>;

  /** Elimina un producto — solo admin */
  eliminarProducto(id: number): Promise<{ error?: string }>;

  /** Crea un pedido para un hermano */
  crearPedido(
    hermanoId: number,
    productoId: number,
    cantidad: number
  ): Promise<{ data?: Pedido; error?: string }>;

  /** Obtiene todos los pedidos — solo admin */
  obtenerTodosPedidos(): Promise<{ data?: Pedido[]; error?: string }>;

  /** Actualiza el estado de un pedido — solo admin */
  actualizarEstadoPedido(pedidoId: number, estado: 'pendiente' | 'pagado' | 'entregado'): Promise<{ error?: string }>;

  /** Elimina un pedido — solo admin */
  eliminarPedido(pedidoId: number): Promise<{ error?: string }>;

  /** Actualiza stock de un producto — solo admin */
  actualizarStock(productoId: number, stock: number): Promise<{ error?: string }>;

  /** Sube una imagen al bucket de productos y devuelve la URL pública */
  subirImagen(file: File): Promise<{ url?: string; error?: string }>;
}
