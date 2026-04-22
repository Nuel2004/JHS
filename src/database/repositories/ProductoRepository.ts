import type { Producto, Pedido } from '../../interfaces/Producto';

export interface ProductoRepository {
  /** Obtiene todos los productos activos */
  obtenerActivos(): Promise<{ data?: Producto[]; error?: string }>;

  /** Obtiene todos los productos — solo admin */
  obtenerTodos(): Promise<{ data?: Producto[]; error?: string }>;

  /** Crea un pedido para un hermano */
  crearPedido(
    hermanoId: number,
    productoId: number,
    cantidad: number
  ): Promise<{ data?: Pedido; error?: string }>;

  /** Obtiene los pedidos de un hermano */
  obtenerPedidosPorHermano(hermanoId: number): Promise<{ data?: Pedido[]; error?: string }>;

  /** Obtiene todos los pedidos — solo admin */
  obtenerTodosPedidos(): Promise<{ data?: Pedido[]; error?: string }>;

  /** Actualiza stock de un producto — solo admin */
  actualizarStock(productoId: number, stock: number): Promise<{ error?: string }>;
}
