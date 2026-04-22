import { supabaseClient } from './Client';
import type { HermanoRepository, RegistroDatos, EditarHermanoDatos } from '../repositories/HermanoRepository';
import type { Hermano, SessionHermano } from '../../interfaces/Hermano';

export class SupabaseHermanoRepository implements HermanoRepository {

  async registrar(datos: RegistroDatos): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: datos.email,
        password: datos.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario de autenticación.');

      const { error: dbError } = await supabaseClient
        .from('hermanos')
        .insert([{
          auth_id: authData.user.id,
          email: datos.email,
          nombre: datos.nombre,
          apellidos: datos.apellidos,
          genero: datos.genero,
          direccion: datos.direccion,
          fecha_nacimiento: datos.fecha_nacimiento,
          telefono: datos.telefono,
          rol: 'hermano',
          estado: datos.quiere_ser_hermano ? 'pendiente_pago' : 'baja',
          es_cofrade: false,
          bautizado: datos.bautizado,
        }]);

      if (dbError) throw dbError;
      return { success: true };
    } catch (error: any) {
      console.error('SupabaseHermanoRepository.registrar:', error.message);
      return { success: false, error: error.message };
    }
  }

  async login(email: string, password: string): Promise<{ data?: SessionHermano; error?: string }> {
    try {
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Usuario no encontrado.');

      const { data: hermano, error: hermanoError } = await supabaseClient
        .from('hermanos').select('*').eq('auth_id', authData.user.id).single();

      if (hermanoError) { await supabaseClient.auth.signOut(); throw hermanoError; }

      return { data: { user: { id: authData.user.id, email: authData.user.email! }, hermano } };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async logout(): Promise<{ error?: string }> {
    const { error } = await supabaseClient.auth.signOut();
    return { error: error?.message };
  }

  async obtenerPorAuthId(authId: string): Promise<{ data?: Hermano; error?: string }> {
    try {
      const { data, error } = await supabaseClient.from('hermanos').select('*').eq('auth_id', authId).single();
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async obtenerTodos(): Promise<{ data?: Hermano[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient.from('hermanos').select('*').order('apellidos', { ascending: true });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async actualizarPreferencia(hermanoId: number, preferencia: string): Promise<{ error?: string }> {
    const { error } = await supabaseClient.from('hermanos').update({ preferencia_paso: preferencia }).eq('id', hermanoId);
    return { error: error?.message };
  }

  async marcarPagoPresencial(hermanoId: number): Promise<{ error?: string }> {
    const { error } = await supabaseClient.from('hermanos').update({ pago_presencial: true, estado: 'activo', es_cofrade: true }).eq('id', hermanoId);
    return { error: error?.message };
  }

  async activarCofrade(hermanoId: number): Promise<{ error?: string }> {
    const { error } = await supabaseClient.from('hermanos').update({ estado: 'activo', es_cofrade: true }).eq('id', hermanoId);
    return { error: error?.message };
  }

  async editarHermano(hermanoId: number, datos: EditarHermanoDatos): Promise<{ error?: string }> {
    const { error } = await supabaseClient.from('hermanos').update(datos).eq('id', hermanoId);
    return { error: error?.message };
  }

  async darDeBaja(hermanoId: number): Promise<{ error?: string }> {
    const { error } = await supabaseClient
      .from('hermanos')
      .update({ estado: 'baja', es_cofrade: false })
      .eq('id', hermanoId);
    return { error: error?.message };
  }

  async recuperarPassword(email: string): Promise<{ error?: string }> {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message };
  }
}
