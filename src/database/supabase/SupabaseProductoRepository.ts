import { supabaseClient, supabaseAdmin } from './Client';
import { traducirError } from '@/lib/utils';
import type { ProductoRepository } from '../repositories/ProductoRepository';
import type { Producto, Pedido, ProductoCreate } from '../../interfaces/Producto';

export class SupabaseProductoRepository implements ProductoRepository {

  async obtenerActivos(): Promise<{ data?: Producto[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('productos').select('*').eq('activo', true).order('categoria');
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async obtenerTodos(): Promise<{ data?: Producto[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('productos').select('*').order('categoria');
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async crearPedido(hermanoId: number, productoId: number, cantidad: number): Promise<{ data?: Pedido; error?: string }> {
    try {
      // Obtenemos precio actual
      const { data: producto } = await supabaseClient
        .from('productos').select('precio').eq('id', productoId).single();

      const total = (producto?.precio ?? 0) * cantidad;

      const { data, error } = await supabaseAdmin
        .from('pedidos')
        .insert([{ hermano_id: hermanoId, producto_id: productoId, cantidad, total }])
        .select().single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async obtenerTodosPedidos(): Promise<{ data?: Pedido[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('pedidos').select('*, hermanos(nombre, apellidos), productos(nombre)').order('fecha', { ascending: false });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async crearProducto(datos: ProductoCreate): Promise<{ data?: Producto; error?: string }> {
    try {
      const { data, error } = await supabaseAdmin.from('productos').insert([datos]).select().single();
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async actualizarProducto(id: number, datos: Partial<ProductoCreate>): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('productos').update(datos).eq('id', id);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async eliminarProducto(id: number): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('productos').delete().eq('id', id);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async actualizarEstadoPedido(pedidoId: number, estado: 'pendiente' | 'pagado' | 'entregado'): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('pedidos').update({ estado }).eq('id', pedidoId);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async eliminarPedido(pedidoId: number): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('pedidos').delete().eq('id', pedidoId);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async actualizarStock(productoId: number, stock: number): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('productos').update({ stock }).eq('id', productoId);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async subirImagen(file: File): Promise<{ url?: string; error?: string }> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from('productos')
      .upload(path, file, { upsert: false });
    if (error) {
      if (error.message.toLowerCase().includes('bucket')) {
        return { error: 'Bucket no encontrado. Ve a Supabase → Storage → New bucket → nombre: "productos", público: activado.' };
      }
      return { error: traducirError(error.message) };
    }
    const { data } = supabaseAdmin.storage.from('productos').getPublicUrl(path);
    return { url: data.publicUrl };
  }
}
