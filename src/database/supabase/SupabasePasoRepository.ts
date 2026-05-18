// src/database/supabase/SupabasePasoRepository.ts
import { supabaseClient, supabaseAdmin } from './Client';
import type { PasoRepository } from '../repositories/PasoRepository';
import type { Paso } from '../../interfaces/Paso';

export class SupabasePasoRepository implements PasoRepository {

  async obtenerTodos(): Promise<{ data?: Paso[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('pasos_gps').select('*').order('id');
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async activar(id: number, adminId: number): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin
      .from('pasos_gps')
      .update({ activa: true, admin_id: adminId, ultima_actualizacion: new Date().toISOString() })
      .eq('id', id);
    return { error: error?.message };
  }

  async desactivar(id: number): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin
      .from('pasos_gps')
      .update({ activa: false, latitud_actual: null, longitud_actual: null })
      .eq('id', id);
    return { error: error?.message };
  }

  async actualizarGPS(id: number, lat: number, lng: number): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin
      .from('pasos_gps')
      .update({
        latitud_actual: lat,
        longitud_actual: lng,
        ultima_actualizacion: new Date().toISOString(),
      })
      .eq('id', id);
    return { error: error?.message };
  }

  suscribirRealtime(onCambio: (paso: Paso) => void): () => void {
    const channel = supabaseClient
      .channel('pasos-gps')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pasos_gps' },
        (payload) => onCambio(payload.new as Paso)
      )
      .subscribe();

    return () => { supabaseClient.removeChannel(channel); };
  }
}
