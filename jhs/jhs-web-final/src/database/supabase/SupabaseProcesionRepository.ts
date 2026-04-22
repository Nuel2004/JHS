import { supabaseClient } from './Client';
import type { ProcesionRepository } from '../repositories/ProcesionRepository';
import type { ProcesionEstado, RecorridoPunto } from '../../interfaces/Procesion';

export class SupabaseProcesionRepository implements ProcesionRepository {

  async obtenerEstado(): Promise<{ data?: ProcesionEstado; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('procesion_estado').select('*').eq('id', 1).single();
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async obtenerRecorrido(): Promise<{ data?: RecorridoPunto[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('recorrido_puntos').select('*').eq('activo', true).order('orden');
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async activar(adminId: number): Promise<{ error?: string }> {
    const { error } = await supabaseClient
      .from('procesion_estado')
      .update({ activa: true, admin_id: adminId, ultima_actualizacion: new Date().toISOString() })
      .eq('id', 1);
    return { error: error?.message };
  }

  async desactivar(): Promise<{ error?: string }> {
    const { error } = await supabaseClient
      .from('procesion_estado')
      .update({ activa: false, latitud_actual: null, longitud_actual: null })
      .eq('id', 1);
    return { error: error?.message };
  }

  async actualizarGPS(lat: number, lng: number): Promise<{ error?: string }> {
    const { error } = await supabaseClient
      .from('procesion_estado')
      .update({ latitud_actual: lat, longitud_actual: lng, ultima_actualizacion: new Date().toISOString() })
      .eq('id', 1);
    return { error: error?.message };
  }

  suscribirRealtime(onCambio: (estado: ProcesionEstado) => void): () => void {
    const channel = supabaseClient
      .channel('procesion-gps')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'procesion_estado', filter: 'id=eq.1' },
        (payload) => onCambio(payload.new as ProcesionEstado)
      )
      .subscribe();

    return () => { supabaseClient.removeChannel(channel); };
  }
}
