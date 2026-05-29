import { supabaseClient, supabaseAdmin } from './Client';
import { traducirError } from '@/lib/utils';
import type { HermanoRepository, RegistroDatos, EditarHermanoDatos, CrearPorAdminDatos } from '../repositories/HermanoRepository';
import type { Hermano, SessionHermano } from '../../interfaces/Hermano';

export class SupabaseHermanoRepository implements HermanoRepository {

  async registrar(datos: RegistroDatos): Promise<{ success: boolean; error?: string }> {
    try {
      const camposRequeridos: [string | undefined, string][] = [
        [datos.nombre?.trim(), 'El nombre es obligatorio'],
        [datos.apellidos?.trim(), 'Los apellidos son obligatorios'],
        [datos.email?.trim(), 'El email es obligatorio'],
        [datos.password, 'La contraseña es obligatoria'],
        [datos.telefono?.trim(), 'El teléfono es obligatorio'],
        [datos.direccion?.trim(), 'La dirección es obligatoria'],
        [datos.fecha_nacimiento?.trim(), 'La fecha de nacimiento es obligatoria'],
        [datos.genero, 'El género es obligatorio'],
      ];
      for (const [valor, mensaje] of camposRequeridos) {
        if (!valor) throw new Error(mensaje);
      }

      let createResult = await supabaseAdmin.auth.admin.createUser({
        email: datos.email,
        password: datos.password,
        email_confirm: true,
      });

      // Si el email ya existe en Auth, intentar limpiar registro huérfano y reintentar
      if (createResult.error) {
        const m = createResult.error.message.toLowerCase();
        if (m.includes('already') || m.includes('email already exists')) {
          const { data: existing } = await supabaseAdmin
            .from('hermanos').select('id').eq('email', datos.email).maybeSingle();
          if (!existing) {
            // Auth user huérfano: hacer sign in para obtener su ID, borrarlo y reintentar
            const { data: signInData } = await supabaseAdmin.auth.signInWithPassword({
              email: datos.email!,
              password: datos.password!,
            });
            if (signInData?.user) {
              await supabaseAdmin.auth.admin.deleteUser(signInData.user.id);
              await supabaseAdmin.auth.signOut();
              createResult = await supabaseAdmin.auth.admin.createUser({
                email: datos.email,
                password: datos.password,
                email_confirm: true,
              });
            }
          }
        }
        if (createResult.error) throw createResult.error;
      }

      const authData = createResult.data;
      if (!authData.user) throw new Error('No se pudo crear el usuario de autenticación.');

      // Subir foto de bautismo si se ha aportado
      let foto_bautismo_url: string | null = null;
      if (datos.bautizado && datos.foto_bautismo) {
        const ext = datos.foto_bautismo.name.split('.').pop() ?? 'jpg';
        const path = `${authData.user.id}/bautismo.${ext}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from('bautismos')
          .upload(path, datos.foto_bautismo, { upsert: true });
        if (uploadError) {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          throw uploadError;
        }
        const { data: urlData } = supabaseAdmin.storage
          .from('bautismos')
          .getPublicUrl(path);
        foto_bautismo_url = urlData.publicUrl;
      }

      const { error: dbError } = await supabaseAdmin
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
          foto_bautismo_url,
        }]);

      if (dbError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw dbError;
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: traducirError(error.message) };
    }
  }

  async login(email: string, password: string): Promise<{ data?: SessionHermano; error?: string }> {
    try {
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Usuario no encontrado.');

      const { data: hermano, error: hermanoError } = await supabaseAdmin
        .from('hermanos').select('*').eq('auth_id', authData.user.id).maybeSingle();

      if (hermanoError) { await supabaseClient.auth.signOut(); throw hermanoError; }
      if (!hermano) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        await supabaseClient.auth.signOut();
        throw new Error('Tu registro anterior no se completó correctamente. Ya puedes volver a registrarte con el mismo correo.');
      }

      return { data: { user: { id: authData.user.id, email: authData.user.email! }, hermano } };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async logout(): Promise<{ error?: string }> {
    const { error } = await supabaseClient.auth.signOut();
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async obtenerPorAuthId(authId: string): Promise<{ data?: Hermano; error?: string }> {
    try {
      const { data, error } = await supabaseClient.from('hermanos').select('*').eq('auth_id', authId).single();
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async obtenerTodos(): Promise<{ data?: Hermano[]; error?: string }> {
    try {
      const { data, error } = await supabaseAdmin.from('hermanos').select('*').order('apellidos', { ascending: true });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async actualizarPreferencia(hermanoId: number, preferencia: string): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('hermanos').update({ preferencia_paso: preferencia }).eq('id', hermanoId);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async marcarPagoPresencial(hermanoId: number): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('hermanos').update({ pago_presencial: true, estado: 'activo', es_cofrade: true }).eq('id', hermanoId);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async activarCofrade(hermanoId: number): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('hermanos').update({ estado: 'activo', es_cofrade: true }).eq('id', hermanoId);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async editarHermano(hermanoId: number, datos: EditarHermanoDatos): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('hermanos').update(datos).eq('id', hermanoId);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async darDeBaja(hermanoId: number): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin
      .from('hermanos')
      .update({ estado: 'baja', es_cofrade: false })
      .eq('id', hermanoId);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async cambiarRol(hermanoId: number, rol: import('../../interfaces/Hermano').RolUsuario): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('hermanos').update({ rol }).eq('id', hermanoId);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async crearPorAdmin(datos: CrearPorAdminDatos): Promise<{ error?: string }> {
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: datos.email,
        password: datos.password,
        email_confirm: true,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario de autenticación.');

      const { error: dbError } = await supabaseAdmin.from('hermanos').insert([{
        auth_id: authData.user.id,
        email: datos.email,
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        genero: datos.genero,
        direccion: datos.direccion,
        fecha_nacimiento: datos.fecha_nacimiento,
        telefono: datos.telefono,
        rol: datos.rol,
        estado: datos.estado,
        es_cofrade: datos.estado === 'activo',
        bautizado: datos.bautizado,
        foto_bautismo_url: null,
      }]);

      if (dbError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw dbError;
      }
      return {};
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async eliminar(hermanoId: number, authId: string | null): Promise<{ error?: string }> {
    try {
      const { error: dbError } = await supabaseAdmin.from('hermanos').delete().eq('id', hermanoId);
      if (dbError) throw dbError;
      if (authId) {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authId);
        if (authError) throw authError;
      }
      return {};
    } catch (error: any) {
      return { error: traducirError(error.message) };
    }
  }

  async subirFotoBautismo(authId: string, file: File): Promise<{ url?: string; error?: string }> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${authId}/bautismo.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from('bautismos')
      .upload(path, file, { upsert: true });
    if (error) return { error: traducirError(error.message) };
    const { data } = supabaseAdmin.storage.from('bautismos').getPublicUrl(path);
    return { url: data.publicUrl };
  }

  async verificarBautismo(hermanoId: number, verificado: boolean): Promise<{ error?: string }> {
    const { error } = await supabaseAdmin.from('hermanos').update({ bautismo_verificado: verificado }).eq('id', hermanoId);
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async recuperarPassword(email: string): Promise<{ error?: string }> {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ? traducirError(error.message) : undefined };
  }

  async actualizarPassword(password: string): Promise<{ error?: string }> {
    const { error } = await supabaseClient.auth.updateUser({ password });
    return { error: error?.message ? traducirError(error.message) : undefined };
  }
}
