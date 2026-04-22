import { supabaseClient } from './Client';
import type { NoticiaRepository } from '../repositories/NoticiaRepository';
import type { Noticia, NoticiaCreate } from '../../interfaces/Noticia';

export class SupabaseNoticiaRepository implements NoticiaRepository {

  async obtenerPublicadas(): Promise<{ data?: Noticia[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('noticias')
        .select('*')
        .eq('publicada', true)
        .order('fecha_publicacion', { ascending: false });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async obtenerPorId(id: number): Promise<{ data?: Noticia; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('noticias').select('*').eq('id', id).single();
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async crear(noticia: NoticiaCreate, autorId: number): Promise<{ data?: Noticia; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('noticias')
        .insert([{ ...noticia, autor_id: autorId }])
        .select()
        .single();
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async editar(id: number, cambios: Partial<NoticiaCreate>): Promise<{ error?: string }> {
    const { error } = await supabaseClient.from('noticias').update(cambios).eq('id', id);
    return { error: error?.message };
  }

  async eliminar(id: number): Promise<{ error?: string }> {
    const { error } = await supabaseClient.from('noticias').delete().eq('id', id);
    return { error: error?.message };
  }

  async obtenerTodas(): Promise<{ data?: Noticia[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('noticias').select('*').order('fecha_publicacion', { ascending: false });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}
