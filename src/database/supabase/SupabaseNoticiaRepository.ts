import { supabaseClient, supabaseAdmin } from './Client';
import { traducirError } from '@/lib/utils';
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
      return { error: traducirError(error.message) };
    }
  }

  async obtenerPorId(id: number): Promise<{ data?: Noticia; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('noticias').select('*').eq('id', id).single();
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async crear(noticia: NoticiaCreate, autorId: number): Promise<{ data?: Noticia; error?: string }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('noticias')
        .insert([{ ...noticia, autor_id: autorId }])
        .select()
        .single();
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async editar(id: number, cambios: Partial<NoticiaCreate>): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('noticias').update(cambios).eq('id', id);
    return { error: traducirError(error?.message) };
  }

  async eliminar(id: number): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('noticias').delete().eq('id', id);
    return { error: traducirError(error?.message) };
  }

  async obtenerTodas(): Promise<{ data?: Noticia[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('noticias').select('*').order('fecha_publicacion', { ascending: false });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async subirImagen(file: File): Promise<{ url?: string; error?: string }> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from('noticias')
      .upload(path, file, { upsert: false });
    if (error) {
      if (error.message.toLowerCase().includes('bucket')) {
        return { error: 'Bucket no encontrado. Ve a Supabase → Storage → New bucket → nombre: "noticias", público: activado.' };
      }
      return { error: traducirError(error.message) };
    }
    const { data } = supabaseAdmin.storage.from('noticias').getPublicUrl(path);
    return { url: data.publicUrl };
  }
}
