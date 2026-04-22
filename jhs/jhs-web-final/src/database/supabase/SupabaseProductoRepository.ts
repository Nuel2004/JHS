import { supabaseClient } from './Client';
import type { ProductoRepository } from '../repositories/ProductoRepository';
import type { Producto, Pedido } from '../../interfaces/Producto';

export class SupabaseProductoRepository implements ProductoRepository {

  async obtenerActivos(): Promise<{ data?: Producto[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('productos').select('*').eq('activo', true).order('categoria');
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async obtenerTodos(): Promise<{ data?: Producto[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('productos').select('*').order('categoria');
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async crearPedido(hermanoId: number, productoId: number, cantidad: number): Promise<{ data?: Pedido; error?: string }> {
    try {
      // Obtenemos precio actual
      const { data: producto } = await supabaseClient
        .from('productos').select('precio').eq('id', productoId).single();

      const total = (producto?.precio ?? 0) * cantidad;

      const { data, error } = await supabaseClient
        .from('pedidos')
        .insert([{ hermano_id: hermanoId, producto_id: productoId, cantidad, total }])
        .select().single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async obtenerPedidosPorHermano(hermanoId: number): Promise<{ data?: Pedido[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('pedidos').select('*').eq('hermano_id', hermanoId).order('fecha', { ascending: false });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async obtenerTodosPedidos(): Promise<{ data?: Pedido[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('pedidos').select('*, hermanos(nombre, apellidos), productos(nombre)').order('fecha', { ascending: false });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async actualizarStock(productoId: number, stock: number): Promise<{ error?: string }> {
    const { error } = await supabaseClient.from('productos').update({ stock }).eq('id', productoId);
    return { error: error?.message };
  }
}
